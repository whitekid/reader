package main

import (
	"github.com/spf13/cobra"
	"github.com/whitekid/goxp/flags"

	"reader"
	"reader/db"
)

var rootCmd = &cobra.Command{
	Use:   "reader",
	Short: "readibility viewer",
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		if _, err := db.Open(); err != nil {
			return err
		}

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		return reader.Run(cmd.Context())
	},
}

func init() {
	initFlags(rootCmd)
}

func initFlags(cmd *cobra.Command) {
	// Regular flags
	flags.String(cmd.Flags(), "bind_addr", "bind_addr", "B", "127.0.0.1:8000", "bind address")
	flags.String(cmd.Flags(), "slug_encoding", "slug_encoding", "s", "", "slug encoding")

	// Persistent flags
	flags.String(cmd.PersistentFlags(), "user-agent", "user-agent", "", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0", "")
	flags.String(cmd.PersistentFlags(), "db_host", "db_host", "H", "localhost", "database host")
}
