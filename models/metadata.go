package models

import "gorm.io/gorm"

func init() {
	Refs = append(Refs, &Metadata{})
}

// Metadata store somethings...
type Metadata struct {
	gorm.Model

	Key   string `gorm:"type:text;index,unique,where:deleted_at is not null"`
	Value string `gorm:"type:text"`
}
