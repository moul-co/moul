//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"embed"
	"encoding/base64"
	"errors"
	"image/jpeg"
	"math"
	"syscall/js"

	"github.com/bbrks/go-blurhash"
	"github.com/disintegration/imaging"
)

//go:embed templates
var templates embed.FS

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
			reject := args[1]

			go func() {
				layout, _ := templates.ReadFile("templates/layout.gohtml")

				errr := js.Global().Get("Error").New(errors.New("something went wrong").Error())

				resolve.Invoke(string(layout))
				reject.Invoke(errr)
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

		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			resolve := args[0]
			reject := args[1]
			go func() {
				imgDecode, err := imaging.Decode(pr, imaging.AutoOrientation(true))
				if err != nil {
					reject.Invoke(err.Error())
				}

				ratio := math.Min(32/float64(imgDecode.Bounds().Dx()), 32/float64(imgDecode.Bounds().Dy()))
				thumbnail := imaging.Resize(imgDecode, int(float64(imgDecode.Bounds().Dx())*ratio), 0, imaging.Lanczos)

				ratioComponent := math.Min(5/float64(thumbnail.Bounds().Dx()), 5/float64(thumbnail.Bounds().Dy()))
				xCom := float64(thumbnail.Bounds().Dx()) * ratioComponent
				yCom := float64(thumbnail.Bounds().Dy()) * ratioComponent
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

				b64Buf := new(bytes.Buffer)
				err = jpeg.Encode(b64Buf, decodedB64, &jpeg.Options{Quality: 95})
				if err != nil {
					reject.Invoke(err.Error())
				}

				resolve.Invoke(
					map[string]interface{}{
						"width":    imgDecode.Bounds().Dx(),
						"height":   imgDecode.Bounds().Dy(),
						"blurhash": base64.StdEncoding.EncodeToString(b64Buf.Bytes()),
						"xl":       nil,
						"lg":       nil,
						"md":       nil,
						"sm":       nil,
					},
				)
			}()
			return nil
		})
		promise := js.Global().Get("Promise")
		return promise.New(handler)
	})
}
