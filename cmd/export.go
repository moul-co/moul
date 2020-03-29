package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// Export cmd
var Export = &cobra.Command{
	Use:   "export",
	Short: "Export photo collection",
	Long:  `Export photo collection to static website that can be deploy anywhere.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("exporting...")
	},
}
