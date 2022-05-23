package main

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/favicon"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

var (
	app *fiber.App
)

type QueryParam struct {
	PID    string `query:"pid"`
	Prefix string `query:"prefix"`
	Size   string `query:"size"`
}

func main() {
	if app == nil {
		app = fiber.New()
		app.Use(recover.New())
		app.Use(favicon.New())
		app.Use(logger.New())

		app.Get("/moul/photos/:prefix/:pid/:size", func(c *fiber.Ctx) error {
			prefix := c.Params("prefix")
			pid := c.Params("pid")
			size := c.Params("size")
			return c.SendFile(filepath.Join(".moul", "photos", prefix, pid, size+".jpeg"))
		})

		app.Post("/r2", func(c *fiber.Ctx) error {
			qp := new(QueryParam)
			if err := c.QueryParser(qp); err != nil {
				fmt.Println(err)
			}
			img, _, err := image.Decode(bytes.NewReader(c.Body()))
			if err != nil {
				fmt.Println(err)
			}

			baseDir := filepath.Join(".", ".moul", "photos", qp.Prefix, qp.PID)
			if err := os.MkdirAll(filepath.Join(baseDir), 0755); err != nil {
			}
			out, _ := os.Create(filepath.Join(baseDir, qp.Size+".jpeg"))
			defer out.Close()
			err = jpeg.Encode(out, img, &jpeg.Options{Quality: 100})
			if err != nil {
				fmt.Println(err)
			}
			return c.SendString("Ok")
		})

	}

	if err := app.Listen(":3030"); err != nil {
		fmt.Println(err)
	}
}
