package db

import (
	"errors"
	"fmt"
	"log"
	"strconv"

	"gorm.io/gorm"

	"reader/models"
)

type MetadataService struct {
	db *gorm.DB
}

const (
	keySchemaVersion = "schema_version"
)

func (m *MetadataService) SchemaVersion() uint {
	var meta models.Metadata
	if r := m.db.First(&meta, models.Metadata{Key: keySchemaVersion}); r.Error != nil {
		if errors.Is(r.Error, gorm.ErrRecordNotFound) {
			return 0
		}
		log.Fatal(r.Error)
	}

	v, err := strconv.ParseUint(meta.Value, 10, 64)
	if err != nil {
		log.Fatal(err)
	}

	return uint(v)
}

func (m *MetadataService) SetSchemaVersion(ver uint) error {
	var meta models.Metadata

	if r := m.db.First(&meta, models.Metadata{Key: keySchemaVersion}); r.Error != nil {
		if !errors.Is(r.Error, gorm.ErrRecordNotFound) {
			return r.Error
		}
		meta.Key = keySchemaVersion
		meta.Value = fmt.Sprintf("%d", ver)
		return m.db.Create(&meta).Error
	}

	if r := db.Model(&meta).Updates(models.Metadata{Value: fmt.Sprintf("%d", ver)}); r.Error != nil {
		return r.Error
	}

	return nil
}
