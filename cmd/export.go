package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/gosimple/slug"
	"github.com/moul-co/moul/internal"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// Export cmd
var Export = &cobra.Command{
	Use:   "export",
	Short: "Export photo collection",
	Long:  `Export photo collection to static website that can be deploy anywhere.`,
	Run: func(cmd *cobra.Command, args []string) {
		s := spinner.New(spinner.CharSets[21], 100*time.Millisecond)
		s.Prefix = "Exporting... "
		s.Start()
		start := time.Now()

		dir, err := internal.GetDirectory()
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		collectionPath := filepath.Join(dir, "photos", "collection")
		if _, err := os.Stat(collectionPath); os.IsNotExist(err) {
			color.Red("`collection` folder is not found!")
			os.Exit(1)
		}

		moulConfig := viper.New()
		moulConfig.SetConfigName("moul")
		moulConfig.AddConfigPath(".")
		err = moulConfig.ReadInConfig()
		if err != nil {
			fmt.Printf("Fatal error config file: %s \n", err)
		}

		slugName := slug.Make(moulConfig.GetString("profile.name"))

		internal.Resize(collectionPath, slugName, "collection", []int{2048, 750})

		coverPath := filepath.Join(dir, "photos", "cover")
		if _, err := os.Stat(coverPath); os.IsNotExist(err) {
			color.Yellow("Skipped `cover`")
		} else {
			internal.Resize(coverPath, slugName, "cover", []int{2560, 1280, 620})
		}

		avatarPath := filepath.Join(dir, "photos", "avatar")
		if _, err := os.Stat(avatarPath); os.IsNotExist(err) {
			color.Yellow("Skipped `avatar`")
		} else {
			internal.Resize(avatarPath, slugName, "avatar", []int{512, 320})
		}

		photos := internal.GetPhotos(collectionPath)
		mc := []internal.Collection{}

		cache := viper.New()
		cache.AddConfigPath(".moul")
		cache.SetConfigType("toml")
		cache.SetConfigName("collection")
		cache.ReadInConfig()

		for _, photo := range photos {
			fn := filepath.Base(photo)
			name := internal.GetFileName(fn, slugName) + ".jpg"

			unique := cache.GetString(slug.Make(fn) + ".id")

			widthHd, heightHd := internal.GetPhotoDimension(
				filepath.Join(".moul", "photos", unique, "collection", "2048", name),
			)
			width, height := internal.GetPhotoDimension(
				filepath.Join(".moul", "photos", unique, "collection", "750", name),
			)

			mc = append(mc, internal.Collection{
				ID:       unique,
				Name:     name,
				WidthHd:  widthHd,
				HeightHd: heightHd,
				Width:    width,
				Height:   height,
			})
		}
		mcj, _ := json.Marshal(mc)
		fmt.Println(string(mcj))

		fmt.Println("Took:", time.Since(start))
		s.Stop()
	},
}
