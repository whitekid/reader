package main

import (
	"github.com/spf13/cobra"
	"github.com/whitekid/goxp/cobrax"

	"reader/db"
)

func init() {
	cobrax.Add(rootCmd, &cobra.Command{
		Use:   "migrate",
		Short: "migrate database schema",
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := db.Migrate(cmd.Context()); err != nil {
				return err
			}
			return nil
		},
	}, nil)
}
