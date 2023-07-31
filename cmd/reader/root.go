package main

import (
	"github.com/spf13/cobra"

	"reader"
	"reader/config"
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
	config.InitFlagSet(rootCmd.Use, rootCmd)
}
