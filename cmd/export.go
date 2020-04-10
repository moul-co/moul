package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/gobuffalo/plush"
	"github.com/gosimple/slug"
	"github.com/moulco/moul/internal"
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

		config := viper.New()
		config.AddConfigPath(".moul")
		config.SetConfigType("toml")
		config.SetConfigName("collection")
		config.ReadInConfig()

		for _, photo := range photos {
			fn := filepath.Base(photo)
			name := internal.GetFileName(fn, slugName) + ".jpg"

			pid := config.GetString(slug.Make(fn) + ".id")

			widthHd, heightHd := internal.GetPhotoDimension(
				filepath.Join(".moul", "photos", pid, "collection", "2048", name),
			)
			width, height := internal.GetPhotoDimension(
				filepath.Join(".moul", "photos", pid, "collection", "750", name),
			)

			mc = append(mc, internal.Collection{
				ID:       pid,
				Name:     name,
				WidthHd:  widthHd,
				HeightHd: heightHd,
				Width:    width,
				Height:   height,
			})
		}
		mcj, _ := json.Marshal(mc)

		coverPhotos := internal.GetPhotos(coverPath)
		config.SetConfigName("cover")
		config.ReadInConfig()

		cid := config.GetString(slug.Make(filepath.Base(coverPhotos[0])) + ".id")
		coverPathToSqip := filepath.Join(".moul", "photos", cid, "cover", "sqip",
			internal.GetFileName(filepath.Base(coverPhotos[0]), slugName)+".svg",
		)
		inlineCover := internal.GetEncodedSvg(coverPathToSqip)
		cover := map[string]string{
			"id":   cid,
			"name": internal.GetFileName(filepath.Base(coverPhotos[0]), slugName),
			"sqip": inlineCover,
		}

		avatarPhotos := internal.GetPhotos(avatarPath)
		config.SetConfigName("avatar")
		config.ReadInConfig()
		aid := config.GetString(slug.Make(filepath.Base(avatarPhotos[0])) + ".id")
		avatarPathToSqip := filepath.Join(".moul", "photos", aid, "avatar", "sqip",
			internal.GetFileName(filepath.Base(avatarPhotos[0]), slugName)+".svg",
		)
		inlineAvatar := internal.GetEncodedSvg(avatarPathToSqip)
		avatar := map[string]string{
			"id":   aid,
			"name": internal.GetFileName(filepath.Base(avatarPhotos[0]), slugName),
			"sqip": inlineAvatar,
		}

		t := internal.Template()
		ctx := plush.NewContext()
		ctx.Set("isProd", true)
		ctx.Set("version", version)
		ctx.Set("base", moulConfig.Get("base"))
		ctx.Set("profile", moulConfig.Get("profile"))
		ctx.Set("cover", cover)
		ctx.Set("avatar", avatar)
		ctx.Set("content", moulConfig.Get("content"))
		ctx.Set("social", moulConfig.Get("social"))
		ctx.Set("collectionString", string(mcj))

		ts, err := plush.Render(t, ctx)
		if err != nil {
			log.Fatal(err)
		}
		ioutil.WriteFile(filepath.Join(".", ".moul", "index.html"), []byte(ts), 0644)

		fmt.Println("Took:", time.Since(start))
		s.Stop()
	},
}
