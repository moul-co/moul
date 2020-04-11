package cmd

import (
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/fatih/color"
	"github.com/gobuffalo/packr/v2"
	"github.com/spf13/cobra"
)

// Init cmd
var Init = &cobra.Command{
	Use:   "init [collection-name]",
	Short: "Initialize photo collection",
	Long:  `init is for initializing new photo collection.`,
	Args:  cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		if _, err := os.Stat(args[0]); !os.IsNotExist(err) {
			color.Yellow("`%s` already exists!", args[0])
		}

		err := os.MkdirAll(args[0], os.ModePerm)
		if err != nil {
			color.Yellow("%s", err)
		}

		folders := []string{
			filepath.Join("photos", "cover"),
			filepath.Join("photos", "avatar"),
			filepath.Join("photos", "collection"),
			filepath.Join(".moul", "assets"),
			filepath.Join(".moul", "photos", "cover"),
			filepath.Join(".moul", "photos", "avatar"),
			filepath.Join(".moul", "photos", "collection"),
		}
		for _, folder := range folders {
			os.MkdirAll(filepath.Join(".", args[0], folder), os.ModePerm)
		}

		box := packr.New("assets", "assets")

		dpng, _ := box.FindString("default-skin.bc570585.png")
		ioutil.WriteFile(
			filepath.Join(args[0], ".moul", "assets", "default-skin.bc570585.png"),
			[]byte(dpng), 0644)

		dsvg, _ := box.FindString("default-skin.4565082c.svg")
		ioutil.WriteFile(
			filepath.Join(args[0], ".moul", "assets", "default-skin.4565082c.svg"),
			[]byte(dsvg), 0644)

		pgif, _ := box.FindString("preloader.cd849b38.gif")
		ioutil.WriteFile(
			filepath.Join(args[0], ".moul", "assets", "preloader.cd849b38.gif"),
			[]byte(pgif), 0644)

		mcss, _ := box.FindString("moul.css")
		ioutil.WriteFile(
			filepath.Join(args[0], ".moul", "assets", "moul.css"), []byte(mcss), 0644,
		)

		mjs, _ := box.FindString("moul.js")
		ioutil.WriteFile(
			filepath.Join(args[0], ".moul", "assets", "moul.js"), []byte(mjs), 0644,
		)

		mtoml, _ := box.FindString("moul.toml")
		ioutil.WriteFile(filepath.Join(args[0], "moul.toml"), []byte(mtoml), 0644)
	},
}
