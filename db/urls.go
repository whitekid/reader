package db

import (
	"github.com/pkg/errors"
	"github.com/whitekid/reader/db/models"
	"gorm.io/gorm"
)

type URLService struct {
	db *gorm.DB
}

func (u *URLService) ByID(ID uint) (*models.URL, error) {
	ref := &models.URL{}
	if r := u.db.First(ref, ID); r.Error != nil {
		return nil, errors.Wrap(r.Error, "fail to get url")
	}

	return ref, nil
}

func (u *URLService) ByURL(url string) (*models.URL, error) {
	ref := &models.URL{}
	if r := u.db.First(ref, models.URL{URL: url}); r.Error != nil {
		return nil, errors.Wrap(r.Error, "fail to get url")
	}

	return ref, nil
}

func (u *URLService) Create(url string, title string, content string) (*models.URL, error) {
	urlRef := &models.URL{
		URL:     url,
		Title:   title,
		Content: content,
	}
	if r := u.db.Save(urlRef); r.Error != nil {
		return nil, r.Error
	}

	return urlRef, nil
}

func (u *URLService) Save(url *models.URL) error {
	if r := u.db.Save(url); r.Error != nil {
		return errors.Wrapf(r.Error, "url save failed")
	}
	return nil
}
