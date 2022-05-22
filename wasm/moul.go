package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image/jpeg"
	"log"
	"math"

	"syscall/js"

	"github.com/bbrks/go-blurhash"
	"github.com/disintegration/imaging"
)

func process() js.Func {
	photo := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 1 {
			return "base64 image"
		}
		// photoStr := args[0].String()
		photoArr := args[0]
		// fmt.Println("decoding image...")
		inBuf := make([]uint8, photoArr.Get("byteLength").Int())
		js.CopyBytesToGo(inBuf, photoArr)
		r := bytes.NewReader(inBuf)
		// imgDecode, err := imaging.Decode(base64.NewDecoder(base64.StdEncoding, strings.NewReader(strings.Split(photoStr, "base64,")[1])), imaging.AutoOrientation(true))
		imgDecode, err := imaging.Decode(r, imaging.AutoOrientation(true))
		if err != nil {
			fmt.Printf("image.Decode: %v", err)
		}
		// fmt.Println("processing blurhash...")
		ratioComponent := math.Min(5/float64(imgDecode.Bounds().Dx()), 5/float64(imgDecode.Bounds().Dy()))
		xCom := float64(imgDecode.Bounds().Dx()) * ratioComponent
		yCom := float64(imgDecode.Bounds().Dy()) * ratioComponent
		hash, err := blurhash.Encode(int(xCom), int(yCom), imgDecode)
		if err != nil {
			fmt.Printf("blurhash: %v", err)
		}
		// fmt.Println("hashing width, height", imgDecode.Bounds().Dx(), imgDecode.Bounds().Dy())
		ratio := math.Min(16/float64(imgDecode.Bounds().Dx()), 16/float64(imgDecode.Bounds().Dy()))
		w := float64(imgDecode.Bounds().Dx()) * ratio
		h := float64(imgDecode.Bounds().Dy()) * ratio
		decodedB64, err := blurhash.Decode(hash, int(w), int(h), 1)
		if err != nil {
			fmt.Println("blurhash.DecodeDraw", err)
		}
		b64Buf := new(bytes.Buffer)
		err = jpeg.Encode(b64Buf, decodedB64, &jpeg.Options{Quality: 95})
		if err != nil {
			log.Println("jpeg.Encode", err)
		}

		return base64.StdEncoding.EncodeToString(b64Buf.Bytes())
	})
	return photo
}

func main() {
	js.Global().Set("moulBlurhash", process())
	<-make(chan bool)
}
