package db

import (
	"context"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestMain(m *testing.M) {
	sqlDB, err := Open()
	must(err)

	SetupFixtureDatabase(sqlDB)
	os.Exit(m.Run())
}

func TestMigrateV1(t *testing.T) {
	db.Exec(`UPDATE urls SET original_content = null`)
	db.Exec(`UPDATE metadata SET value = "0" where key="scheme_version"`)

	noContents, _ := URL.noOrignalContent()
	require.NotEqual(t, 0, len(noContents))
	require.NoError(t, Migrate(context.Background()))
	require.Equal(t, uint(1), Metadata.SchemaVersion())
}
