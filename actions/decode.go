package actions

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"image/jpeg"
	"math"

	"github.com/bbrks/go-blurhash"
	"github.com/urfave/cli/v2"
)

func Decode(ctx *cli.Context) error {
	bh := ctx.String("blurhash")

	if bh != "" {
		width := ctx.Float64("width")
		height := ctx.Float64("height")

		ratio := math.Min(32/float64(width), 32/float64(height))

		img, err := blurhash.Decode(bh, int(width*ratio), int(height*ratio), 1)
		if err != nil {
			return err
		}

		xsb := new(bytes.Buffer)
		jpeg.Encode(xsb, img, &jpeg.Options{Quality: 95})
		fmt.Printf("data:image/jpeg;charset=utf-8;base64,%v", base64.StdEncoding.EncodeToString(xsb.Bytes()))

	}

	th := ctx.String("thumbhash")
	if th != "" {
		return errors.New("not support yet")
	}

	return nil
}
