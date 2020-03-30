package internal

import (
	"os"
	"path/filepath"

	"github.com/fatih/color"
)

// GetDirectory func
func GetDirectory() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", err
	}

	if _, err := os.Stat(filepath.Join(dir, "moul.toml")); os.IsNotExist(err) {
		color.Red("`moul.toml` file is not found!")
		return "", err
	}

	return dir, nil
}
