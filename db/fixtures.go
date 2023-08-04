package db

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
		testfixtures.Dialect("pgx"),
		testfixtures.UseAlterConstraint(),
		testfixtures.Directory(path.Join(path.Dir(filename), "../fixtures/testdata")),
	)
	must(err)
	must(fixtures.Load())
}

func DumpFixture() error {
	_, filename, _, _ := runtime.Caller(0)

	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	dumper, err := testfixtures.NewDumper(
		testfixtures.DumpDatabase(sqlDB),
		testfixtures.DumpDialect("pgx"),
		testfixtures.DumpDirectory(path.Join(path.Dir(filename), "../fixtures/testdata")),
	)
	if err != nil {
		return err
	}

	if err := dumper.Dump(); err != nil {
		return err
	}

	return nil
}

func LoadFixture(dir string) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	_, filename, _, _ := runtime.Caller(0)

	fixtures, err := testfixtures.New(
		testfixtures.Database(sqlDB),
		testfixtures.Dialect("pgx"),
		testfixtures.UseAlterConstraint(),
		testfixtures.Directory(path.Join(path.Dir(filename), "../fixtures/testdata")),
	)
	if err != nil {
		return err
	}

	if err := fixtures.Load(); err != nil {
		return err
	}

	return nil
}
