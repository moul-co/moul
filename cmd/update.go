package cmd

import (
	"log"

	"github.com/blang/semver"
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
			log.Println("Binary update failed:", err)
		}

		if latest.Version.Equals(v) {
			log.Println("Current binary is the latest version", Version)
		} else {
			log.Println("Successfully updated to version", latest.Version)
		}
	},
}
