package models

import "gorm.io/gorm"

func init() {
	Refs = append(Refs, &URL{})
}

type URL struct {
	gorm.Model

	URL     string `gorm:"index:,unique,where deleted_at is not null"`
	Title   string
	Content string
}
