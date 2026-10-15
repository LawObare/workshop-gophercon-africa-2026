package components

import (
	"fmt"
	"strings"

	"workshop/internal/domain/sighting"
)

// Name is the animal's name as a reader would know it.
func Name(s sighting.Sighting) string { return displayName(s.Species) }

// Place is wherever GBIF said it was seen.
func Place(s sighting.Sighting) string { return place(s.Location) }

// When is the date, and the time when it was recorded.
func When(s sighting.Sighting) string { return when(s) }

// Tones are the classes that tint a sighting.
func Tones(s sighting.Sighting) []string { return tones(s) }

// Cover is a sighting's first photo.
func Cover(s sighting.Sighting) (sighting.Media, bool) { return cover(s) }

// Sized asks for a smaller copy of a photo where the host offers one.
func Sized(url, size string) string { return sized(url, size) }

// HeroSrcset offers a large and an original copy of a banner photo.
func HeroSrcset(url string) string { return heroSrcset(url) }

// PhotoAlt describes a photo.
func PhotoAlt(s sighting.Sighting, m sighting.Media) string { return photoAlt(s, m) }

// Individuals says how many were seen.
func Individuals(n int) string { return individuals(n) }

// HasPosition reports whether a sighting can go on a map.
func HasPosition(s sighting.Sighting) bool {
	return s.Location.Latitude != 0 || s.Location.Longitude != 0
}

// Coordinates writes the position in degrees, north or south and east or west.
func Coordinates(s sighting.Sighting) string {
	ns, ew := "N", "E"
	lat, lng := s.Location.Latitude, s.Location.Longitude
	if lat < 0 {
		ns, lat = "S", -lat
	}
	if lng < 0 {
		ew, lng = "W", -lng
	}
	return fmt.Sprintf("%.3f° %s, %.3f° %s", lat, ns, lng, ew)
}

// RecordedBy names the observer, or says nobody was credited.
func RecordedBy(s sighting.Sighting) string {
	if s.RecordedBy == "" {
		return "Not credited"
	}
	return s.RecordedBy
}

// Basis turns GBIF's HUMAN_OBSERVATION into "Human observation".
func Basis(b string) string {
	b = strings.ToLower(strings.ReplaceAll(b, "_", " "))
	if b == "" {
		return b
	}
	return strings.ToUpper(b[:1]) + b[1:]
}

// GBIFURL is the occurrence's page on GBIF.
func GBIFURL(s sighting.Sighting) string {
	return fmt.Sprintf("https://www.gbif.org/occurrence/%d", s.GBIFKey)
}

// Credit is the photographer, after a separator, for a caption.
func Credit(m sighting.Media) string {
	if m.Creator == "" {
		return ""
	}
	return " · Photo © " + m.Creator
}

// WallSize picks the copy a photo-wall tile needs: the large tiles get the larger copy.
func WallSize(i int) string {
	if i%7 == 0 {
		return "large"
	}
	return "medium"
}
