package main

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image/jpeg"
	"log"
	"math"
	"moul/internal"
	"net/http"
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
	sizes      = map[string]int{"xl": 4096, "lg": 2560, "md": 1024, "sm": 512, "xs": 32}
	cache      *viper.Viper
	moulConfig *viper.Viper

	photoURL = "http://localhost:1234/"
)

type Block struct {
	Type string `json:"type"` // title, heading, subheading, paragraph, quote, "photos", "cover"
	Text string `json:"text"`
}
type Photo struct {
	Name   string `json:"name"`
	Order  int    `json:"order"`
	Hash   string `json:"hash"`
	BH     string `json:"bh"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
	Type   string `json:"type"`
	URL    string `json:"url"`
}
type Social struct {
	GitHub    string `json:"github"`
	Twitter   string `json:"twitter"`
	YouTube   string `json:"youtube"`
	Facebook  string `json:"facebook"`
	Instagram string `json:"instagram"`
}
type Profile struct {
	Name    string `json:"name"`
	Bio     string `json:"bio"`
	Social  Social `json:"social"`
	Cover   Photo  `json:"cover"`
	Picture Photo  `json:"picture"`
}
type Story struct {
	Slug    string  `json:"slug"`
	Blocks  []Block `json:"blocks"`
	Profile Profile `json:"profile"`
	Photos  []Photo `json:"photos"`
}

func init() {
	if err := os.MkdirAll(filepath.Join(".", ".moul"), 0755); err != nil {
		log.Fatal(err)
	}
	if cache == nil {
		cache = viper.New()
		cache.AddConfigPath(filepath.Join(".", ".moul"))
		cache.SetConfigType("toml")
		cache.SetConfigName("cache")
		cache.ReadInConfig()
	}

	if moulConfig == nil {
		moulConfig = viper.New()
		moulConfig.AddConfigPath(filepath.Join("."))
		moulConfig.SetConfigType("toml")
		moulConfig.SetConfigName("moul")
		moulConfig.ReadInConfig()
	}
}

func resize(photoPath, photographer string) (string, string) {
	cleanFn := slug.Make(photoPath)
	cleanFnWithName := internal.GetFileName(filepath.Base(photoPath), photographer)
	hash := internal.GetSHA1(photoPath)
	baseDir := filepath.Join(".", "public", "__moul", "photos", hash)

	imgSrc, err := imaging.Open(photoPath, imaging.AutoOrientation(true))
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
	cache.Set(cleanFn+".name", cleanFnWithName+".jpeg")
	cache.Set(cleanFn+".bh", base64.StdEncoding.EncodeToString(buf.Bytes()))
	cache.WriteConfigAs(filepath.Join(".", ".moul", "cache.toml"))
	return cleanFnWithName + ".jpeg", base64.StdEncoding.EncodeToString(buf.Bytes())
}

func processPhoto(photoPath string) Photo {
	cleanPhotoPath := slug.Make(photoPath)
	photo := Photo{}

	photo.Hash = internal.GetSHA1(filepath.Join(".", photoPath))
	if cache.GetInt(cleanPhotoPath+".width") > 0 && cache.GetInt(cleanPhotoPath+".height") > 0 {
		photo.Width = cache.GetInt(cleanPhotoPath + ".width")
		photo.Height = cache.GetInt(cleanPhotoPath + ".height")
	} else {
		pcW, pcH := internal.GetWidthHeight(photoPath)
		photo.Width = pcW
		photo.Height = pcH
		cache.Set(cleanPhotoPath+".width", pcW)
		cache.Set(cleanPhotoPath+".height", pcH)
		cache.WriteConfigAs(filepath.Join(".", ".moul", "cache.toml"))
	}

	if envy.Get("MOUL_ENV", "") == "prod" {
		if len(cache.GetString(cleanPhotoPath+".name")) > 0 && len(cache.GetString(cleanPhotoPath+".bh")) > 0 {
			photo.Name = cache.GetString(cleanPhotoPath + ".name")
			photo.BH = cache.GetString(cleanPhotoPath + ".bh")
		} else {
			pcName, pcBh := resize(photoPath, envy.Get("MOUL_PROFILE_NAME", ""))
			photo.Name = pcName
			photo.BH = pcBh
			photo.URL = ""
		}
	} else {
		photo.URL = photoURL + photoPath
	}

	return photo
}

func parseMd() []Story {
	profile := parseProfile()
	var stories []Story
	var storiesMd []string
	err := filepath.Walk(filepath.Join(".", "stories"), func(path string, info os.FileInfo, err error) error {
		if info.IsDir() {
			return nil
		}
		if strings.ToLower(filepath.Ext(path)) == ".md" {
			storiesMd = append(storiesMd, path)
		}
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}
	for _, s := range storiesMd {
		f, err := os.Open(s)
		if err != nil {
			log.Fatal(err)
		}
		defer f.Close()
		cleanFn := slug.Make(strings.TrimSuffix(filepath.Base(s), filepath.Ext(s)))
		scanner := bufio.NewScanner(f)
		blocks := []Block{}
		photos := []Photo{}

		coverPath := filepath.Join(".", "photos", cleanFn, "cover")
		exist, err := internal.IsExists(coverPath)
		if err != nil {
			log.Fatal(err)
		}
		if exist {
			coverDir := internal.GetPhotos(coverPath)
			cover := processPhoto(coverDir[0])
			cover.Type = "cover"
			cover.Order = 1
			photos = append(photos, cover)
		}
		order := 1
		for _, v := range photos {
			if v.Type == "cover" {
				order = 2
			}
		}

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
				allPhotos := internal.GetPhotos(filepath.Join(".", "photos", cleanFn, clean))
				for _, p := range allPhotos {
					photo := processPhoto(p)
					photo.Order = order
					photo.Type = clean
					photos = append(photos, photo)
					order++
				}
			} else {
				block.Type = "paragraph"
				block.Text = line
			}
			blocks = append(blocks, block)
		}
		if err := scanner.Err(); err != nil {
			log.Fatal(err)
		}

		stories = append(stories, Story{
			Slug:    cleanFn,
			Blocks:  blocks,
			Profile: *profile,
			Photos:  photos,
		})
	}
	return stories
}

func parseProfile() *Profile {
	photographer := moulConfig.GetString("profile.name")
	profilePath := filepath.Join(".", "photos", "profile")
	profileCover := internal.GetPhotos(filepath.Join(profilePath, "cover"))[0]
	profilePicture := internal.GetPhotos(filepath.Join(profilePath, "picture"))[0]

	cover := processPhoto(profileCover)
	picture := processPhoto(profilePicture)

	return &Profile{
		Name: photographer,
		Bio:  moulConfig.GetString("profile.bio"),
		Social: Social{
			Twitter:   moulConfig.GetString("social.twitter"),
			GitHub:    moulConfig.GetString("social.github"),
			YouTube:   moulConfig.GetString("social.youtube"),
			Facebook:  moulConfig.GetString("social.facebook"),
			Instagram: moulConfig.GetString("social.instagram"),
		},
		Cover:   cover,
		Picture: picture,
	}
}

func main() {
	app := &cli.App{
		Name:  "moul",
		Usage: "",
		Action: func(c *cli.Context) error {
			// photos := internal.GetPhotos(envy.Get("MOUL_PHOTOS_PATH", filepath.Join(".", "photos", "sunset-at-its-finest", "section-4")))
			// for _, p := range photos {
			// 	resize(p, envy.Get("MOUL_PROFILE_NAME", ""))
			// }
			return nil
		},
		Commands: []*cli.Command{
			{
				Name:    "build",
				Aliases: []string{"b"},
				Usage:   "",
				Action: func(c *cli.Context) error {
					envy.Set("MOUL_ENV", "prod")
					profile := parseProfile()
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

					stories := parseMd()
					s, err := json.Marshal(stories)
					if err != nil {
						log.Fatal(err)
					}
					storiesFile, err := os.Create(filepath.Join(".", "app", "data", "stories.json"))
					if err != nil {
						log.Fatal(err)
					}
					defer storiesFile.Close()
					storiesFile.WriteString(string(s))
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
			{
				Name:    "dev",
				Aliases: []string{"d"},
				Usage:   "",
				Action: func(c *cli.Context) error {
					envy.Set("MOUL_ENV", "dev")
					profile := parseProfile()
					p, err := json.Marshal(profile)
					if err != nil {
						log.Fatal(err)
					}
					profileFile, err := os.Create(filepath.Join(".", "public", "__moul", "profile.json"))
					if err != nil {
						log.Fatal(err)
					}
					defer profileFile.Close()
					profileFile.WriteString(string(p))

					stories := parseMd()
					s, err := json.Marshal(stories)
					if err != nil {
						log.Fatal(err)
					}
					storiesFile, err := os.Create(filepath.Join(".", "public", "__moul", "stories.json"))
					if err != nil {
						log.Fatal(err)
					}
					defer storiesFile.Close()
					storiesFile.WriteString(string(s))

					fs := http.FileServer(http.Dir("photos/"))
					http.Handle("/photos/", http.StripPrefix("/photos/", fs))
					fmt.Println("Preview: http://localhost:3000/")
					http.ListenAndServe(":1234", nil)

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
