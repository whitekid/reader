package db

import (
	"context"
	"database/sql"

	"github.com/whitekid/goxp/log"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"reader/models"
)

var (
	db *gorm.DB

	URL      *URLService
	Metadata *MetadataService
)

func Open(name string) (*sql.DB, error) {
	log.Debugf("opening %s", name)
	_db, err := gorm.Open(sqlite.Open(name), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	log.Debug("migrating databases....")
	if err := _db.AutoMigrate(models.Refs...); err != nil {
		return nil, err
	}

	db = _db

	URL = &URLService{db: db}
	Metadata = &MetadataService{db: db}

	if err := migrate(context.Background()); err != nil {
		return nil, err
	}

	return db.DB()
}

// DB get sql.DB
func DB() (*sql.DB, error) { return db.DB() }

// Exec execute direct SQL
func Exec(sql string, values ...interface{}) *gorm.DB { return db.Exec(sql, values...) }
