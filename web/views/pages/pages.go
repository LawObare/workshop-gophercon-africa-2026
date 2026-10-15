package pages

import (
	"fmt"
	"strconv"
)

// trackAt places the 404 page's paw prints in a wandering line, left to right.
func trackAt(i int) string {
	y := 46
	if i%2 == 1 {
		y = 74
	}
	return fmt.Sprintf("translate(%d %d) rotate(90)", 28+i*44, y)
}

// trackStyle staggers the prints, from their position rather than any data.
func trackStyle(i int) map[string]string {
	return map[string]string{"--i": strconv.Itoa(i)}
}
