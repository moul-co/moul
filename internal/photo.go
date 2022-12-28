package internal

import (
	"fmt"
	"strconv"
)

func PhotoGetSizes(width, height int) map[string]string {
	var sizes map[string]string
	if width > height {
		// landscape
		if width > 4096 {
			sizes = map[string]string{
				"xl": "4096:0",
				"md": "1600:0",
				"xs": "16:0",
			}
		} else if width > 1600 && width <= 4096 {
			w := strconv.Itoa(width)
			size := fmt.Sprintf("%v:0", w)
			sizes = map[string]string{
				"xl": size,
				"md": "1600:0",
				"xs": "16:0",
			}
		} else {
			w := strconv.Itoa(width)
			size := fmt.Sprintf("%v:0", w)
			sizes = map[string]string{
				"xl": size,
				"md": size,
				"xs": "16:0",
			}
		}
	} else {
		// portrait
		if height > 4096 {
			sizes = map[string]string{
				"xl": "0:4096",
				"md": "0:1600",
				"xs": "0:16",
			}
		} else if height > 1600 && height <= 4096 {
			h := strconv.Itoa(width)
			size := fmt.Sprintf("0:%v", h)
			sizes = map[string]string{
				"xl": size,
				"md": "0:1600",
				"xs": "0:16",
			}
		} else {
			h := strconv.Itoa(width)
			size := fmt.Sprintf("0:%v", h)
			sizes = map[string]string{
				"xl": size,
				"md": size,
				"xs": "0:16",
			}
		}
	}

	return sizes
}

func PhotoGetComSizes(width, height int) (int, int) {
	var xCom int
	var yCom int

	if width > height {
		xCom = 5
		yCom = 4
	} else {
		xCom = 4
		yCom = 5
	}

	return xCom, yCom
}
