package internal

import (
	"bytes"
	"embed"
	"fmt"
	"html"
	"html/template"

	"github.com/tidwall/gjson"
)

//go:embed templates/*
var TemplatesFS embed.FS

func RenderContent(content string) (string, error) {
	var rendered string
	cover := gjson.Get(content, `children.#(name=="cover")`)

	if cover.Exists() {
		coverRender, err := render("cover", map[string]interface{}{
			"Pid": cover.Get("children.0.attributes.pid").String()})
		if err != nil {
			return "", err
		}

		rendered += coverRender
	}

	children := gjson.Get(content, "children")
	if children.Exists() {
		for _, node := range children.Array() {
			// fmt.Println(node.Get("name").String())
			switch node.Get("name").String() {
			case "p":
				pNode := ""
				for _, p := range node.Get("children").Array() {
					pNode += html.EscapeString(p.String()) + " "
				}
				renderParagraph, err := render(
					"paragraph",
					map[string]interface{}{
						"Paragraph": pNode},
				)
				if err != nil {
					return "", err
				}
				rendered += renderParagraph

			case "blockquote":
				blockquoteNode := ""
				for _, b := range node.Get("children.0.children").Array() {
					blockquoteNode += html.EscapeString(b.String()) + " "
				}
				blockqouteRender, err := render(
					"blockquote",
					map[string]interface{}{
						"Blockquote": blockquoteNode},
				)
				if err != nil {
					return "", err
				}
				rendered += blockqouteRender
			}
		}
	}

	return rendered, nil
}

func render(name string, args map[string]interface{}) (string, error) {
	tpl, err := TemplatesFS.ReadFile(fmt.Sprintf("templates/partials/%v.gohtml", name))
	if err != nil {
		return "", err
	}
	var b bytes.Buffer
	t, err := template.New("").Parse(string(tpl))
	if err != nil {
		return "", err
	}
	if err = t.Execute(&b, args); err != nil {
		return "", err
	}

	return b.String(), nil
}
