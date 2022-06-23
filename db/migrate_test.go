package db

import (
	"context"
	"os"
	"testing"

	"github.com/stretchr/testify/require"

	"reader/testutils"
)

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func TestMain(m *testing.M) {
	sqlDB, err := Open("test.db")
	must(err)

	testutils.SetupFixtureDatabase(sqlDB)
	os.Exit(m.Run())
}

func TestMigrateV1(t *testing.T) {
	db.Exec(`UPDATE urls SET original_content = null`)
	db.Exec(`UPDATE metadata SET value = "0" where key="scheme_version"`)

	noContents, _ := URL.noOrignalContent()
	require.NotEqual(t, 0, len(noContents))
	require.NoError(t, migrate(context.Background()))
	require.Equal(t, uint(1), Metadata.SchemaVersion())
}
