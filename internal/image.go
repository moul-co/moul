package internal

import (
	"bytes"
	"fmt"
	"image/png"
	"net/http"
	"strconv"

	"github.com/fogleman/gg"
	"github.com/gobuffalo/packr/v2"
	"github.com/golang/freetype/truetype"
)

// ImageHandler func
func ImageHandler(w http.ResponseWriter, r *http.Request) {
	width := r.URL.Query().Get("width")
	height := r.URL.Query().Get("height")
	title := r.URL.Query().Get("title")
	text := r.URL.Query().Get("text")

	box := packr.New("assets", "../assets")
	wInt, _ := strconv.Atoi(width)
	hInt, _ := strconv.Atoi(height)

	dc := gg.NewContext(wInt, hInt)
	dc.DrawRectangle(0, 0, float64(wInt), float64(hInt))
	dc.SetHexColor("#1b1b1d")
	dc.Fill()
	dc.Clear()

	fbold, err := box.Find("JetBrainsMono-ExtraBold.ttf")
	if err != nil {
		fmt.Println(err)
	}
	f, err := box.Find("JetBrainsMono-Regular.ttf")
	if err != nil {
		fmt.Println(err)
	}

	fontb, err := truetype.Parse(fbold)
	if err != nil {
		fmt.Println(err)
	}
	font, err := truetype.Parse(f)
	if err != nil {
		fmt.Println(err)
	}

	titleFont := truetype.NewFace(fontb, &truetype.Options{Size: 40})
	textFont := truetype.NewFace(font, &truetype.Options{Size: 28})
	dc.SetFontFace(titleFont)
	dc.SetHexColor("#ffffff")
	dc.DrawStringAnchored(title, float64(wInt)/2, float64(hInt)/1.5, 0.5, 0.5)
	dc.SetFontFace(textFont)
	dc.DrawStringAnchored(text, float64(wInt)/2, float64(hInt)/1.3, 0.5, 0.5)

	buffer := new(bytes.Buffer)
	png.Encode(buffer, dc.Image())

	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Content-Length", strconv.Itoa(len(buffer.Bytes())))
	w.Write(buffer.Bytes())
}
