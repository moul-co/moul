package internal

import (
	"fmt"
	"strconv"
)

func PhotoGetSizes(width, height int) map[string]string {
	var sizes map[string]string
	if width > height {
		w := strconv.Itoa(width)
		size := fmt.Sprintf("%v:0", w)

		// landscape
		if width > 4096 {
			sizes = map[string]string{
				"xl": "4096:0",
				"lg": "2048:0",
				"md": "1024:0",
				"xs": "32:0",
			}
		} else if width > 2048 && width <= 4096 {
			sizes = map[string]string{
				"xl": size,
				"lg": "2048:0",
				"md": "1024:0",
				"xs": "32:0",
			}
		} else if width > 1024 && width <= 2048 {
			sizes = map[string]string{
				"xl": size,
				"lg": size,
				"md": "1024:0",
				"xs": "32:0",
			}
		} else {
			sizes = map[string]string{
				"xl": size,
				"lg": size,
				"md": size,
				"xs": "32:0",
			}
		}
	} else {
		h := strconv.Itoa(width)
		size := fmt.Sprintf("0:%v", h)

		// portrait
		if height > 4096 {
			sizes = map[string]string{
				"xl": "0:4096",
				"lg": "0:2048",
				"md": "0:1024",
				"xs": "0:32",
			}
		} else if height > 2048 && height <= 4096 {
			sizes = map[string]string{
				"xl": size,
				"lg": "0:2048",
				"md": "0:1024",
				"xs": "0:32",
			}
		} else if height > 1024 && height <= 2048 {
			sizes = map[string]string{
				"xl": size,
				"lg": size,
				"md": "0:1024",
				"xs": "0:32",
			}
		} else {
			sizes = map[string]string{
				"xl": size,
				"lg": size,
				"md": size,
				"xs": "0:32",
			}
		}
	}

	return sizes
}

func PhotoGetAvatarSizes(width, height int) map[string]string {
	var max int
	var sizes map[string]string

	if width > height {
		max = width
	} else {
		max = height
	}

	m := strconv.Itoa(max)
	size := fmt.Sprintf("%v:%v", m, m)

	if max > 1024 {
		sizes = map[string]string{
			"xl": "1024:1024",
			"lg": "512:512",
			"md": "256:256",
			"xs": "32:32",
		}
	} else if max > 512 && max <= 1024 {
		sizes = map[string]string{
			"xl": size,
			"lg": "512:512",
			"md": "256:256",
			"xs": "32:32",
		}
	} else if max > 256 && max <= 512 {
		sizes = map[string]string{
			"xl": size,
			"lg": size,
			"md": "256:256",
			"xs": "32:32",
		}
	} else {
		sizes = map[string]string{
			"xl": size,
			"lg": size,
			"md": size,
			"xs": "32:32",
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
