package cmd

import (
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

		viper.SetConfigName("moul")
		viper.AddConfigPath(".")
		err = viper.ReadInConfig()
		if err != nil {
			fmt.Printf("Fatal error config file: %s \n", err)
		}

		slugName := slug.Make(fmt.Sprintf("%v", viper.Get("profile.name")))

		unique := internal.UniqueID()
		internal.Resize(collectionPath, slugName, "collection", unique, []int{2048, 750})
		internal.MakeSQIP(collectionPath, slugName, "collection", unique)

		coverPath := filepath.Join(dir, "photos", "cover")
		if _, err := os.Stat(coverPath); os.IsNotExist(err) {
			color.Yellow("Skipped `cover`")
		} else {
			internal.Resize(coverPath, slugName, "cover", unique, []int{2560, 1280, 620})
			internal.MakeSQIP(coverPath, slugName, "cover", unique)
		}

		avatarPath := filepath.Join(dir, "photos", "avatar")
		if _, err := os.Stat(avatarPath); os.IsNotExist(err) {
			color.Yellow("Skipped `avatar`")
		} else {
			internal.Resize(avatarPath, slugName, "avatar", unique, []int{512, 320})
			internal.MakeSQIP(avatarPath, slugName, "avatar", unique)
		}

		cacheConfig := viper.New()
		cacheConfig.SetConfigName("cache")
		cacheConfig.AddConfigPath(".moul")
		cacheConfig.Set("unique", unique)
		cacheConfig.WriteConfigAs(filepath.Join(".", ".moul", "cache.toml"))

		photos := internal.GetPhotos(collectionPath)
		mc := []internal.Collection{}

		for _, photo := range photos {
			// widthHd, heightHd := internal.GetPhotoDimension(photo)
			// height := float64(heightHd) / float64(widthHd) * 750

			mc = append(mc, internal.Collection{
				ID:   unique,
				Name: filepath.Base(photo),
				// WidthHd:  widthHd,
				// HeightHd: heightHd,
				// Width:    750,
				// Height:   int(math.Round(height)),
			})
		}
		// mcj, _ := json.Marshal(mc)

		fmt.Println("Took:", time.Since(start))
		s.Stop()
	},
}
