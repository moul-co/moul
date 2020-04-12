package internal

import (
	"os"
	"path/filepath"
	"runtime"

	"github.com/denisbrodbeck/sqip"
)

// MakeSQIP func
func makeSQIP(unique, inPath, author, photoType string) error {
	workSize := 256
	count := 8
	mode := 0
	alpha := 128
	repeat := 0
	workers := runtime.NumCPU()
	background := ""

	fn := filepath.Base(inPath)
	name := GetFileName(fn, author)
	dir := filepath.Join(".", ".moul", "photos", unique, photoType, "sqip")
	out := filepath.Join(dir, name+".svg")

	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	svg, _, _, err := sqip.Run(inPath, workSize, count, mode, alpha, repeat, workers, background)

	if err != nil {
		return err
	}
	if err := sqip.SaveFile(out, svg); err != nil {
		return err
	}

	return nil
}
