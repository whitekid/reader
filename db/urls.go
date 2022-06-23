package db

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"

	"reader/models"
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

func (u *URLService) noOrignalContent() ([]models.URL, error) {
	var urls []models.URL

	if r := u.db.Where("original_content is null").Find(&urls); r.Error != nil {
		return nil, r.Error
	}

	return urls, nil
}

func (u *URLService) Create(url string, originalContent string, title string,
	content string, textContent string, length int, excerpt string,
	byLine string, siteName string) (*models.URL, error) {
	urlRef := &models.URL{
		URL:             url,
		OriginalContent: originalContent,
		Title:           title,
		Content:         content,
		TextContent:     textContent,
		Length:          length,
		Excerpt:         excerpt,
		ByLine:          byLine,
		SiteName:        siteName,
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

func (u *URLService) List() ([]models.URL, error) {
	var items []models.URL
	if r := u.db.Find(&items); r.Error != nil {
		return nil, r.Error
	}

	return items, nil
}

func (u *URLService) DeleteByID(ID uint) error {
	r := u.db.Delete(&models.URL{}, ID)
	return r.Error
}

func (u *URLService) Random() (*models.URL, error) {
	ref := &models.URL{}
	if r := u.db.Order("random()").First(ref); r.Error != nil {
		return nil, errors.Wrap(r.Error, "fail to get random url")
	}

	return ref, nil
}
