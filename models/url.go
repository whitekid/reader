package models

import (
	"gorm.io/gorm"
)

func init() {
	Refs = append(Refs, &URL{})
}

type URL struct {
	gorm.Model

	URL             string `gorm:"type:varchar(1000);index:,unique,where:deleted_at is not null" json:"url"`
	OriginalContent string
	Title           string `gorm:"type:varchar(1000)"`
	Content         string
	TextContent     string
	Length          int
	Excerpt         string
	SiteName        string `gorm:"type:varchar(100);"`
	ByLine          string `gorm:"type:varchar(100);"`
}
