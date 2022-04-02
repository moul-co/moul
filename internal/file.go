package internal

import (
	"image"
	_ "image/jpeg"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/edwvee/exiffix"
	"github.com/gosimple/slug"
)

func GetFileName(filePath, author string) string {
	fn := slug.Make(strings.TrimSuffix(filePath, filepath.Ext(filePath)))
	if author == "" {
		return fn
	}
	return fn + "-by-" + slug.Make(author)
}

//! workaround orientation issue: https://github.com/golang/go/issues/4341
// GetWidthHeight given path
func GetWidthHeight(filePath string) (int, int) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()
	img, _, err := exiffix.Decode(file)
	if err != nil {
		log.Fatal(err)
	}
	return img.Bounds().Dx(), img.Bounds().Dy()
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

func GetPhotos(path string) []string {
	var photos []string
	// folder to walk through
	err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
		if info.IsDir() {
			return nil
		}
		if strings.ToLower(filepath.Ext(path)) == ".jpeg" || strings.ToLower(filepath.Ext(path)) == ".jpg" || strings.ToLower(filepath.Ext(path)) == ".png" {
			photos = append(photos, path)
		}
		return nil
	})

	if err != nil {
		log.Println(err)
	}

	return photos
}

func IsExists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}
