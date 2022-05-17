package testutils

import (
	"database/sql"
	"path"
	"runtime"

	"github.com/go-testfixtures/testfixtures/v3"
)

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func SetupFixtureDatabase(db *sql.DB) {
	_, filename, _, _ := runtime.Caller(0)

	fixtures, err := testfixtures.New(
		testfixtures.Database(db),
		testfixtures.Dialect("sqlite"),
		testfixtures.Directory(path.Dir(filename)+"/../fixtures/testdata"),
	)
	must(err)
	must(fixtures.Load())
}
