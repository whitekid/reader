package main

import (
	"github.com/spf13/cobra"
	"github.com/whitekid/reader"
	"github.com/whitekid/reader/config"
)

var rootCmd = &cobra.Command{
	Use:   "reader",
	Short: "readibility viewer",
	RunE:  func(cmd *cobra.Command, args []string) error { return reader.Run(cmd.Context()) },
}

func init() {
	config.InitFlagSet(rootCmd.Use, rootCmd.Flags())
}
