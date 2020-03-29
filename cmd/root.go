package cmd

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/gobuffalo/plush"
	"github.com/moul-co/moul/internal"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const (
	// Version constant
	version = "3.0.0"
)

// Execute func
func Execute() {
	var rootCmd = &cobra.Command{
		Use:   "moul",
		Short: "The minimalist photo collection generator.",
		Run: func(cmd *cobra.Command, args []string) {
			dir, err := os.Getwd()
			if err != nil {
				log.Fatal(err)
			}

			if _, err := os.Stat(filepath.Join(dir, "moul.toml")); os.IsNotExist(err) {
				color.Red("`moul.toml` file is not found!")
				os.Exit(1)
			}

			s := spinner.New(spinner.CharSets[36], 100*time.Millisecond)
			s.Prefix = "Start dev server "
			s.Start()
			start := time.Now()

			path := filepath.Join(dir, "photos", "collection")
			if _, err := os.Stat(path); os.IsNotExist(err) {
				color.Red("`collection` folder is not found!")
				os.Exit(1)
			}
			photos := internal.GetPhotos(path)
			mc := []internal.Collection{}

			for _, photo := range photos {
				widthHd, heightHd := internal.GetPhotoDimension(photo)
				height := float64(heightHd) / float64(widthHd) * 750
				pc := "/photos/collection/" + filepath.Base(photo)

				mc = append(mc, internal.Collection{
					Src:      pc,
					SrcHd:    pc,
					WidthHd:  widthHd,
					HeightHd: heightHd,
					Width:    750,
					Height:   int(math.Round(height)),
				})
			}
			mcj, _ := json.Marshal(mc)

			cover := internal.GetPhotos(filepath.Join(dir, "photos", "cover"))
			coverName := filepath.Base(cover[0])
			profile := internal.GetPhotos(filepath.Join(dir, "photos", "profile"))
			profileName := filepath.Base(profile[0])

			viper.SetConfigName("moul")
			viper.AddConfigPath(".")
			err = viper.ReadInConfig()
			if err != nil {
				fmt.Printf("Fatal error config file: %s \n", err)
			}

			t := internal.Template()
			ctx := plush.NewContext()
			ctx.Set("isProd", false)
			ctx.Set("version", version)
			ctx.Set("base", viper.Get("base"))
			ctx.Set("profile", viper.Get("profile"))
			ctx.Set("avatar", profileName)

			ctx.Set("cover", map[string]string{
				"name": coverName,
			})
			ctx.Set("content", viper.Get("content"))

			ctx.Set("social", viper.Get("social"))
			ctx.Set("collectionString", string(mcj))

			ts, err := plush.Render(t, ctx)
			if err != nil {
				log.Fatal(err)
			}
			fs := http.FileServer(http.Dir("cmd/assets/"))
			photoFolder := http.FileServer(http.Dir("photos/"))
			http.Handle("/assets/", http.StripPrefix("/assets/", fs))
			http.Handle("/photos/", http.StripPrefix("/photos/", photoFolder))
			http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "text/html")
				w.Header().Set("Content-Length", strconv.Itoa(len(ts)))
				w.Write([]byte(ts))
			})
			end := time.Since(start)
			fmt.Println(end)
			s.Stop()
			http.ListenAndServe(":5000", nil)

		},
	}

	rootCmd.AddCommand(Init)
	rootCmd.AddCommand(Export)
	rootCmd.AddCommand(Version)

	if err := rootCmd.Execute(); err != nil {
		log.Println(err)
		os.Exit(1)
	}
}
