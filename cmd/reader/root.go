package main

import (
	"github.com/spf13/cobra"
	"github.com/whitekid/goxp/cobrax"

	"reader"
	"reader/db"
)

var rootCmd = cobrax.Add(nil, &cobra.Command{
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
}, func(cmd *cobra.Command) {
	cmd.Flags().StringP("bind_addr", "B", "127.0.0.1:8000", "bind address")
	cmd.Flags().StringP("slug_encoding", "s", "", "slug encoding")
	cmd.PersistentFlags().String("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0", "")
	cmd.PersistentFlags().StringP("db_host", "H", "localhost", "database host")
})
