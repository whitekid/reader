package reader

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/whitekid/reader/db"
)

func TestMigrate(t *testing.T) {
	require.NoError(t, migrate(context.Background()))
	require.Equal(t, uint(1), db.Metadata.SchemaVersion())
}
