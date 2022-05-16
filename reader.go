package reader

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os/exec"
	"regexp"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"
	"github.com/whitekid/goxp/log"
	"github.com/whitekid/goxp/request"
	"github.com/whitekid/goxp/service"
	"github.com/whitekid/reader/config"
	"github.com/whitekid/reader/db"
	"gorm.io/gorm"
)

func init() {
	db.InitDatabases("reader.db")
	if err := migrate(context.Background()); err != nil {
		log.Fatal(err)
	}
}

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

	return r
}

func (reader *readerService) Serve(ctx context.Context) error {
	go func() {
		<-ctx.Done()
		reader.e.Shutdown(ctx)
	}()

	return reader.e.Start(config.BindAddr())
}

type Article struct {
	Title       string
	Byline      string
	Content     string
	TextContent string
	Length      int
	Excerpt     string
	SiteName    string
	Image       string
	Favicon     string
}

func readableArticle(ctx context.Context, r io.Reader, url string) (*Article, error) {
	cmd := exec.CommandContext(ctx, "node", "readability.js", url)
	stdin, _ := cmd.StdinPipe()
	stdout, _ := cmd.StdoutPipe()

	go func() {
		defer stdin.Close()
		io.Copy(stdin, r)
	}()

	if err := cmd.Start(); err != nil {
		return nil, err
	}

	var article Article
	if err := json.NewDecoder(stdout).Decode(&article); err != nil {
		return nil, err
	}

	if err := cmd.Wait(); err != nil {
		return nil, err
	}

	return &article, nil
}

func (reader *readerService) handleNewURL(c echo.Context) error {
	url := c.Param("url")
	url = cleanURL(url)

	urlRef, err := db.URL.ByURL(url)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			resp, err := request.Get(url).FollowRedirect(true).Do(c.Request().Context())
			if err != nil {
				log.Error(err)
				return echo.NewHTTPError(http.StatusBadRequest, err.Error())
			}
			if !resp.Success() {
				log.Errorf("failed with %d, url=%s", resp.StatusCode, url)
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("failed with %d", resp.StatusCode))
			}

			body := resp.String()
			r, err := readableArticle(c.Request().Context(), strings.NewReader(body), url)
			if err != nil {
				log.Error(err)
				return echo.NewHTTPError(http.StatusInternalServerError, "parse failed")
			}

			urlRef, err = db.URL.Create(url, body, r.Title, r.Content, r.TextContent, r.Length, r.Excerpt, r.SiteName)
			if err != nil {
				log.Error(err)
				return echo.NewHTTPError(http.StatusInternalServerError, "db IO failed")
			}
		} else {
			log.Error(err)
			return errors.Wrapf(err, "fail to save url: %s", url)
		}
	}

	enc := shortner.Encode(int64(urlRef.ID))
	return c.Redirect(http.StatusFound, "/r/"+enc)
}

func (reader *readerService) handleView(c echo.Context) error {
	slug := c.Param("slug")
	var articleId uint

	log.Debugf("slug: %s", slug)
	if matched, err := regexp.MatchString(`^\d+$`, slug); err == nil && matched {
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

	html, err := executeTemplate("reader.tmpl", map[string]interface{}{
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
