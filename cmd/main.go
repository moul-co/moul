package main

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"image/jpeg"
	"log"
	"math"
	"moul/internal"
	"os"
	"path/filepath"
	"strings"

	"github.com/bbrks/go-blurhash"
	"github.com/disintegration/imaging"
	"github.com/gobuffalo/envy"
	"github.com/gosimple/slug"
	"github.com/spf13/viper"
	"github.com/urfave/cli/v2"
)

var (
	sizes  = map[string]int{"xl": 4096, "lg": 2560, "md": 1024, "sm": 512, "xs": 32}
	cache  *viper.Viper
	config *viper.Viper
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

	if config == nil {
		config = viper.New()
		config.AddConfigPath(filepath.Join(".", "app", "photos"))
		config.SetConfigType("json")
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

type Block struct {
	Type string `json:"type"` // title, heading, subheading, paragraph, quote, "photos", "cover"
	Text string `json:"text"`
}
type Photo struct {
	Name   string `json:"name"`
	Order  int16  `json:"order"`
	Hash   string `json:"hash"`
	BH     string `json:"bh"`
	Width  int16  `json:"width"`
	Height int16  `json:"height"`
	Type   string `json:"type"`
}
type Social struct {
	GitHub    string `json:"github"`
	Twitter   string `json:"twitter"`
	YouTube   string `json:"youtube"`
	Facebook  string `json:"facebook"`
	Instagram string `json:"instagram"`
}
type Profile struct {
	Name   string `json:"name"`
	Bio    string `json:"bio"`
	Social Social `json:"social"`
}

func main() {
	app := &cli.App{
		Name:  "moul",
		Usage: "",
		Action: func(c *cli.Context) error {
			photos := internal.GetPhotos(envy.Get("MOUL_PHOTOS_PATH", filepath.Join(".", "public", "photos")))
			for _, p := range photos {
				resize(p, envy.Get("MOUL_PROFILE_NAME", ""))
			}
			return nil
		},
		Commands: []*cli.Command{
			{
				Name:    "build",
				Aliases: []string{"b"},
				Usage:   "",
				Action: func(c *cli.Context) error {
					var stories []string
					err := filepath.Walk(filepath.Join(".", "stories"), func(path string, info os.FileInfo, err error) error {
						if info.IsDir() {
							return nil
						}
						if strings.ToLower(filepath.Ext(path)) == ".md" {
							stories = append(stories, path)
						}
						return nil
					})
					if err != nil {
						log.Fatal(err)
					}
					for _, s := range stories {
						f, err := os.Open(s)
						if err != nil {
							log.Fatal(err)
						}
						defer f.Close()
						scanner := bufio.NewScanner(f)
						blocks := []Block{}
						for scanner.Scan() {
							block := Block{}
							line := scanner.Text()
							if len(line) == 0 {
								continue
							} else if strings.HasPrefix(line, "# ") {
								block.Type = "title"
								block.Text = strings.TrimPrefix(line, "# ")
							} else if strings.HasPrefix(line, "## ") {
								block.Type = "heading"
								block.Text = strings.TrimPrefix(line, "## ")
							} else if strings.HasPrefix(line, "### ") {
								block.Type = "subheading"
								block.Text = strings.TrimPrefix(line, "### ")
							} else if strings.HasPrefix(line, "> ") {
								block.Type = "quote"
								block.Text = strings.TrimPrefix(line, "> ")
							} else if strings.HasPrefix(line, "{{ photos") {
								clean := slug.Make(strings.Split(line, "`")[1])
								if len(clean) == 0 {
									continue
								}
								block.Type = "photos"
								block.Text = clean
							} else {
								block.Type = "paragraph"
								block.Text = line
							}
							blocks = append(blocks, block)
						}
						if err := scanner.Err(); err != nil {
							log.Fatal(err)
						}
						jsonStory := strings.TrimSuffix(filepath.Base(s), filepath.Ext(filepath.Base(s))) + ".json"
						b, err := json.Marshal(blocks)
						if err != nil {
							log.Fatal(err)
						}
						file, err := os.Create(filepath.Join(".", "app", "data", jsonStory))
						if err != nil {
							log.Fatal(err)
						}
						defer file.Close()
						file.WriteString(string(b))
					}

					profile := &Profile{
						Name: envy.Get("MOUL_PROFILE_NAME", ""),
						Bio:  envy.Get("MOUL_PROFILE_BIO", ""),
						Social: Social{
							Twitter:   envy.Get("MOUL_PROFILE_SOCIAL_TWITTER", ""),
							GitHub:    envy.Get("MOUL_PROFILE_SOCIAL_GITHUB", ""),
							YouTube:   envy.Get("MOUL_PROFILE_SOCIAL_YOUTUBE", ""),
							Facebook:  envy.Get("MOUL_PROFILE_SOCIAL_FACEBOOK", ""),
							Instagram: envy.Get("MOUL_PROFILE_SOCIAL_INSTAGRAM", ""),
						},
					}
					p, err := json.Marshal(profile)
					if err != nil {
						log.Fatal(err)
					}
					profileFile, err := os.Create(filepath.Join(".", "app", "data", "profile.json"))
					if err != nil {
						log.Fatal(err)
					}
					defer profileFile.Close()
					profileFile.WriteString(string(p))
					return nil
				},
			},
			{
				Name:    "new",
				Aliases: []string{"n"},
				Usage:   "",
				Action: func(c *cli.Context) error {
					title := c.Args().First()
					fn := slug.Make(title)
					md, err := os.Create(filepath.Join(".", "stories", fn+".md"))
					if err != nil {
						log.Fatal(err)
					}
					defer md.Close()
					md.WriteString("# " + title)

					if err := os.MkdirAll(filepath.Join(".", "photos", fn, "cover"), 0755); err != nil {
						log.Fatal(err)
					}
					return nil
				},
			},
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
