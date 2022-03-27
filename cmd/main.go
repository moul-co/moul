package main

import (
	"bytes"
	"encoding/base64"
	"image/jpeg"
	"log"
	"math"
	"moul/internal"
	"os"
	"path/filepath"

	"github.com/bbrks/go-blurhash"
	"github.com/disintegration/imaging"
	"github.com/gosimple/slug"
	"github.com/spf13/viper"
	"github.com/urfave/cli/v2"
)

var (
	sizes = map[string]int{"xl": 4096, "lg": 2560, "md": 1024, "sm": 512, "xs": 32}
	cache *viper.Viper
)

func init() {
	if err := os.MkdirAll(filepath.Join(".", "public", "__moul"), 0755); err != nil {
		log.Fatal(err)
	}
	if cache == nil {
		cache = viper.New()
		cache.AddConfigPath(filepath.Join(".", "public", "__moul"))
		cache.SetConfigType("toml")
		cache.SetConfigName("cache")
		cache.ReadInConfig()
	}
}

func resize(photoPath, photographer string) {
	cleanFn := slug.Make(photoPath)
	cleanFnWithName := internal.GetFileName(filepath.Base(photoPath), photographer)
	hash := internal.GetSHA1(photoPath)
	baseDir := filepath.Join(".", "public", "__moul", "photos", hash)

	imgSrc, err := imaging.Open(photoPath)
	if err != nil {
		log.Fatal(err)
	}
	for k, v := range sizes {
		outPath := filepath.Join(baseDir, k, cleanFnWithName+".jpeg")
		if err := os.MkdirAll(filepath.Join(baseDir, k), 0755); err != nil {
			log.Fatal(err)
		}
		resized := imaging.Resize(imgSrc, v, 0, imaging.Lanczos)
		err := imaging.Save(resized, outPath)
		if err != nil {
			log.Fatal(err)
		}
	}

	xsFile := filepath.Join(baseDir, "xs", cleanFnWithName+".jpeg")
	width, height := internal.GetWidthHeight(xsFile)
	ratio := math.Min(9/float64(width), 9/float64(height))
	w := float64(width) * ratio
	h := float64(height) * ratio
	xsImg, err := internal.GetImage(xsFile)
	if err != nil {
		log.Fatal(err)
	}
	bh, err := blurhash.Encode(int(w), int(h), xsImg)
	b64Ratio := math.Min(16/float64(w), 16/float64(h))
	b64W := float64(w) * b64Ratio
	b64H := float64(h) * b64Ratio
	decoded, _ := blurhash.Decode(bh, int(b64W), int(b64H), 1)
	buf := new(bytes.Buffer)
	_ = jpeg.Encode(buf, decoded, &jpeg.Options{Quality: 90})

	cache.Set(cleanFn+".hash", hash)
	cache.Set(cleanFn+".fn", cleanFnWithName+".jpeg")
	cache.Set(cleanFn+".bh", base64.StdEncoding.EncodeToString(buf.Bytes()))
	cache.WriteConfigAs(filepath.Join(".", "public", "__moul", "cache.toml"))
}

func main() {
	app := &cli.App{
		Name:  "moul",
		Usage: "",
		Action: func(c *cli.Context) error {
			resize("./public/profile/DSCF1983-1024.jpg", "Phearak S. Tha")
			return nil
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
