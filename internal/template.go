package internal

import (
	"bytes"
	"embed"
	"html/template"

	"github.com/tidwall/gjson"
)

//go:embed templates/*
var TemplatesFS embed.FS

func RenderContent(content string) (string, error) {
	var rendered string
	cover := gjson.Get(content, `children.#(name=="cover")`)

	if cover.Exists() {
		coverTpl, err := TemplatesFS.ReadFile("templates/partials/cover.gohtml")
		if err != nil {
			return "", err
		}
		var b bytes.Buffer
		t, err := template.New("").Parse(string(coverTpl))
		if err != nil {
			return "", err
		}
		if err = t.Execute(&b, map[string]interface{}{
			"Pid": cover.Get("children.0.attributes.pid").String()},
		); err != nil {
			return "", err
		}

		rendered += b.String()
	}

	return rendered, nil
}
