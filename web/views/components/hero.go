package components

import (
	"cmp"
	"strconv"

	"workshop/internal/domain/sighting"
)

// heroSrcset offers iNaturalist's large copy to small screens and the original to wide ones.
func heroSrcset(url string) string {
	if sized(url, "large") == url {
		return ""
	}
	return sized(url, "large") + " 1024w, " + url + " 2048w"
}

// letterDelay staggers the banner title's letters, from a fixed step rather than any data.
func letterDelay(i int) map[string]string {
	return map[string]string{"--i": strconv.Itoa(i)}
}

// cmpPlace is the shortest useful place name: the country, else wherever GBIF said.
func cmpPlace(s sighting.Sighting) string {
	return cmp.Or(s.Location.Country, place(s.Location))
}
