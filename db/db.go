package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/whitekid/gormx"
	"github.com/whitekid/goxp/log"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"reader/config"
)

var (
	db *gorm.DB

	URL      *URLService
	Metadata *MetadataService
)

type gormLogger struct{}

func (l *gormLogger) Printf(s string, args ...any) { log.Debugf(s, args...) }

func Open() (*sql.DB, error) {
	if db != nil {
		return db.DB()
	}

	dbURL := fmt.Sprintf("pgsql://%s:%s@%s/%s", config.DBUser(), config.DBPasswd(), config.DBHost(), config.DBName())
	encURL := fmt.Sprintf("pgsql://%s:%s@%s/%s", config.DBUser(), "@@@@", config.DBHost(), config.DBName())
	log.Debugf("opening %v...", encURL)
	log.Debugf("@@@@ host=%s", config.DBHost())

	var sqlLogger logger.Interface
	if false {
		sqlLogger = logger.New(&gormLogger{},
			logger.Config{
				SlowThreshold:             200 * time.Millisecond,
				LogLevel:                  logger.Info,
				IgnoreRecordNotFoundError: true,
			})
	}

	_db, err := gormx.Open(dbURL, &gorm.Config{
		PrepareStmt: true,
		Logger:      sqlLogger,
	})
	if err != nil {
		return nil, err
	}

	db = _db

	URL = &URLService{db: db}
	Metadata = &MetadataService{db: db}

	if err := Migrate(context.Background()); err != nil {
		return nil, err
	}

	return db.DB()
}

// DB get sql.DB
func DB() *gorm.DB            { return db }
func SqlDB() (*sql.DB, error) { return db.DB() }

// Exec execute direct SQL
func Exec(sql string, values ...interface{}) *gorm.DB { return db.Exec(sql, values...) }
