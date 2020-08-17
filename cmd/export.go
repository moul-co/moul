package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/gobuffalo/helpers/text"
	"github.com/gobuffalo/plush"
	"github.com/gosimple/slug"
	"github.com/moulco/moul/internal"
	"github.com/otiai10/copy"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	"github.com/tdewolff/minify/v2/svg"
	"github.com/xiam/exif"
)

// Export cmd
var Export = &cobra.Command{
	Use:   "export",
	Short: "Export photo collection",
	Long:  `Export photo collection to static website that can be deploy anywhere.`,
	Run: func(cmd *cobra.Command, args []string) {
		s := spinner.New(spinner.CharSets[21], 100*time.Millisecond)
		s.Prefix = "■ Exporting photo collection... "
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
		moulConfig.SetDefault("ga_measurement_id", "")
		moulConfig.SetDefault("favicon", "false")
		moulConfig.SetDefault("exif", "true")
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
			name := internal.GetFileName(fn, slugName)
			fnName := strings.ToLower(strings.TrimSuffix(fn, filepath.Ext(fn)))

			pid := config.GetString(slug.Make(fn) + ".id")

			widthHd, heightHd := internal.GetPhotoDimension(
				filepath.Join(".moul", "photos", pid, "collection", "2048", name+".jpg"),
			)
			width, height := internal.GetPhotoDimension(
				filepath.Join(".moul", "photos", pid, "collection", "750", name+".jpg"),
			)
			ex := internal.Exif{}
			data, err := exif.Read(
				filepath.Join(filepath.Join(".", "photos", "collection", fn)),
			)
			if err == nil {
				ex.Make = data.Tags["Manufacturer"]
				ex.Model = data.Tags["Model"]
				ex.Aperture = data.Tags["F-Number"]
				ex.DateTime = data.Tags["Date and Time"]
				ex.ExposureTime = data.Tags["Exposure Time"]
				ex.FocalLength = data.Tags["Focal Length"]
				ex.Iso = data.Tags["ISO Speed Ratings"]
			}

			mc = append(mc, internal.Collection{
				ID:       pid,
				Name:     fnName,
				WidthHd:  widthHd,
				HeightHd: heightHd,
				Width:    width,
				Height:   height,
				Exif:     ex,
				Color:    "rgba(0, 0, 0, .93)",
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
		ctx.Set("md", text.Markdown)
		ctx.Set("isProd", true)
		ctx.Set("version", version)
		ctx.Set("base", moulConfig.Get("base"))
		ctx.Set("favicon", moulConfig.Get("favicon"))
		ctx.Set("exif", moulConfig.Get("exif"))
		ctx.Set("style", moulConfig.Get("style"))
		ctx.Set("profile", moulConfig.Get("profile"))
		ctx.Set("by", slugName)
		ctx.Set("cover", cover)
		ctx.Set("avatar", avatar)
		ctx.Set("content", moulConfig.Get("content"))
		ctx.Set("social", moulConfig.Get("social"))
		ctx.Set("collectionString", string(mcj))
		ctx.Set("measurementId", moulConfig.Get("ga_measurement_id"))

		ts, err := plush.Render(t, ctx)
		if err != nil {
			log.Fatal(err)
		}
		m := minify.New()
		m.AddFunc("text/css", css.Minify)
		m.AddFunc("text/html", html.Minify)
		m.AddFunc("image/svg+xml", svg.Minify)
		mts, err := m.String("text/html", ts)
		if err != nil {
			fmt.Println(err)
		}
		ioutil.WriteFile(filepath.Join(".", ".moul", "index.html"), []byte(mts), 0644)

		out := filepath.Join(".", output)
		if _, err := os.Stat(out); !os.IsNotExist(err) {
			internal.RemoveAll(out)
		}
		os.MkdirAll(out, os.ModePerm)

		copy.Copy(filepath.Join(".", ".moul", "photos"), filepath.Join(out, "photos"))
		copy.Copy(filepath.Join(".", ".moul", "assets"), filepath.Join(out, "assets"))
		copy.Copy(filepath.Join(".", ".moul", "index.html"), filepath.Join(out, "index.html"))

		fmt.Print("\n● Success! Exported photo collection in")
		color.Green(" `%s`", time.Since(start))
		s.Stop()
	},
}
