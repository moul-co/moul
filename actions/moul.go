package actions

import (
	"fmt"

	"github.com/urfave/cli/v2"
)

func Moul(ctx *cli.Context) error {
	fmt.Println(ctx.App.Usage)
	return nil
}
