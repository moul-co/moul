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

// RemoveAll func
func RemoveAll(path string) error {
	d, err := os.Open(path)
	if err != nil {
		return err
	}
	defer d.Close()
	names, err := d.Readdirnames(-1)
	if err != nil {
		return err
	}
	for _, name := range names {
		err = os.RemoveAll(filepath.Join(path, name))
		if err != nil {
			return err
		}
	}
	return nil
}
