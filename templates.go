package reader

import (
	"embed"
	"io"

	"github.com/flosch/pongo2/v6"
	"github.com/pkg/errors"
)

var (
	//go:embed *.tmpl
	templateFS embed.FS
	templates  = make(map[string]*pongo2.Template)
)

func executeTemplate(name string, context pongo2.Context) (string, error) {
	tmpl, ok := templates[name]
	if !ok {
		fs, err := templateFS.Open(name)
		if err != nil {
			return "", errors.Wrapf(err, "lookupTemplate failed")
		}
		defer fs.Close()

		content, err := io.ReadAll(fs)
		if err != nil {
			return "", errors.Wrapf(err, "fail to read template file")
		}

		tmpl, err = pongo2.FromBytes(content)
		if err != nil {
			return "", errors.Wrapf(err, "fail to load template")
		}

		templates[name] = tmpl
	}

	return tmpl.Execute(context)
}
