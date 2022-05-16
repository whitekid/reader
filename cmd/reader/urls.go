package main

import (
	"context"
	"os"

	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/spf13/cobra"
	"github.com/whitekid/reader"
	"github.com/whitekid/reader/db"
)

func init() {
	cmd := &cobra.Command{
		Use: "urls",
	}

	cmd.AddCommand(&cobra.Command{
		Use:   "list",
		Short: "list urls",
		RunE:  func(cmd *cobra.Command, args []string) error { return listURLS(cmd.Context()) },
	})

	rootCmd.AddCommand(cmd)
}

func listURLS(ctx context.Context) error {
	t := table.NewWriter()
	t.SetOutputMirror(os.Stdout)
	t.AppendHeader(table.Row{"ID", "Short", "URL"})
	urls, err := db.URL.List()
	if err != nil {
		return err
	}

	for _, url := range urls {
		t.AppendRow([]interface{}{url.ID, reader.Shorten(url.ID), url.URL})
	}
	t.Render()
	return nil
}
