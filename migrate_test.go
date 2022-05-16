package reader

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/whitekid/reader/db"
)

func TestMigrate(t *testing.T) {
	db.Exec("UPDATE urls SET original_content = null")

	noContents, _ := db.URL.NoOrignalContent()
	require.Equal(t, 1, len(noContents))
	require.NoError(t, migrate(context.Background()))
	require.Equal(t, uint(1), db.Metadata.SchemaVersion())
}
