package main

import (
	"fmt"
	"log"
	"os"

	"github.com/urfave/cli/v2"

	"github.com/moul-co/moul/actions"
)

var version string

func main() {
	app := &cli.App{
		Name:   "moul",
		Usage:  "The minimalist publishing tool for photographers",
		Action: actions.Moul,
		Commands: []*cli.Command{
			// {
			// 	Name:    "dev",
			// 	Aliases: []string{"d"},
			// 	Action:  actions.Dev,
			// },
			{
				Name:    "photo",
				Aliases: []string{"p"},
				Action:  actions.Photo,
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "size",
						Value: "md:xl",
					},
					&cli.StringFlag{
						Name:  "in",
						Value: "",
					},
					&cli.StringFlag{
						Name:  "out",
						Value: "",
					},
					&cli.StringFlag{
						Name:  "hash",
						Value: "thumbhash",
					},
					&cli.StringFlag{
						Name:  "avatar",
						Value: "false",
					},
				},
			},
			{
				Name:    "version",
				Aliases: []string{"v"},
				Action: func(ctx *cli.Context) error {
					fmt.Println(version)
					return nil
				},
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
