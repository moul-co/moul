package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// Version version
var Version = &cobra.Command{
	Use:   "version",
	Short: "Version",
	Long:  "Version",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(version)
	},
}
