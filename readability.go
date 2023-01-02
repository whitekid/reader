package reader

import (
	"context"
	"encoding/json"
	"io"

	"github.com/whitekid/goxp"
)

type Article struct {
	Title       string
	Byline      string
	Dir         string
	Content     string
	TextContent string
	Length      int
	Excerpt     string
	SiteName    string
}

func readableArticle(ctx context.Context, r io.Reader, url string) (*Article, error) {
	var article Article
	var parseErr error

	if err := goxp.Exec("node", "readability.js", url).
		Pipe(
			func(stdin io.Writer) { io.Copy(stdin, r) },
			func(stdout io.Reader) { parseErr = json.NewDecoder(stdout).Decode(&article) },
			nil).
		Do(ctx); err != nil {
		return nil, err
	}

	if parseErr != nil {
		return nil, parseErr
	}

	return &article, nil
}
