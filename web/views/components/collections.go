package components

import (
	"workshop/internal/domain/sighting"
)

// Photo is one picture on the photo wall, with the sighting it belongs to.
type Photo struct {
	Sighting sighting.Sighting
	Media    sighting.Media
}

// Photos gathers every still image across the sightings, in their order.
func Photos(sightings []sighting.Sighting) []Photo {
	var out []Photo
	for _, s := range sightings {
		for _, m := range photos(s) {
			out = append(out, Photo{Sighting: s, Media: m})
		}
	}
	return out
}

// Photographers counts the distinct people credited across photos.
func Photographers(ps []Photo) int {
	seen := make(map[string]struct{})
	for _, p := range ps {
		if p.Media.Creator != "" {
			seen[p.Media.Creator] = struct{}{}
		}
	}
	return len(seen)
}

var lightCode = map[string]float64{"dawn": 0, "day": 1, "dusk": 2, "night": 3, "": 4}

// GlobePoints writes each sighting as [latitude, longitude, light], numbers only, for the globe.
func GlobePoints(sightings []sighting.Sighting) [][3]float64 {
	points := make([][3]float64, 0, len(sightings))
	for _, s := range sightings {
		if s.Location.Latitude == 0 && s.Location.Longitude == 0 {
			continue
		}
		points = append(points, [3]float64{s.Location.Latitude, s.Location.Longitude, lightCode[light(s.HappenedAt)]})
	}
	return points
}
