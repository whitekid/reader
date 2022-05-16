package db

import (
	"github.com/whitekid/goxp/log"
	"github.com/whitekid/reader/db/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	db *gorm.DB

	URL      *URLService
	Metadata *MetadataService
)

func InitDatabases(name string) {
	_db, err := gorm.Open(sqlite.Open(name), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	log.Debug("migrating databases....")
	if err := _db.AutoMigrate(models.Refs...); err != nil {
		log.Fatalf("migrate failed: %v", err)
	}

	db = _db

	URL = &URLService{db: db}
	Metadata = &MetadataService{db: db}
}
