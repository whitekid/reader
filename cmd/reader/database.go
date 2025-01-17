package main

import (
	"github.com/spf13/cobra"

	"reader/db"
)

func init() {
	rootCmd.AddCommand(&cobra.Command{
		Use:   "migrate",
		Short: "migrate database schema",
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := db.Migrate(cmd.Context()); err != nil {
				return err
			}

			return nil
		},
	})
}
