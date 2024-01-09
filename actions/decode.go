package actions

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/png"
	"math"

	"github.com/bbrks/go-blurhash"
	"github.com/galdor/go-thumbhash"
	"github.com/urfave/cli/v2"
)

func Decode(ctx *cli.Context) error {
	bh := ctx.String("blurhash")
	var err error
	var img image.Image
	bf := new(bytes.Buffer)

	if bh != "" {
		width := ctx.Float64("width")
		height := ctx.Float64("height")

		ratio := math.Min(32/float64(width), 32/float64(height))

		img, err = blurhash.Decode(bh, int(width*ratio), int(height*ratio), 1)
		if err != nil {
			return err
		}
	}

	th := ctx.String("thumbhash")
	boost := ctx.Float64("boost")
	if th != "" {
		hash, err := base64.StdEncoding.DecodeString(th)
		if err != nil {
			return err
		}

		img, err = thumbhash.DecodeImageWithCfg(hash, thumbhash.DecodingCfg{
			SaturationBoost: boost,
			BaseSize:        100,
		})
		if err != nil {
			return err
		}
	}

	png.Encode(bf, img)
	fmt.Printf("data:image/png;base64,%v", base64.StdEncoding.EncodeToString(bf.Bytes()))

	return nil
}
