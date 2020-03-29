package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// Init cmd
var Init = &cobra.Command{
	Use:   "init [collection name]",
	Short: "Initialize photo collection",
	Long:  `init is for initializing new photo collection.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("initializing...")
	},
}
