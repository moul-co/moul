package internal

import (
	"encoding/json"
	"math"
	"os"
	"path/filepath"

	"github.com/fatih/color"
)

// GetDirectory func
func GetDirectory() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", err
	}

	if _, err := os.Stat(filepath.Join(dir, "moul.toml")); os.IsNotExist(err) {
		color.Red("`moul.toml` file is not found!")
		return "", err
	}

	return dir, nil
}

// RemoveAll func
func RemoveAll(path string) error {
	d, err := os.Open(path)
	if err != nil {
		return err
	}
	defer d.Close()
	names, err := d.Readdirnames(-1)
	if err != nil {
		return err
	}
	for _, name := range names {
		err = os.RemoveAll(filepath.Join(path, name))
		if err != nil {
			return err
		}
	}
	return nil
}

// GetPhotoCollection func
func GetPhotoCollection(dir, slugName string) string {
	sectionPath := filepath.Join(".", "photos", dir)
	if _, err := os.Stat(sectionPath); !os.IsNotExist(err) {
		sectionPhotos := GetPhotos(sectionPath)
		sc := []Collection{}
		for _, p := range sectionPhotos {
			widthHd, heightHd := GetPhotoDimension(p)
			height := float64(heightHd) / float64(widthHd) * 750
			fn := filepath.Base(p)
			name := GetFileName(fn, slugName)

			sc = append(sc, Collection{
				Name:     name,
				Src:      fn,
				WidthHd:  widthHd,
				HeightHd: heightHd,
				Width:    750,
				Height:   int(math.Round(height)),
				Color:    "rgba(0, 0, 0, .93)",
			})
		}
		scj, _ := json.Marshal(sc)
		return string(scj)
	}
	return ""
}
