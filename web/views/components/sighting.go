package components

import (
	"cmp"
	"strings"
	"time"

	"workshop/internal/domain/sighting"
	"workshop/internal/domain/weather"
)

var lightNames = map[string]string{
	"dawn":  "First light",
	"day":   "Daylight",
	"dusk":  "Golden hour",
	"night": "After dark",
	"":      "Time unknown",
}

// light names the part of the day a sighting happened in, or "" when only its date was recorded.
func light(t time.Time) string {
	if t.Hour() == 0 && t.Minute() == 0 && t.Second() == 0 {
		return ""
	}
	switch h := t.Hour(); {
	case h >= 5 && h < 8:
		return "dawn"
	case h >= 8 && h < 16:
		return "day"
	case h >= 16 && h < 20:
		return "dusk"
	default:
		return "night"
	}
}

// Light is the part of the day in words, for the card and the filter.
func Light(s sighting.Sighting) string {
	return lightNames[light(s.HappenedAt)]
}

// tones are the classes that tint a sighting by its light and its sky.
func tones(s sighting.Sighting) []string {
	return []string{"tone--" + cmp.Or(light(s.HappenedAt), "unknown"), "sky--" + skyOf(s)}
}

// skyOf groups a sighting's weather, or "none" when none was recorded.
func skyOf(s sighting.Sighting) string {
	return skyOrNone(s.Weather)
}

// skyOrNone groups the weather, or "none" when it's missing.
func skyOrNone(w weather.Weather) string {
	if w.ObservedAt.IsZero() {
		return "none"
	}
	return sky(w.Condition.Code)
}

// when is the date, with the time of day when it was recorded.
func when(s sighting.Sighting) string {
	if light(s.HappenedAt) == "" {
		return s.HappenedAt.Format("2 January 2006")
	}
	return s.HappenedAt.Format("2 January 2006 · 15:04")
}

// photos keeps a sighting's still images.
func photos(s sighting.Sighting) []sighting.Media {
	out := make([]sighting.Media, 0, len(s.Media))
	for _, m := range s.Media {
		if m.Type == "StillImage" && m.URL != "" {
			out = append(out, m)
		}
	}
	return out
}

// cover is a sighting's first photo.
func cover(s sighting.Sighting) (sighting.Media, bool) {
	ps := photos(s)
	if len(ps) == 0 {
		return sighting.Media{}, false
	}
	return ps[0], true
}

// sized asks iNaturalist for a smaller copy ("medium", "large") than the original it links to.
func sized(url, size string) string {
	if !strings.Contains(url, "inaturalist") {
		return url
	}
	return strings.Replace(url, "/original.", "/"+size+".", 1)
}

// SightingURL is a sighting's own page.
func SightingURL(s sighting.Sighting) string {
	return "/sightings/" + s.ID.String()
}

// Morph names a sighting's photo for the page transition; the id is ours, never GBIF's text.
func Morph(s sighting.Sighting) map[string]string {
	return map[string]string{"--vt": "sighting-" + s.ID.String()}
}

// Showcase picks the banner's sightings, n of different animals with large photos, then the next m with any photo.
func Showcase(sightings []sighting.Sighting, n, m int) (banner, latest []sighting.Sighting) {
	seen := make(map[string]bool)
	used := make(map[int]bool)
	for i, s := range sightings {
		c, ok := cover(s)
		name := displayName(s.Species)
		if !ok || seen[name] || !strings.Contains(c.URL, "inaturalist") {
			continue
		}
		seen[name], used[i] = true, true
		if banner = append(banner, s); len(banner) == n {
			break
		}
	}
	for i, s := range sightings {
		if _, ok := cover(s); ok && !used[i] {
			if latest = append(latest, s); len(latest) == m {
				break
			}
		}
	}
	return banner, latest
}
