//go:build js && wasm
// +build js,wasm

package main

import (
	"embed"
	"syscall/js"
)

//go:embed templates
var templates embed.FS

func main() {
	// renderer for markdoc renderable tree
	js.Global().Set("moulRenderer", moulRenderer())
	// resize photo to maximum 4096
	js.Global().Set("moulResize", moulResize())

	<-make(chan bool)
}

func moulRenderer() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			resolve := args[0]

			go func() {
				layout, _ := templates.ReadFile("templates/layout.gohtml")
				resolve.Invoke(string(layout))
			}()

			return nil
		})

		promiseConstructor := js.Global().Get("Promise")
		return promiseConstructor.New(handler)
	})
}

func moulResize() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 2 {
			return "Need 2 args"
		}

		return ""
	})
}
