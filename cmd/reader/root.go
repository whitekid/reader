package main

import (
	"github.com/spf13/cobra"
	"github.com/whitekid/reader"
	"github.com/whitekid/reader/config"
	"github.com/whitekid/reader/db"
)

var rootCmd = &cobra.Command{
	Use:   "reader",
	Short: "readibility viewer",
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		if _, err := db.InitDatabases(config.Database()); err != nil {
			return err
		}

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		return reader.Run(cmd.Context())
	},
}

func init() {
	config.InitFlagSet(rootCmd.Use, rootCmd)
}
