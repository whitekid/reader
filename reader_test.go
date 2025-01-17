package reader

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/require"
	"github.com/whitekid/goxp/requests"

	"reader/db"
)

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func TestMain(m *testing.M) {
	db_, err := db.Open()
	must(err)

	db.SetupFixtureDatabase(db_)

	os.Exit(m.Run())
}

func newTestServer(ctx context.Context) *httptest.Server {
	reader := newReaderService()
	ts := httptest.NewServer(reader.e)

	go func() {
		<-ctx.Done()
		defer ts.Close()
	}()

	return ts
}

func TestFixtureLoad(t *testing.T) {
	urls, err := db.URL.List()
	require.NoError(t, err)
	require.NotEqual(t, 0, len(urls))
}

func TestNewURL(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ts := newTestServer(ctx)

	type args struct {
	}
	tests := [...]struct {
		name string
		args args
	}{
		{"https://m.blog.naver.com/businessinsight/222719467943", args{}},
		{"https://zdnet.co.kr/view/?no=20090914155953", args{}},
		{"https://www.technologyreview.kr/chatgpt-is-everywhere-heres-where-it-came-from/", args{}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := requests.Get(ts.URL + "/read/" + tt.name).FollowRedirect(false).Do(ctx)
			require.NoError(t, err)
			require.Equal(t, http.StatusFound, resp.StatusCode)
			loc := resp.Header.Get(requests.HeaderLocation)
			require.NotEmpty(t, loc)

			{
				resp, err := requests.Get(ts.URL + loc).Do(ctx)
				require.NoError(t, err)
				require.NoError(t, resp.Success())
			}

			slug := loc[3:] // /r/xxx
			{
				id, err := shortner.Decode(slug)
				require.NoError(t, err)
				got, err := db.URL.ByID(uint(id))
				require.NoError(t, err)
				require.Equal(t, tt.name, got.URL)
			}
		})
	}
}

func TestNewURLError(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ts := newTestServer(ctx)

	type args struct {
		url string
	}
	tests := [...]struct {
		name string
		args args
	}{
		{"host not found", args{url: "https://www.ciokoreaxxxx.com/news/x/236504"}},
		{"not found", args{url: "https://www.ciokorea.com/news/x/236504"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := requests.Get(ts.URL + "/read/" + tt.args.url).Do(ctx)
			require.NoError(t, err)
			require.Equal(t, http.StatusInternalServerError, resp.StatusCode)
		})
	}
}

func TestViewByID(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ts := newTestServer(ctx)

	resp, err := requests.Get(ts.URL + "/r/1").FollowRedirect(false).Do(ctx)
	require.NoError(t, err)
	require.Equal(t, http.StatusFound, resp.StatusCode)
	require.Equal(t, "/r/"+shortner.Encode(1), resp.Header.Get("Location"))
}

func TestRandomView(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ts := newTestServer(ctx)

	resp, err := requests.Get(ts.URL + "/").FollowRedirect(false).Do(ctx)
	require.NoError(t, err)
	require.Equal(t, http.StatusFound, resp.StatusCode)
	require.NotEqual(t, "", resp.Header.Get(echo.HeaderLocation))
}
