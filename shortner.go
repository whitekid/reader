package reader

import (
	"github.com/whitekid/goxp/slug"
	"github.com/whitekid/reader/config"
)

var shortner *slug.Shortner

func init() {
	encoding := config.Encoding()
	if encoding == "" {
		encoding = "kJrMZwBbP-1AjW6HuEaxXeTVQU0dy8p29N7g4mYqDlGR_c5nCiIOtozhSsfKL3Fv" // generated with `goxp slug new`
	}
	shortner = slug.NewShortner(encoding)
}

func Shorten(id uint) string { return shortner.Encode(int64(id)) }
