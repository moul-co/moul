package internal

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"io"
	"os"
)

// GetSHA1 func
func GetSHA1(filePath string) string {
	var sha1String string
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println(err)
	}
	defer file.Close()
	hash := sha1.New()
	if _, err := io.Copy(hash, file); err != nil {
		fmt.Println(err)
	}
	hashInBytes := hash.Sum(nil)[:20]
	sha1String = hex.EncodeToString(hashInBytes)

	return sha1String
}
