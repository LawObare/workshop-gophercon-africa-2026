package layout

// title puts the site's name after the page's.
func title(page string) string {
	if page == "" {
		return "Golden Hour"
	}
	return page + " · Golden Hour"
}

// description falls back to what the site is.
func description(d string) string {
	if d == "" {
		return "Wildlife sightings from around the world, each tinted by the light and weather it was seen in."
	}
	return d
}
