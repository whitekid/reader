package db

import (
	"context"

	"reader/models"

	"github.com/pkg/errors"
	"github.com/whitekid/goxp/log"
	"github.com/whitekid/goxp/request"
)

func Migrate(ctx context.Context) error {
	log.Debug("migrating databases....")
	if err := db.AutoMigrate(models.Refs...); err != nil {
		return err
	}

	migFuncs := map[uint]func(ctx context.Context) error{
		1: migrate_v1,
	}

	schemaVersion := Metadata.SchemaVersion()
	for v := schemaVersion + 1; ; v++ {
		fn, ok := migFuncs[v]
		if !ok {
			log.Debugf("migration not found: %d", v)
			break
		}

		log.Infof("migrate to %d...", v)
		if err := fn(ctx); err != nil {
			return err
		}
		Metadata.SetSchemaVersion(v)
	}

	return nil
}

// original content 채워넣기
func migrate_v1(ctx context.Context) error {
	urls, err := URL.noOrignalContent()
	if err != nil {
		return err
	}

	for _, url := range urls {
		log.Infof("getting... %d %s", url.ID, url.URL)
		resp, err := request.Get(url.URL).FollowRedirect(true).Do(ctx)
		if err != nil {
			return err
		}
		if err := resp.Success(); err != nil {
			return errors.Wrap(err, url.URL)
		}

		url.OriginalContent = resp.String()
		if err := URL.Save(&url); err != nil {
			return err
		}
	}

	return nil
}
