package internal

import (
	"encoding/json"
	"math"
	"os"
	"path/filepath"
	"strings"

	"github.com/fatih/color"
	"github.com/gosimple/slug"
	"github.com/spf13/viper"
)

// GetDirectory func
func GetDirectory() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", err
	}

	if _, err := os.Stat(filepath.Join(dir, "moul.toml")); os.IsNotExist(err) {
		color.Red("`moul.toml` file is not found!")
		color.Green("Run `moul create my-collection` to get start")
		return "", err
	}

	if _, err := os.Stat(filepath.Join(dir, "photos")); os.IsNotExist(err) {
		color.Red("`photos` directory is not found!")
		color.Green("Run `moul create my-collection` to get start")
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

// GetPhotoDev func
func GetPhotoDev(dir, slugName string) string {
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

// GetPhotoProd func
func GetPhotoProd(dir, slugName string) string {
	sectionPath := filepath.Join(".", "photos", dir)
	if _, err := os.Stat(sectionPath); !os.IsNotExist(err) {
		Resize(sectionPath, slugName, slug.Make(dir), []int{2048, 750})
		config := viper.New()
		config.AddConfigPath(".moul")
		config.SetConfigType("toml")
		config.SetConfigName(slug.Make(dir))
		config.ReadInConfig()
		sectionPhotos := GetPhotos(sectionPath)
		sc := []Collection{}

		for _, photo := range sectionPhotos {
			fn := filepath.Base(photo)
			name := GetFileName(fn, slugName)
			fnName := strings.ToLower(strings.TrimSuffix(fn, filepath.Ext(fn)))
			pid := config.GetString(slug.Make(fn) + ".id")
			widthHd, heightHd := GetPhotoDimension(
				filepath.Join(".moul", "photos", pid, slug.Make(dir), "2048", name+".jpg"),
			)
			width, height := GetPhotoDimension(
				filepath.Join(".moul", "photos", pid, slug.Make(dir), "750", name+".jpg"),
			)
			sc = append(sc, Collection{
				ID:       pid,
				Name:     fnName,
				WidthHd:  widthHd,
				HeightHd: heightHd,
				Width:    width,
				Height:   height,
				Color:    "rgba(0, 0, 0, .93)",
			})
		}
		scj, _ := json.Marshal(sc)
		return string(scj)
	}
	return ""
}
