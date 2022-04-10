package main

import (
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"moul/internal"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gobuffalo/envy"
	"github.com/gosimple/slug"
	"github.com/spf13/viper"
	"github.com/urfave/cli/v2"
)

var (
	cache      *viper.Viper
	moulConfig *viper.Viper
)

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

//go:embed boilerplate/*
var boilerplate embed.FS

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
				Name:    "create",
				Aliases: []string{"c"},
				Usage:   "",
				Action: func(c *cli.Context) error {
					if c.NArg() == 0 || c.NArg() > 2 {
						return errors.New("\nInvalid input, please try example command below \n\n$ moul create photos\n\n")
					}
					project := c.Args().First()
					target := c.Args().Get(1)
					switch target {
					case "vercel":
						target = "vercel"
						break
					case "netlify":
						target = "netlify"
						break
					default:
						target = "cloudflare-pages"
					}

					cwd := slug.Make(project)
					for _, p := range []string{".moul", "photos", "public", "stories"} {
						toCreateDir := filepath.Join(".", cwd, p)
						if err := os.MkdirAll(toCreateDir, 0755); err != nil {
							log.Fatal(err)
						}
					}
					indexMd, _ := boilerplate.ReadFile("boilerplate/moul.toml")
					os.WriteFile(filepath.Join(".", cwd, "moul.toml"), indexMd, 0644)
					defaultMoulConfig := viper.New()
					defaultMoulConfig.AddConfigPath(filepath.Join(".", cwd))
					defaultMoulConfig.SetConfigType("toml")
					defaultMoulConfig.SetConfigName("moul")
					defaultMoulConfig.ReadInConfig()
					defaultMoulConfig.Set("deployment.target", target)
					defaultMoulConfig.WriteConfigAs(filepath.Join(".", cwd, "moul.toml"))
					return nil
				},
			},
			{
				Name:    "build",
				Aliases: []string{"b"},
				Usage:   "",
				Action: func(c *cli.Context) error {
					envy.Set("MOUL_ENV", "prod")
					profile := internal.ParseProfile(cache, moulConfig)
					p, err := json.Marshal(profile)
					if err != nil {
						log.Fatal(err)
					}
					if err := os.MkdirAll(filepath.Join(".", ".moul", "data"), 0755); err != nil {
						log.Fatal(err)
					}
					profileFile, err := os.Create(filepath.Join(".", ".moul", "data", "profile.json"))
					if err != nil {
						log.Fatal(err)
					}
					defer profileFile.Close()
					profileFile.WriteString(string(p))

					stories := internal.ParseMd(cache, moulConfig)
					s, err := json.Marshal(stories)
					if err != nil {
						log.Fatal(err)
					}
					storiesFile, err := os.Create(filepath.Join(".", ".moul", "data", "stories.json"))
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
					profile := internal.ParseProfile(cache, moulConfig)
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

					stories := internal.ParseMd(cache, moulConfig)
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
