package internal

import (
	"os"
	"path/filepath"
	"runtime"

	"github.com/denisbrodbeck/sqip"
)

// MakeSQIP func
func MakeSQIP(inPath, author, outPrefix, unique string) error {
	workSize := 256
	count := 8
	mode := 1
	alpha := 128
	repeat := 0
	workers := runtime.NumCPU()
	background := ""

	photos := GetPhotos(inPath)

	for _, photo := range photos {
		fn := filepath.Base(photo)
		name := GetFileName(fn, author)
		dir := filepath.Join(".", "photos", unique, outPrefix, "sqip")
		out := filepath.Join(dir, name+".svg")

		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}

		svg, _, _, err := sqip.Run(photo, workSize, count, mode, alpha, repeat, workers, background)

		if err != nil {
			return err
		}
		if err := sqip.SaveFile(out, svg); err != nil {
			return err
		}
	}

	return nil
}
