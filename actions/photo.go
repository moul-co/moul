package actions

import (
	"errors"
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/bbrks/go-blurhash"
	"github.com/disintegration/imaging"
	"github.com/moul-co/moul/internal"
	"github.com/urfave/cli/v2"
)

func Photo(ctx *cli.Context) error {
	inFile := ctx.String("in")
	outPath := ctx.String("out")

	if filepath.Ext(outPath) != "" {
		return errors.New("`--out` required directory")
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
	xCom, yCom := internal.PhotoGetComSizes(xs.Bounds().Dx(), xs.Bounds().Dy())
	hash, err := blurhash.Encode(int(xCom), int(yCom), xs)
	if err != nil {
		return err
	}

	dbh, err := blurhash.Decode(hash, xs.Bounds().Dx(), xs.Bounds().Dy(), 2)
	if err != nil {
		return err
	}

	imaging.Save(dbh, filepath.Join(outPath, "xs.jpeg"), imaging.JPEGQuality(95))

	fmt.Printf("%v:%v\n%v\n", img.Bounds().Dx(), img.Bounds().Dy(), hash)
	return nil
}
