package reader

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestTemplate(t *testing.T) {
	output, err := executeTemplate("reader.tmpl", map[string]interface{}{
		"title": "%TITLE%",
	})
	require.NoError(t, err)
	require.Equal(t, 1, len(templates))
	require.Contains(t, output, `<title>%TITLE%</title>`)
}
