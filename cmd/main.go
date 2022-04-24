package main

import (
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sync"

	"moul/internal"

	"github.com/fatih/color"
	"github.com/fsnotify/fsnotify"
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
	logBlue := color.New(color.FgBlue, color.Bold)
	logBlack := color.New(color.FgBlack, color.Bold)

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
					logBlue.Printf("\n● Creating `%v`\n", cwd)
					target := c.Args().Get(1)
					for _, p := range []string{".moul", "photos", "public", "stories"} {
						toCreateDir := filepath.Join(".", cwd, p)
						if err := os.MkdirAll(toCreateDir, 0755); err != nil {
							log.Fatal(err)
						}
					}

					for _, p := range []string{"cover", "picture"} {
						toCreateDir := filepath.Join(".", cwd, "photos", "profile", p)
						if err := os.MkdirAll(toCreateDir, 0755); err != nil {
							log.Fatal(err)
						}
					}
					for _, p := range []string{"_assets", "_shared", "routes"} {
						if err := os.MkdirAll(filepath.Join(".", cwd, ".moul", "public", "build", p), 0755); err != nil {
							log.Fatal(err)
						}
					}

					buildDir, _ := boilerplate.ReadDir("boilerplate/dev/build")
					for _, f := range buildDir {
						if !f.IsDir() {
							data, _ := boilerplate.ReadFile(fmt.Sprintf("boilerplate/dev/build/%v", f.Name()))
							os.WriteFile(filepath.Join(".", cwd, ".moul", "public", "build", f.Name()), data, 0644)
						} else {
							subDir, _ := boilerplate.ReadDir("boilerplate/dev/build/" + f.Name())
							for _, s := range subDir {
								if !s.IsDir() {
									outSubDie := f.Name()
									if outSubDie != "routes" {
										outSubDie = "_" + outSubDie
									}
									data, _ := boilerplate.ReadFile(fmt.Sprintf("boilerplate/dev/build/%v/%v", f.Name(), s.Name()))
									os.WriteFile(filepath.Join(".", cwd, ".moul", "public", "build", outSubDie, s.Name()), data, 0644)
								}
							}
						}
					}
					serverJs, _ := boilerplate.ReadFile("boilerplate/dev/index.js")
					os.WriteFile(filepath.Join(".", cwd, ".moul", "server.js"), serverJs, 0644)
					build, _ := boilerplate.ReadFile("boilerplate/deploy.sh")
					os.WriteFile(filepath.Join(".", cwd, ".moul", "deploy.sh"), build, 0755)
					gitkeep, _ := boilerplate.ReadFile("boilerplate/.gitkeep")
					for _, p := range []string{
						filepath.Join(".", cwd, "stories"),
						filepath.Join(".", cwd, "photos", "profile", "cover"),
						filepath.Join(".", cwd, "photos", "profile", "picture"),
					} {
						os.WriteFile(filepath.Join(p, ".gitkeep"), gitkeep, 0644)
					}

					switch target {
					case "vercel":
						target = "vercel"
					case "netlify":
						target = "netlify"
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
					}

					indexMd, _ := boilerplate.ReadFile("boilerplate/moul.toml")
					os.WriteFile(filepath.Join(".", cwd, "moul.toml"), indexMd, 0644)
					gitignore, _ := boilerplate.ReadFile("boilerplate/.gitignore")
					os.WriteFile(filepath.Join(".", cwd, ".gitignore"), gitignore, 0644)
					defaultMoulConfig := viper.New()
					defaultMoulConfig.AddConfigPath(filepath.Join(".", cwd))
					defaultMoulConfig.SetConfigType("toml")
					defaultMoulConfig.SetConfigName("moul")
					defaultMoulConfig.ReadInConfig()
					defaultMoulConfig.Set("deployment.target", target)
					defaultMoulConfig.WriteConfigAs(filepath.Join(".", cwd, "moul.toml"))
					logBlue.Printf("● Created `%v`\n\n", cwd)
					logBlack.Printf("  ● To get start `cd %v`\n", cwd)
					logBlack.Println("  ● To create a story `moul new \"My Awesome Story\"`")
					logBlack.Printf("  ● To preview locally `moul preview`\n\n")
					return nil
				},
			},
			{
				Name:  "deploy",
				Usage: "",
				Action: func(c *cli.Context) error {
					if err := validMoulProject(); err != nil {
						log.Fatalf("Not a valid moul project!")
					}
					appDir, err := boilerplate.ReadDir("boilerplate/app")
					if err != nil {
						log.Fatal(err)
					}
					baseAppDir := filepath.Join(".", ".moul", "app")
					if err := os.MkdirAll(baseAppDir, 0755); err != nil {
						log.Fatal(err)
					}
					for _, f := range appDir {
						if !f.IsDir() {
							file, _ := boilerplate.ReadFile("boilerplate/app/" + f.Name())
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
					for _, f := range []string{"package.json", "tsconfig.json"} {
						pkg, _ := boilerplate.ReadFile("boilerplate/" + f)
						os.WriteFile(filepath.Join(".", f), pkg, 0644)
					}

					writeTargetPlatformFiles(moulConfig.GetString("deployment.target"))
					switch moulConfig.GetString("deployment.target") {
					case "vercel", "netlify":
						file, _ := boilerplate.ReadFile("boilerplate/node.sh")
						os.WriteFile(filepath.Join(".", ".moul", "node.sh"), file, 0755)
						cmd := exec.Command("./.moul/node.sh")
						_, err := cmd.Output()
						if err != nil {
							log.Fatal("exec node.sh", err)
						}
					default:
						file, _ := boilerplate.ReadFile("boilerplate/cloudflare.sh")
						os.WriteFile(filepath.Join(".", ".moul", "cloudflare.sh"), file, 0755)
						cmd := exec.Command("./.moul/cloudflare.sh")
						_, err := cmd.Output()
						if err != nil {
							log.Fatal("exec cloudflare.sh", err)
						}
					}

					return nil
				},
			},
			{
				Name:    "build",
				Aliases: []string{"b"},
				Usage:   "",
				Action: func(c *cli.Context) error {
					if err := validMoulProject(); err != nil {
						log.Fatalf("Not a valid moul project!")
					}
					envy.Set("MOUL_ENV", "prod")

					logBlack.Println("\nBuilding profile...")
					profile := internal.ParseProfile(cache, moulConfig)
					p, err := json.Marshal(profile)
					if err != nil {
						log.Fatal(err)
					}
					if err := os.MkdirAll(filepath.Join(".", ".moul", "app", "data"), 0755); err != nil {
						log.Fatal(err)
					}
					profileFile, err := os.Create(filepath.Join(".", ".moul", "app", "data", "profile.json"))
					if err != nil {
						log.Fatal(err)
					}
					defer profileFile.Close()
					profileFile.WriteString(string(p))
					logBlack.Println("Building stories...")
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
					logBlack.Println("\nBuilt successful.\n")
					return nil
				},
			},
			{
				Name:    "new",
				Aliases: []string{"n"},
				Usage:   "",
				Action: func(c *cli.Context) error {
					if err := validMoulProject(); err != nil {
						log.Fatalf("Not a valid moul project!")
					}
					title := c.Args().First()
					fn := slug.Make(title)
					story := filepath.Join(".", "stories", fn+".md")
					if _, err := os.Stat(story); err == nil {
						log.Fatal(filepath.Base(story) + " already exists")
					}
					md, err := os.Create(story)
					if err != nil {
						log.Fatal(err)
					}
					defer md.Close()
					md.WriteString("# " + title)
					logBlack.Printf("\n● Created story: `%v` \n", story)
					if err := os.MkdirAll(filepath.Join(".", "photos", fn, "cover"), 0755); err != nil {
						log.Fatal(err)
					}
					gitkeep, _ := boilerplate.ReadFile("boilerplate/.gitkeep")
					os.WriteFile(filepath.Join(".", "photos", fn, "cover", ".gitkeep"), gitkeep, 0644)
					logBlack.Printf("● Created folder: `%v` \n\n", filepath.Join(".", "photos", fn))
					return nil
				},
			},
			{
				Name:    "dev",
				Aliases: []string{"d"},
				Usage:   "",
				Action: func(c *cli.Context) error {
					if err := validMoulProject(); err != nil {
						log.Fatalf("Not a valid moul project!")
					}
					envy.Set("MOUL_ENV", "dev")
					if err := os.MkdirAll(filepath.Join(".", ".moul", "public", "__moul"), 0755); err != nil {
						log.Fatal(err)
					}
					logBlack.Println("\nBuilding profile...")
					devBuildProfile()
					logBlack.Println("Building stories...")
					devBuildStories()
					logBlack.Println("\nBuilt successful.\n")

					var wg sync.WaitGroup
					wg.Add(2)
					go startNode(&wg)
					go startFs(&wg)
					watcher, err := fsnotify.NewWatcher()
					if err != nil {
						log.Fatal(err)
					}
					defer watcher.Close()

					done := make(chan bool)
					go func() {
						for {
							select {
							case event, ok := <-watcher.Events:
								if !ok {
									return
								}
								if event.Op&fsnotify.Write == fsnotify.Write {
									devBuildProfile()
									devBuildStories()
									logBlack.Println("Rebuilt.")
								}
							case err, ok := <-watcher.Errors:
								if !ok {
									return
								}
								log.Fatal(err)
							}
						}
					}()

					err = watcher.Add(filepath.Join(".", "stories"))
					if err != nil {
						log.Fatal(err)
					}
					_ = watcher.Add(filepath.Join(".", "moul.toml"))
					wg.Wait()
					<-done
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

func validMoulProject() error {
	if _, err := os.Stat(filepath.Join(".", "moul.toml")); errors.Is(err, os.ErrNotExist) {
		return err
	}
	return nil
}

func devBuildProfile() {
	profile := internal.ParseProfile(cache, moulConfig)
	p, err := json.Marshal(profile)
	if err != nil {
		log.Fatal(err)
	}
	profileFile, err := os.Create(filepath.Join(".", ".moul", "public", "__moul", "profile.json"))
	if err != nil {
		log.Fatal(err)
	}
	defer profileFile.Close()
	profileFile.WriteString(string(p))
}

func devBuildStories() {
	stories := internal.ParseMd(cache, moulConfig)
	s, err := json.Marshal(stories)
	if err != nil {
		log.Fatal(err)
	}
	storiesFile, err := os.Create(filepath.Join(".", ".moul", "public", "__moul", "stories.json"))
	if err != nil {
		log.Fatal(err)
	}
	defer storiesFile.Close()
	storiesFile.WriteString(string(s))
}

func startNode(wg *sync.WaitGroup) {
	defer wg.Done()
	cmd := exec.Command("node", filepath.Join(".", ".moul", "server.js"))
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

func writeTargetPlatformFiles(target string) {
	files, _ := boilerplate.ReadDir("boilerplate/" + target)
	for _, f := range files {
		if !f.IsDir() {
			content, _ := boilerplate.ReadFile(fmt.Sprintf("boilerplate/%v/%v", target, f.Name()))
			os.WriteFile(filepath.Join(".", f.Name()), content, 0644)
		}
	}
}
