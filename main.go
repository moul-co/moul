package main

import (
	"log"
	"os"

	"github.com/urfave/cli/v2"

	"github.com/moul-co/moul/actions"
)

func main() {
	app := &cli.App{
		Name:   "moul",
		Usage:  "The minimalist publishing tool for photographers",
		Action: actions.Moul,
		Commands: []*cli.Command{
			{
				Name:    "dev",
				Aliases: []string{"d"},
				Action:  actions.Dev,
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
