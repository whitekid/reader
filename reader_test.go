package reader

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/whitekid/goxp/log"
	"github.com/whitekid/goxp/request"
	"github.com/whitekid/reader/db"
	"github.com/whitekid/reader/db/models"
)

func must(err error) {
	if err != nil {
		panic(err)
	}
}

func TestMain(m *testing.M) {
	os.Remove("test.db")
	db.InitDatabases("test.db")
	must(db.URL.Save(&models.URL{
		URL: "https://m.blog.naver.com/businessinsight/222222702267",
	}))

	os.Exit(m.Run())
}

func TestReader(t *testing.T) {
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
		{"https://m.blog.naver.com/businessinsight/222222702267", args{}, "ku"},
		{`https://www.besuccess.com/opinion/%ec%9d%bc%ec%9d%84-%ed%95%98%eb%8a%94%eb%8d%b0-%ec%a4%91%ec%9a%94%ed%95%9c-%eb%84%a4-%ea%b0%80%ec%a7%80/`, args{}, "k9"},
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
				log.Debugf("html: %s", resp.String())
			}
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
	require.Equal(t, "/r/ku", resp.Header.Get("Location"))
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
