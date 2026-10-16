package components

import (
	"fmt"
	"strings"
	"workshop/internal/domain/sighting"
)

// CircadianBucket holds the real count and percentage of sightings for a time-of-day window.
type CircadianBucket struct {
	Key     string
	Label   string
	Swahili string
	Hours   string
	Count   int
	Percent int
}

// CircadianBreakdown computes the distribution of sightings across Dawn, Day, Dusk, and Night.
func CircadianBreakdown(sightings []sighting.Sighting) []CircadianBucket {
	counts := map[string]int{
		"dawn":  0,
		"day":   0,
		"dusk":  0,
		"night": 0,
	}
	known := 0
	for _, s := range sightings {
		k := light(s.HappenedAt)
		if k != "" {
			counts[k]++
			known++
		}
	}
	if known == 0 {
		known = 1
	}
	pct := func(n int) int {
		p := (n * 100) / known
		if n > 0 && p < 6 {
			return 6
		}
		return p
	}
	return []CircadianBucket{
		{Key: "dawn", Label: "First light", Swahili: "Alfajiri", Hours: "05:00 – 08:00", Count: counts["dawn"], Percent: pct(counts["dawn"])},
		{Key: "day", Label: "Daylight", Swahili: "Mchana", Hours: "08:00 – 16:00", Count: counts["day"], Percent: pct(counts["day"])},
		{Key: "dusk", Label: "Golden hour", Swahili: "Machweo", Hours: "16:00 – 20:00", Count: counts["dusk"], Percent: pct(counts["dusk"])},
		{Key: "night", Label: "After dark", Swahili: "Usiku", Hours: "20:00 – 05:00", Count: counts["night"], Percent: pct(counts["night"])},
	}
}

// Postmark returns an uppercase stamp location string from a sighting's country or locality.
func Postmark(s sighting.Sighting) string {
	if s.Location.Country != "" {
		return strings.ToUpper(s.Location.Country)
	}
	if s.Location.StateProvince != "" {
		return strings.ToUpper(s.Location.StateProvince)
	}
	return "EAST AFRICA"
}

// ShortCoords formats latitude and longitude as compact cardinal coordinates (e.g. "2.33°S · 34.83°E").
func ShortCoords(s sighting.Sighting) string {
	if s.Location.Latitude == 0 && s.Location.Longitude == 0 {
		return "Unmapped sector"
	}
	ns := "N"
	lat := s.Location.Latitude
	if lat < 0 {
		ns = "S"
		lat = -lat
	}
	ew := "E"
	lng := s.Location.Longitude
	if lng < 0 {
		ew = "W"
		lng = -lng
	}
	return fmt.Sprintf("%.2f°%s · %.2f°%s", lat, ns, lng, ew)
}

// TempPill returns a short temperature string if weather was recorded.
func TempPill(s sighting.Sighting) string {
	if s.Weather.ObservedAt.IsZero() {
		return ""
	}
	return fmt.Sprintf("%.0f°C · %s", s.Weather.Temperature.Actual, s.Weather.Condition.Description)
}

// QuizItem is serialized to JSON for the interactive Safari Silhouette Challenge.
type QuizItem struct {
	ID         string `json:"id"`
	Animal     string `json:"animal"`
	Scientific string `json:"scientific"`
	PhotoURL   string `json:"photoUrl"`
	Country    string `json:"country"`
	Light      string `json:"light"`
	Weather    string `json:"weather"`
	Observer   string `json:"observer"`
	URL        string `json:"url"`
}

// QuizItems builds a diverse set of real sightings with photos for the interactive silhouette game.
func QuizItems(sightings []sighting.Sighting, max int) []QuizItem {
	seen := make(map[string]bool)
	out := make([]QuizItem, 0, max)
	for _, s := range sightings {
		c, ok := cover(s)
		if !ok {
			continue
		}
		name := displayName(s.Species)
		if name == "" || name == "Unknown species" || seen[strings.ToLower(name)] {
			continue
		}
		seen[strings.ToLower(name)] = true
		wx := "Clear savanna sky"
		if !s.Weather.ObservedAt.IsZero() && s.Weather.Condition.Description != "" {
			wx = fmt.Sprintf("%s (%.0f°C)", s.Weather.Condition.Description, s.Weather.Temperature.Actual)
		}
		obs := s.RecordedBy
		if obs == "" {
			obs = "GBIF Field Observer"
		}
		out = append(out, QuizItem{
			ID:         s.ID.String(),
			Animal:     name,
			Scientific: s.Species.ScientificName,
			PhotoURL:   sized(c.URL, "medium"),
			Country:    cmpPlace(s),
			Light:      Light(s),
			Weather:    wx,
			Observer:   obs,
			URL:        SightingURL(s),
		})
		if len(out) >= max {
			break
		}
	}
	return out
}
