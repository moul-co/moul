package cmd

import (
	"fmt"

	"github.com/blang/semver"
	"github.com/fatih/color"
	"github.com/rhysd/go-github-selfupdate/selfupdate"
	"github.com/spf13/cobra"
)

// Update cmd
var Update = &cobra.Command{
	Use:   "update",
	Short: "update to latest version",
	Run: func(cmd *cobra.Command, args []string) {
		v := semver.MustParse(Version)

		latest, err := selfupdate.UpdateSelf(v, "moulco/moul")
		if err != nil {
			color.Red("Binary update failed:", err)
		}

		if latest.Version.Equals(v) {
			fmt.Println("Current binary is the latest version", Version)
		} else {
			color.Green("Successfully updated to latest version")
		}
	},
}
