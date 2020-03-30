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

		path := filepath.Join(dir, "photos", "collection")
		if _, err := os.Stat(path); os.IsNotExist(err) {
			color.Red("`collection` folder is not found!")
			os.Exit(1)
		}
		internal.Resize("collection", "sophearak-tha", path, internal.UniqueID(), []int{2048, 750})

		fmt.Println("Took:", time.Since(start))
		s.Stop()
	},
}
