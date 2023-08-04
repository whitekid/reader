package reader

import (
	"context"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/flosch/pongo2/v6"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"
	"github.com/whitekid/goxp/log"
	"github.com/whitekid/goxp/request"
	"github.com/whitekid/goxp/service"
	"gorm.io/gorm"

	"reader/config"
	"reader/db"
	"reader/models"
)

func Run(ctx context.Context) error {
	return newReaderService().Serve(ctx)
}

type readerService struct {
	e *echo.Echo
}

var _ service.Interface = service.Interface(nil)

func newReaderService() *readerService {
	r := &readerService{
		e: echo.New(),
	}

	r.e.HideBanner = true
	r.e.Use(middleware.Logger())

	r.e.GET("/read/:url", r.handleNewURL)
	r.e.GET("/r/:slug", r.handleView)
	r.e.GET("/", r.randomView)

	return r
}

func (reader *readerService) Serve(ctx context.Context) error {
	go func() {
		<-ctx.Done()
		reader.e.Shutdown(ctx)
	}()

	return reader.e.Start(config.BindAddr())
}

func (reader *readerService) handleNewURL(c echo.Context) error {
	// /read/<url> 형태로 줄 때 url에 ?가 들어있으면 query parameter로 해석이 되어서 c.Param()으로 가져올 수 없음
	// 따라서 RequestURI에서 /read/를 빼고 URL로 처리한다.
	url := c.Request().RequestURI[6:]

	urlRef, err := AddURL(c.Request().Context(), url)
	if err != nil {
		log.Errorf("failed: %+v, url=%s", err, url)
		return err
	}

	return c.Redirect(http.StatusFound, "/r/"+shortner.Encode(int64(urlRef.ID)))
}

func AddURL(ctx context.Context, url string) (*models.URL, error) {
	url = cleanURL(url)

	urlRef, err := db.URL.ByURL(url)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Error(err)
			return nil, errors.Wrapf(err, "fail to save url: %s", url)
		}

		resp, err := request.Get(url).
			FollowRedirect(true).
			Header(request.HeaderUserAgent, config.UserAgent()).
			Do(ctx)
		if err != nil {
			return nil, err
		}

		if err := resp.Success(); err != nil {
			return nil, errors.Wrap(err, url)
		}

		body := resp.String()
		r, err := ReadableArticle(ctx, strings.NewReader(body), url)
		if err != nil {
			log.Error(err)
			return nil, err
		}

		urlRef, err = db.URL.Create(url, body, r.Title, r.Content, r.TextContent, r.Length, r.Excerpt, r.Byline, r.SiteName)
		if err != nil {
			return nil, err
		}
	}

	return urlRef, nil
}

func UpdateURL(ctx context.Context, idOrShorten string) (*models.URL, error) {
	id, err := strconv.Atoi(idOrShorten)
	if err != nil {
		decoded, err := shortner.Decode(idOrShorten)
		if err != nil {
			return nil, err
		}
		id = int(decoded)
	}

	urlRef, err := db.URL.ByID(uint(id))
	urlRef.URL = cleanURL(urlRef.URL)
	if err != nil {
		return nil, err
	}

	resp, err := request.Get(urlRef.URL).
		FollowRedirect(true).
		Header(request.HeaderUserAgent, config.UserAgent()).
		Do(ctx)
	if err != nil {
		return nil, err
	}

	if err := resp.Success(); err != nil {
		return nil, errors.Wrap(err, urlRef.URL)
	}

	body := resp.String()
	r, err := ReadableArticle(ctx, strings.NewReader(body), urlRef.URL)
	if err != nil {
		log.Error(err)
		return nil, err
	}

	urlRef.OriginalContent = body
	urlRef.Title = r.Title
	urlRef.Content = r.Content
	urlRef.TextContent = r.TextContent
	urlRef.Length = r.Length
	urlRef.Excerpt = r.Excerpt
	urlRef.SiteName = r.SiteName
	urlRef.ByLine = r.Byline
	if err := db.URL.Save(urlRef); err != nil {
		return nil, err
	}

	return urlRef, nil
}

var regDigits = regexp.MustCompile(`^\d+$`)

func (reader *readerService) handleView(c echo.Context) error {
	slug := c.Param("slug")
	var articleId uint

	log.Debugf("slug: %s", slug)
	if regDigits.MatchString(slug) {
		id, _ := strconv.ParseInt(slug, 10, 64)
		return c.Redirect(http.StatusFound, fmt.Sprintf("/r/%s", shortner.Encode(id)))
	} else {
		id, err := shortner.Decode(slug)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		articleId = uint(id)
	}

	ref, err := db.URL.ByID(articleId)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	html, err := executeTemplate("reader.tmpl", pongo2.Context{
		"url":        ref.URL,
		"title":      ref.Title,
		"content":    ref.Content,
		"reader_url": c.Request().URL,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.HTML(http.StatusOK, html)
}

func (reader *readerService) randomView(c echo.Context) error {
	url, err := db.URL.Random()
	if err != nil {
		return err
	}

	slug := shortner.Encode(int64(url.ID))

	return c.Redirect(http.StatusFound, fmt.Sprintf("/r/%s", slug))
}
