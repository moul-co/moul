package actions

import (
	"log"

	"github.com/urfave/cli/v2"

	"github.com/moul-co/moul/handlers"
)

func Dev(ctx *cli.Context) error {
	app := handlers.App()
	log.Fatal(app.Listen(":3000"))

	return nil
}
