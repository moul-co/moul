package internal

import (
	"fmt"
	"image"
	"log"
	"os"
	"strconv"

	"github.com/EdlinOrg/prominentcolor"
)

func format(number uint32) string {
	return strconv.FormatUint(uint64(number), 10)
}

// GetDominantColor func
func GetDominantColor(path string) string {
	f, err := os.Open(path)
	defer f.Close()
	if err != nil {
		log.Println("File not found:", path)
	}
	img, _, err := image.Decode(f)
	if err != nil {
		log.Println(err)
	}

	result, err := prominentcolor.Kmeans(img)
	if err != nil {
		return "rgba(0, 0, 0, .93)"
	}

	return fmt.Sprintf("rgba(%s, %s, %s, .93)",
		format(result[2].Color.R),
		format(result[2].Color.G),
		format(result[2].Color.B),
	)
}
