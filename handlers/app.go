package handlers

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"path/filepath"

	"github.com/catcombo/go-staticfiles"
	esbuild "github.com/evanw/esbuild/pkg/api"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/favicon"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/template/html"
	"github.com/otiai10/copy"
)

var (
	app *fiber.App
)

//go:embed templates/*
var templatesFS embed.FS

func App() *fiber.App {
	if app == nil {
		result := esbuild.Build(esbuild.BuildOptions{
			EntryPoints: []string{
				"assets/ts/moul.ts",
				"assets/ts/wasm_exec.js",
			},
			Write:             true,
			Bundle:            true,
			MinifyIdentifiers: false,
			MinifySyntax:      true,
			MinifyWhitespace:  true,
			Target:            esbuild.ES2015,
			Loader: map[string]esbuild.Loader{
				".svg": esbuild.LoaderDataURL,
			},
			Outdir: "public/out",
		})
		if len(result.Errors) > 0 {
			log.Println(result.Errors)
		}
		copy.Copy(filepath.Join(".", "assets", "img"), filepath.Join(".", "public", "out"))
		storage, _ := staticfiles.NewStorage("public/assets")
		storage.AddInputDir("public/out")
		err := storage.CollectStatic()
		if err != nil {
			log.Println(err)
		}
		engine := html.NewFileSystem(http.FS(templatesFS), ".gohtml")
		engine.Reload(true)
		engine.Debug(true)
		engine.AddFunc("static", func(path string) string {
			return "/assets/" + storage.Resolve(path)
		})

		app = fiber.New(fiber.Config{
			Views: engine,
		})
		app.Use(recover.New())
		app.Use(favicon.New())
		app.Use(logger.New())

		app.Static("/", "./public")

		app.Get("/", func(c *fiber.Ctx) error {
			var b bytes.Buffer
			t, err := template.New("").Parse("<h1>{{ .Heading }}</h1>")
			if err != nil {
				fmt.Println(err)
			}
			if err = t.Execute(&b, fiber.Map{"Heading": "h1"}); err != nil {
				fmt.Println(err)
			}
			fmt.Println(b.String())

			return c.Render("templates/index", fiber.Map{
				"Title": "Phearak S. Tha",
			}, "templates/layout/main")
		})

		app.Get("/wasm", func(c *fiber.Ctx) error {
			return c.Render("templates/wasm", fiber.Map{}, "templates/layout/write")
		})

		app.Get("/sunset-at-its-finest", func(c *fiber.Ctx) error {
			return c.Render("templates/sunset-at-its-finest", fiber.Map{
				"Title": "Sunset at its finest",
			}, "templates/layout/main")
		})

		app.Get("/virachey-the-raw-beauty-of-nature", func(c *fiber.Ctx) error {
			return c.Render("templates/virachey-the-raw-beauty-of-nature", fiber.Map{
				"Title": "Virachey — The raw beauty of nature",
			}, "templates/layout/main")
		})
	}
	return app
}
