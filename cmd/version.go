package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// VersionCmd version
var VersionCmd = &cobra.Command{
	Use:   "version",
	Short: "Version",
	Long:  "Version",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(Version)
	},
}
