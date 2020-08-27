package internal

import (
	"fmt"
	"image"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/disintegration/imaging"
	"github.com/gosimple/slug"
	"github.com/spf13/viper"
)

// Collection struct
type Collection struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Src      string `json:"src"`
	Color    string `json:"color"`
	SrcHd    string `json:"src_hd"`
	Width    int    `json:"width"`
	WidthHd  int    `json:"width_hd"`
	Height   int    `json:"height"`
	HeightHd int    `json:"height_hd"`
}

// get file path
func getFilePath(uid, prefix string, size int) string {
	return filepath.Join(".moul", "photos", uid, prefix, strconv.Itoa(size))
}

// GetFileName func
func GetFileName(fn, author string) string {
	return slug.Make(strings.TrimSuffix(fn, filepath.Ext(fn))) + "-by-" + slug.Make(author)
}

// GetPhotoDimension given path
func GetPhotoDimension(path string) (int, int) {
	file, err := os.Open(path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
	}

	image, _, err := image.DecodeConfig(file)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s: %v\n", path, err)
	}

	return image.Width, image.Height
}

// Manipulate image
func manipulate(id, inPath, author, photoType string, size int) {
	src, err := imaging.Open(inPath)
	if err != nil {
		log.Fatal(err)
	}

	fn := filepath.Base(inPath)
	name := GetFileName(fn, author)

	dir := getFilePath(id, photoType, size)
	out := filepath.Join(dir, name+".jpg")
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Fatal(err)
	}

	newImage := imaging.Resize(src, size, 0, imaging.Lanczos)

	err = imaging.Save(newImage, out)
	if err != nil {
		log.Fatal(err)
	}
}

// GetDirs func
func GetDirs(path string) []string {
	var folders []string

	err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
		if info.IsDir() {
			folders = append(folders, path)
		}
		return nil
	})
	if err != nil {
		log.Println(err)
	}

	return folders
}

// GetPhotos given path
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

// open image
func loadImage(fileInput string) (image.Image, error) {
	f, err := os.Open(fileInput)
	defer f.Close()
	if err != nil {
		log.Println("File not found:", fileInput)
		return nil, err
	}
	img, _, err := image.Decode(f)
	if err != nil {
		return nil, err
	}

	return img, nil
}

// Resize func
func Resize(inPath, author, outPrefix string, sizes []int) {
	unique := UniqueID()

	photos := GetPhotos(inPath)

	config := viper.New()
	config.AddConfigPath(".moul")
	config.SetConfigType("toml")
	config.SetConfigName(slug.Make(outPrefix))
	config.ReadInConfig()

	allPhotos := viper.New()
	allPhotos.AddConfigPath(".moul")
	allPhotos.SetConfigType("toml")
	allPhotos.SetConfigName("photos")
	allPhotos.ReadInConfig()
	ap := allPhotos.GetStringSlice(slug.Make(outPrefix))

	for _, photo := range photos {
		fn := slug.Make(filepath.Base(photo))

		pt := filepath.Base(photo)
		name := GetFileName(pt, author)

		if config.GetString(fn+".sha") == GetSHA1(photo) {
			continue
		}
		for _, size := range sizes {
			manipulate(unique, photo, author, slug.Make(outPrefix), size)

			ap = append(ap,
				filepath.Join(".", ".moul", "photos",
					unique,
					slug.Make(outPrefix),
					strconv.Itoa(size),
					name+".jpg"),
			)
		}
		ap = append(ap,
			filepath.Join(".", ".moul", "photos",
				unique,
				slug.Make(outPrefix),
				"sqip",
				name+".svg"),
		)
		makeSQIP(unique, photo, author, slug.Make(outPrefix))

		config.Set(fn+".sha", GetSHA1(photo))
		config.Set(fn+".id", unique)
	}
	allPhotos.Set(slug.Make(outPrefix), ap)

	config.WriteConfigAs(filepath.Join(".", ".moul", slug.Make(outPrefix)+".toml"))
	allPhotos.WriteConfigAs(filepath.Join(".", ".moul", "photos.toml"))
}
