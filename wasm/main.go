//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"encoding/base64"
	"image/jpeg"
	"math"
	"strconv"
	"strings"
	"syscall/js"

	"github.com/bbrks/go-blurhash"
	"github.com/disintegration/imaging"

	"github.com/moul-co/moul/internal"
)

func main() {
	// renderer for markdoc renderable tree
	js.Global().Set("moulifyContent", moulifyContent())
	// resize photo to maximum 4096
	js.Global().Set("moulifyPhoto", moulifyPhoto())

	<-make(chan bool)
}

func moulifyContent() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			resolve := args[0]
			// reject := args[1]

			go func() {
				layout, _ := internal.TemplatesFS.ReadFile("templates/layouts/main.gohtml")

				// errr := js.Global().Get("Error").New(errors.New("something went wrong").Error())

				resolve.Invoke(string(layout))
				// reject.Invoke(errr)
			}()

			return nil
		})

		// https://withblue.ink/2020/10/03/go-webassembly-http-requests-and-promises.html
		promise := js.Global().Get("Promise")
		return promise.New(handler)
	})
}

func moulifyPhoto() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		photo := make([]uint8, args[0].Get("byteLength").Int())
		js.CopyBytesToGo(photo, args[0])
		pr := bytes.NewReader(photo)

		sizes := strings.Split(args[1].String(), ":")

		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			resolve := args[0]
			reject := args[1]
			go func() {
				imgDecode, err := imaging.Decode(pr, imaging.AutoOrientation(true))
				if err != nil {
					reject.Invoke(err.Error())
				}

				availbleSizes := internal.PhotoGetSizes(imgDecode.Bounds().Dx(), imgDecode.Bounds().Dy())
				xlb := new(bytes.Buffer)
				mdb := new(bytes.Buffer)
				xsb := new(bytes.Buffer)

				for _, size := range sizes {
					if size == "xl" {
						s := strings.Split(availbleSizes["xl"], ":")
						xlw, _ := strconv.Atoi(s[0])
						xlh, _ := strconv.Atoi(s[1])
						xl := imaging.Resize(imgDecode, xlw, xlh, imaging.Lanczos)
						err = jpeg.Encode(xlb, xl, &jpeg.Options{Quality: 95})
						if err != nil {
							reject.Invoke(err.Error())
						}
					}
					if size == "md" {
						s := strings.Split(availbleSizes["md"], ":")
						mdw, _ := strconv.Atoi(s[0])
						mdh, _ := strconv.Atoi(s[1])
						md := imaging.Resize(imgDecode, mdw, mdh, imaging.Lanczos)
						err = jpeg.Encode(mdb, md, &jpeg.Options{Quality: 95})
						if err != nil {
							reject.Invoke(err.Error())
						}
					}
					if size == "xs" {
						ratio := math.Min(32/float64(imgDecode.Bounds().Dx()), 32/float64(imgDecode.Bounds().Dy()))
						thumbnail := imaging.Resize(imgDecode, int(float64(imgDecode.Bounds().Dx())*ratio), 0, imaging.Lanczos)

						xCom, yCom := internal.PhotoGetComSizes(thumbnail.Bounds().Dx(), thumbnail.Bounds().Dy())
						hash, err := blurhash.Encode(int(xCom), int(yCom), thumbnail)
						if err != nil {
							reject.Invoke(err.Error())
						}
						w := float64(thumbnail.Bounds().Dx()) * ratio
						h := float64(thumbnail.Bounds().Dy()) * ratio
						decodedB64, err := blurhash.Decode(hash, int(w), int(h), 1)
						if err != nil {
							reject.Invoke(err.Error())
						}

						err = jpeg.Encode(xsb, decodedB64, &jpeg.Options{Quality: 95})
						if err != nil {
							reject.Invoke(err.Error())
						}
					}
				}

				resolve.Invoke(
					map[string]interface{}{
						"width":  imgDecode.Bounds().Dx(),
						"height": imgDecode.Bounds().Dy(),
						"xl":     base64.StdEncoding.EncodeToString(xlb.Bytes()),
						"md":     base64.StdEncoding.EncodeToString(mdb.Bytes()),
						"xs":     base64.StdEncoding.EncodeToString(xsb.Bytes()),
					},
				)
			}()
			return nil
		})
		promise := js.Global().Get("Promise")
		return promise.New(handler)
	})
}
