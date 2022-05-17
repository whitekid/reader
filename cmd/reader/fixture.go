package main

import (
	"github.com/go-testfixtures/testfixtures/v3"
	"github.com/spf13/cobra"
	"github.com/whitekid/reader/db"
)

func init() {
	cmd := &cobra.Command{
		Use: "fixtures",
	}

	cmd.AddCommand(&cobra.Command{
		Use: "dump database",
		RunE: func(cmd *cobra.Command, args []string) error {
			sqlDB, _ := db.DB()

			dumper, err := testfixtures.NewDumper(
				testfixtures.DumpDatabase(sqlDB),
				testfixtures.DumpDialect("sqlite"),
				testfixtures.DumpDirectory("fixtures/testdata"),
			)
			if err != nil {
				return err
			}

			if err := dumper.Dump(); err != nil {
				return err
			}

			return nil
		},
	})

	rootCmd.AddCommand(cmd)
}
