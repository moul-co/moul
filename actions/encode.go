package actions

import (
	"encoding/base64"
	"fmt"

	"github.com/disintegration/imaging"
	"github.com/galdor/go-thumbhash"
	"github.com/urfave/cli/v2"
)

func Encode(ctx *cli.Context) error {
	inFile := ctx.String("in")
	img, err := imaging.Open(inFile, imaging.AutoOrientation(true))
	if err != nil {
		return err
	}

	th := ctx.String("thumbhash")
	if th != "" {
		th := thumbhash.EncodeImage(img)

		fmt.Printf("%v", base64.StdEncoding.EncodeToString(th))
	}

	return nil
}
