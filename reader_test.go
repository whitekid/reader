package reader

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/whitekid/goxp/request"
	"github.com/whitekid/reader/db"
	"github.com/whitekid/reader/testutils"
)

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func TestMain(m *testing.M) {
	sqlDB, err := db.InitDatabases("test.db")
	must(err)

	testutils.SetupFixtureDatabase(sqlDB)

	os.Exit(m.Run())
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
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := request.Get(ts.URL + "/read/" + tt.name).Do(ctx)
			require.NoError(t, err)
			require.Equal(t, http.StatusFound, resp.StatusCode)
			require.Equal(t, "/r/"+tt.wantSlug, resp.Header.Get(request.HeaderLocation))

			{
				resp, err := request.Get(ts.URL + resp.Header.Get(request.HeaderLocation)).Do(ctx)
				require.NoError(t, err)
				require.True(t, resp.Success())
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

	resp, err := request.Get(ts.URL + "/r/1").Do(ctx)
	require.NoError(t, err)
	require.Equal(t, http.StatusFound, resp.StatusCode)
	require.Equal(t, "/r/"+shortner.Encode(1), resp.Header.Get("Location"))
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
