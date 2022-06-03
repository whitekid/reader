package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"

	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/spf13/cobra"
	"github.com/whitekid/goxp/log"
	"github.com/whitekid/reader"
	"github.com/whitekid/reader/db"
)

func init() {
	cmd := &cobra.Command{
		Use: "urls",
	}

	cmd.AddCommand(&cobra.Command{
		Use:   "new url",
		Short: "add new url",
		RunE: func(cmd *cobra.Command, args []string) error {
			for _, url := range args {
				log.Debugf("%s", url)
				if _, err := reader.AddURL(cmd.Context(), url); err != nil {
					return err
				}
			}

			return nil
		},
	})

	cmd.AddCommand(&cobra.Command{
		Use:   "update id",
		Short: "update url",
		RunE: func(cmd *cobra.Command, args []string) error {
			for _, id := range args {
				if _, err := reader.UpdateURL(cmd.Context(), id); err != nil {
					return err
				}
			}

			return nil
		},
	})

	cmd.AddCommand(&cobra.Command{
		Use:   "list",
		Short: "list urls",
		RunE: func(cmd *cobra.Command, args []string) error {
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
		},
	})

	cmd.AddCommand(&cobra.Command{
		Use:   "info id",
		Short: "show url info",
		RunE: func(cmd *cobra.Command, args []string) error {
			id, err := strconv.ParseUint(args[0], 10, 64)
			if err != nil {
				return err
			}

			url, err := db.URL.ByID(uint(id))
			if err != nil {
				return err
			}

			v, _ := json.MarshalIndent(url, "", "  ")
			fmt.Fprintf(os.Stdout, "%s", v)

			return nil
		},
	})

	cmd.AddCommand(&cobra.Command{
		Use:   "delete id...",
		Short: "delete urls",
		RunE: func(cmd *cobra.Command, args []string) error {
			for _, arg := range args {
				id, err := strconv.ParseUint(arg, 10, 64)
				if err != nil {
					return err
				}

				if err := db.URL.DeleteByID(uint(id)); err != nil {
					return err
				}
			}
			return nil
		},
	})

	rootCmd.AddCommand(cmd)
}
