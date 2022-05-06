package db

import (
	"github.com/whitekid/goxp/log"
	"github.com/whitekid/reader/db/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	db *gorm.DB

	URL *URLService
)

func InitDatabases(name string) {
	adb, err := gorm.Open(sqlite.Open(name), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	log.Debug("migrating databases....")
	if err := adb.AutoMigrate(models.Refs...); err != nil {
		log.Fatalf("migrate failed: %v", err)
	}

	db = adb

	URL = &URLService{db: db}
}
