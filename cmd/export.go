package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/briandowns/spinner"
	"github.com/fatih/color"
	"github.com/moul-co/moul/internal"
	"github.com/spf13/cobra"
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

		unique := internal.UniqueID()
		internal.Resize(collectionPath, "sophearak-tha", "collection", unique, []int{2048, 750})
		internal.MakeSQIP(collectionPath, "sophearak-tha", "collection", unique)

		coverPath := filepath.Join(dir, "photos", "cover")
		if _, err := os.Stat(coverPath); os.IsNotExist(err) {
			color.Yellow("Skipped `cover`")
		} else {
			internal.Resize(coverPath, "sophearak-tha", "cover", unique, []int{2560, 1280, 620})
			internal.MakeSQIP(coverPath, "sophearak-tha", "cover", unique)
		}

		avatarPath := filepath.Join(dir, "photos", "avatar")
		if _, err := os.Stat(avatarPath); os.IsNotExist(err) {
			color.Yellow("Skipped `avatar`")
		} else {
			internal.Resize(avatarPath, "sophearak-tha", "avatar", unique, []int{512, 320})
			internal.MakeSQIP(avatarPath, "sophearak-tha", "avatar", unique)
		}

		fmt.Println("Took:", time.Since(start))
		s.Stop()
	},
}
