package internal

import (
	"bufio"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"os"
)

// GetEncodedSvg func
func GetEncodedSvg(pathToSvg string) string {
	coverSqip, _ := os.Open(pathToSvg)
	reader := bufio.NewReader(coverSqip)
	content, _ := ioutil.ReadAll(reader)
	encoded := base64.StdEncoding.EncodeToString(content)
	sqipTemp := "data:image/svg+xml;base64,%s"
	return fmt.Sprintf(sqipTemp, encoded)
}
