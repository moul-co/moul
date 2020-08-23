package cmd

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"time"

	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/gobuffalo/packr/v2"
	"github.com/spf13/cobra"
)

// Create cmd
var Create = &cobra.Command{
	Use:   "create [collection-name]",
	Short: "Create photo collection",
	Long:  `create is for creating new photo collection.`,
	Args:  cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		s := spinner.New(spinner.CharSets[21], 100*time.Millisecond)
		s.Prefix = "■ Creating a new collection... "
		s.Start()
		time.Sleep(1 * time.Second)
		if _, err := os.Stat(args[0]); !os.IsNotExist(err) {
			color.Yellow("`%s` already exists!", args[0])
			os.Exit(1)
		}
		cwd, err := os.Getwd()
		if err != nil {
			color.Yellow("`%s`", err)
		}

		err = os.MkdirAll(args[0], os.ModePerm)
		if err != nil {
			color.Yellow("%s", err)
		}

		folders := []string{
			filepath.Join("photos", "cover"),
			filepath.Join("photos", "avatar"),
			filepath.Join("photos", "collection"),
			filepath.Join(".moul", "photos", "cover"),
			filepath.Join(".moul", "photos", "avatar"),
			filepath.Join(".moul", "photos", "collection"),
		}
		for _, folder := range folders {
			os.MkdirAll(filepath.Join(".", args[0], folder), os.ModePerm)
		}

		box := packr.New("assets", "./assets")

		mtoml, _ := box.FindString("moul.toml")
		ioutil.WriteFile(filepath.Join(args[0], "moul.toml"), []byte(mtoml), 0644)

		s.Stop()
		fmt.Print("\nSuccess! Created collection at")
		color.Blue(" `%s`", filepath.Join(cwd, args[0]))

		fmt.Print("\n■ Add your `cover`, `avatar`, and `collection`\ninto")
		color.Blue(" `%s`", filepath.Join(args[0], "photos", "cover|avatar|collection"))
		fmt.Print("■ Add your information in")
		color.Blue(" `%s`", filepath.Join(args[0], "moul.toml"))
		fmt.Print("\n● Preview your photo collection:")
		color.Green(" `moul preview`")
		fmt.Print("● Export your photo collection:")
		color.Green(" `moul export`")
	},
}
