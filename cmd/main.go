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
	"os/exec"
	"path/filepath"
	"sync"

	"github.com/fatih/color"
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
					cwd := slug.Make(project)
					target := c.Args().Get(1)
					for _, p := range []string{".moul", "photos", "public", "stories"} {
						toCreateDir := filepath.Join(".", cwd, p)
						if err := os.MkdirAll(toCreateDir, 0755); err != nil {
							log.Fatal(err)
						}
					}
					pkg, _ := boilerplate.ReadFile("boilerplate/package.json")
					os.WriteFile(filepath.Join(".", cwd, ".moul", "package.json"), pkg, 0644)
					tsc, _ := boilerplate.ReadFile("boilerplate/tsconfig.json")
					os.WriteFile(filepath.Join(".", cwd, ".moul", "tsconfig.json"), tsc, 0644)

					appDir, err := boilerplate.ReadDir("boilerplate/app")
					if err != nil {
						log.Fatal(err)
					}
					baseAppDir := filepath.Join(".", cwd, ".moul", "app")
					if err := os.MkdirAll(baseAppDir, 0755); err != nil {
						log.Fatal(err)
					}

					for _, f := range appDir {
						if !f.IsDir() {
							file, _ := boilerplate.ReadFile("boilerplate/" + f.Name())
							os.WriteFile(filepath.Join(baseAppDir, f.Name()), file, 0644)
						}
					}

					routesDir, err := boilerplate.ReadDir("boilerplate/app/routes")
					if err != nil {
						log.Fatal(err)
					}
					if err := os.MkdirAll(filepath.Join(baseAppDir, "routes"), 0755); err != nil {
						log.Fatal(err)
					}
					for _, rs := range routesDir {
						if !rs.IsDir() {
							file, _ := boilerplate.ReadFile("boilerplate/app/routes/" + rs.Name())
							os.WriteFile(filepath.Join(baseAppDir, "routes", rs.Name()), file, 0644)
						}
					}

					switch target {
					case "vercel":
						target = "vercel"
						writeTargetPlatformFiles(target, cwd)
						break
					case "netlify":
						target = "netlify"
						writeTargetPlatformFiles(target, cwd)
						break
					// case "fly":
					// 	target = "fly"
					// 	writeTargetPlatformFiles(target, cwd)
					// 	break
					// case "railway":
					// 	target = "railway"
					// 	writeTargetPlatformFiles(target, cwd)
					// 	break
					default:
						target = "cloudflare-pages"
						writeTargetPlatformFiles(target, cwd)
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
					cmd := exec.Command("npm", "--prefix", cwd+"/.moul", "install", "--only=prod")
					stdout, err := cmd.Output()
					if err != nil {
						log.Fatal(err)
					}
					fmt.Println(string(stdout))
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
					if err := os.MkdirAll(filepath.Join(".", ".moul", "app"), 0755); err != nil {
						log.Fatal(err)
					}
					profileFile, err := os.Create(filepath.Join(".", ".moul", "app", "data", "profile.json"))
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
					storiesFile, err := os.Create(filepath.Join(".", ".moul", "app", "data", "stories.json"))
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
					d := color.New(color.FgCyan, color.Bold)
					d.Println("Generating profile...")

					profile := internal.ParseProfile(cache, moulConfig)
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
					d.Println("Generated profile.")

					d.Println("Generating stories...")
					stories := internal.ParseMd(cache, moulConfig)
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
					d.Println("Generated stories.")

					var wg sync.WaitGroup
					wg.Add(2)
					go startNode(&wg)
					go startFs(&wg)
					wg.Wait()
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

func startNode(wg *sync.WaitGroup) {
	defer wg.Done()

	fmt.Println("Server running:", filepath.Join(".", ".moul", "index.js"))
	cmd := exec.Command("node", filepath.Join(".", ".moul", "index.js"))
	stdout, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(stdout)
}
func startFs(wg *sync.WaitGroup) {
	defer wg.Done()

	fs := http.FileServer(http.Dir("photos/"))
	http.Handle("/photos/", http.StripPrefix("/photos/", fs))
	fmt.Println("Preview: http://localhost:3000/")
	http.ListenAndServe(":1234", nil)
}

func writeTargetPlatformFiles(target, cwd string) {
	files, _ := boilerplate.ReadDir("boilerplate/" + target)
	for _, f := range files {
		if !f.IsDir() {
			content, _ := boilerplate.ReadFile(fmt.Sprintf("boilerplate/%v/%v", target, f.Name()))
			os.WriteFile(filepath.Join(".", cwd, ".moul", f.Name()), content, 0644)
		}
	}
}
