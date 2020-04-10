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

	"github.com/fatih/color"
	"github.com/gobuffalo/plush"
	"github.com/moulco/moul/internal"
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
		Short: "A publishing tool for photographers, visual storytellers.",
		Run: func(cmd *cobra.Command, args []string) {
			dir, err := internal.GetDirectory()
			if err != nil {
				fmt.Println(err)
				os.Exit(1)
			}

			fmt.Println("Start dev server...")

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

				mc = append(mc, internal.Collection{
					Name:     filepath.Base(photo),
					WidthHd:  widthHd,
					HeightHd: heightHd,
					Width:    750,
					Height:   int(math.Round(height)),
				})
			}
			mcj, _ := json.Marshal(mc)

			cover := internal.GetPhotos(filepath.Join(dir, "photos", "cover"))
			coverName := filepath.Base(cover[0])
			avatar := internal.GetPhotos(filepath.Join(dir, "photos", "avatar"))
			avatarName := filepath.Base(avatar[0])

			moulConfig := viper.New()
			moulConfig.SetConfigName("moul")
			moulConfig.AddConfigPath(".")
			err = moulConfig.ReadInConfig()
			if err != nil {
				fmt.Printf("Fatal error config file: %s \n", err)
			}

			t := internal.Template()
			ctx := plush.NewContext()
			ctx.Set("isProd", false)
			ctx.Set("version", version)
			ctx.Set("base", moulConfig.Get("base"))
			ctx.Set("profile", moulConfig.Get("profile"))
			ctx.Set("avatar", avatarName)

			ctx.Set("cover", map[string]string{
				"name": coverName,
			})
			ctx.Set("content", moulConfig.Get("content"))

			ctx.Set("social", moulConfig.Get("social"))
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
