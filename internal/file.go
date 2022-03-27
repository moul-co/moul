package internal

import (
	"image"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/gosimple/slug"
)

func GetFileName(filePath, author string) string {
	return slug.Make(strings.TrimSuffix(filePath, filepath.Ext(filePath))) + "-by-" + slug.Make(author)
}

// GetWidthHeight given path
func GetWidthHeight(filePath string) (int, int) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}

	image, _, err := image.DecodeConfig(file)
	if err != nil {
		log.Fatal(err)
	}

	return image.Width, image.Height
}

// GetImage
func GetImage(filePath string) (image.Image, error) {
	f, err := os.Open(filePath)
	defer f.Close()
	if err != nil {
		log.Println("File not found:", filePath)
		return nil, err
	}
	img, _, err := image.Decode(f)
	if err != nil {
		return nil, err
	}

	return img, nil
}
