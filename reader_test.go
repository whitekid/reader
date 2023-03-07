package reader

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/require"
	"github.com/whitekid/goxp/request"

	"reader/db"
	"reader/testutils"
)

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func TestMain(m *testing.M) {
	db, err := db.Open("test.db")
	must(err)

	testutils.SetupFixtureDatabase(db)

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
		name     string
		args     args
		wantSlug string
	}{
		{"https://m.blog.naver.com/businessinsight/222719467943", args{}, shortner.Encode(4)},
		{"https://zdnet.co.kr/view/?no=20090914155953", args{}, shortner.Encode(5)},
		{"https://www.technologyreview.kr/chatgpt-is-everywhere-heres-where-it-came-from/", args{}, shortner.Encode(6)},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := request.Get(ts.URL + "/read/" + tt.name).FollowRedirect(false).Do(ctx)
			require.NoError(t, err)
			require.Equal(t, http.StatusFound, resp.StatusCode)
			require.Equal(t, "/r/"+tt.wantSlug, resp.Header.Get(request.HeaderLocation))

			{
				resp, err := request.Get(ts.URL + resp.Header.Get(request.HeaderLocation)).Do(ctx)
				require.NoError(t, err)
				require.True(t, resp.Success())
			}
			{
				id, err := shortner.Decode(tt.wantSlug)
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
			resp, err := request.Get(ts.URL + "/read/" + tt.args.url).Do(ctx)
			require.NoError(t, err)
			require.Equal(t, http.StatusInternalServerError, resp.StatusCode)
		})
	}
}

func TestViewByID(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ts := newTestServer(ctx)

	resp, err := request.Get(ts.URL + "/r/1").FollowRedirect(false).Do(ctx)
	require.NoError(t, err)
	require.Equal(t, http.StatusFound, resp.StatusCode)
	require.Equal(t, "/r/"+shortner.Encode(1), resp.Header.Get("Location"))
}

func TestRandomView(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ts := newTestServer(ctx)

	resp, err := request.Get(ts.URL + "/").FollowRedirect(false).Do(ctx)
	require.NoError(t, err)
	require.Equal(t, http.StatusFound, resp.StatusCode)
	require.NotEqual(t, "", resp.Header.Get(echo.HeaderLocation))
}
