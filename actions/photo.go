package actions

import (
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/bbrks/go-blurhash"
	"github.com/disintegration/imaging"
	"github.com/galdor/go-thumbhash"
	"github.com/moul-co/moul/internal"
	"github.com/urfave/cli/v2"
)

func Photo(ctx *cli.Context) error {
	inFile := ctx.String("in")
	outPath := ctx.String("out")
	hash := ctx.String("hash")

	if filepath.Ext(outPath) != "" {
		return errors.New("`--out` required directory")
	}

	if _, err := os.Stat(outPath); os.IsNotExist(err) {
		err = os.MkdirAll(outPath, os.ModePerm)
		if err != nil {
			return err
		}
	}

	img, err := imaging.Open(inFile, imaging.AutoOrientation(true))
	if err != nil {
		return err
	}

	sizes := internal.PhotoGetSizes(img.Bounds().Dx(), img.Bounds().Dy())
	for i, size := range sizes {
		s := strings.Split(size, ":")
		xlw, _ := strconv.Atoi(s[0])
		xlh, _ := strconv.Atoi(s[1])
		file := imaging.Resize(img, xlw, xlh, imaging.Lanczos)
		imaging.Save(file, filepath.Join(outPath, fmt.Sprintf("%v.jpeg", i)), imaging.JPEGQuality(95))
	}

	xs, err := imaging.Open(filepath.Join(outPath, "xs.jpeg"), imaging.AutoOrientation(true))
	xsOut := filepath.Join(outPath, "xs.jpeg")
	if hash == "blurhash" {
		xCom, yCom := internal.PhotoGetComSizes(xs.Bounds().Dx(), xs.Bounds().Dy())
		bh, err := blurhash.Encode(int(xCom), int(yCom), xs)
		if err != nil {
			return err
		}

		dbh, err := blurhash.Decode(bh, xs.Bounds().Dx(), xs.Bounds().Dy(), 1)
		if err != nil {
			return err
		}

		imaging.Save(dbh, xsOut, imaging.JPEGQuality(95))

		fmt.Printf("%v:%v\n%v\n", img.Bounds().Dx(), img.Bounds().Dy(), bh)
	} else {
		th := thumbhash.EncodeImage(xs)

		var cfg thumbhash.DecodingCfg
		cfg.SaturationBoost = 1.5

		dth, err := thumbhash.DecodeImageWithCfg(th, cfg)
		if err != nil {
			return err
		}
		imaging.Save(dth, xsOut, imaging.JPEGQuality(95))

		fmt.Printf("%v:%v\n%v\n", img.Bounds().Dx(), img.Bounds().Dy(), base64.StdEncoding.EncodeToString(th))
	}

	return nil
}
