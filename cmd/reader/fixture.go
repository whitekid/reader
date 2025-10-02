package main

import (
	"os"
	"strings"

	"reader"

	"github.com/go-testfixtures/testfixtures/v3"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"github.com/whitekid/goxp/cobrax"
	"github.com/whitekid/goxp/log"
	"github.com/whitekid/goxp/requests"
	"gopkg.in/yaml.v3"

	"reader/db"
	"reader/models"
)

func init() {
	cmd := &cobra.Command{
		Use: "fixtures",
	}

	cobrax.Add(cmd, &cobra.Command{
		Use:   "setup",
		Short: "setup fixture database",
		RunE: func(cmd *cobra.Command, args []string) error {
			migrator := db.DB().Migrator()
			if err := migrator.DropTable(&models.URL{}, &models.Metadata{}); err != nil {
				return err
			}

			if err := db.Migrate(cmd.Context()); err != nil {
				return nil
			}

			// setup fixture data
			urlsFS, err := os.Open("fixtures/fixture.yml")
			if err != nil {
				return err
			}
			defer urlsFS.Close()

			fixture := &struct {
				Urls []string
			}{}

			if err := yaml.NewDecoder(urlsFS).Decode(fixture); err != nil {
				return err
			}

			for _, url := range fixture.Urls {
				log.Infof("fetching %s...", url)
				resp, err := requests.Get(url).FollowRedirect(true).Do(cmd.Context())
				if err != nil {
					return nil
				}
				if err := resp.Success(); err != nil {
					return errors.Wrap(err, url)
				}
				body := resp.String()
				resp.Body.Close()

				article, err := reader.ReadableArticle(cmd.Context(), strings.NewReader(body), url)
				if err != nil {
					return err
				}

				if _, err := db.URL.Create(url, body, article.Title, article.Content, article.TextContent,
					article.Length, article.Excerpt, article.Byline, article.SiteName); err != nil {
					return err
				}
			}

			return db.DumpFixture()
		},
	}, nil)

	cobrax.Add(cmd, &cobra.Command{
		Use: "dump database",
		RunE: func(cmd *cobra.Command, args []string) error {
			sqlDB, _ := db.SqlDB()

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
	}, nil)

	cobrax.Add(rootCmd, cmd, nil)
}
