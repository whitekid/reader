package reader

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestCleanURL(t *testing.T) {
	type args struct {
		url string
	}
	tests := [...]struct {
		name    string
		args    args
		wantURL string
	}{
		{"remove", args{"http://x.woosum.net/?utm_source=helloHelo09x&v=b"}, "http://x.woosum.net/?v=b"},
		{"redirect", args{"https://blog.naver.com/businessinsight/222265339878"}, "https://m.blog.naver.com/businessinsight/222265339878"},
		{"redirect", args{"https://m.blog.naver.com/PostView.naver?blogId=businessinsight&logNo=222222702267&redirect=Dlog&widgetTypeCall=true&directAccess=false"}, "https://m.blog.naver.com/businessinsight/222222702267"},
		{"redirect", args{"https://m.blog.naver.com/PostView.nhn?blogId=businessinsight&logNo=221171804944&proxyReferer=http%3A%2F%2Fblog.naver.com%2Fbusinessinsight%2F221171804944"}, "https://m.blog.naver.com/businessinsight/221171804944"},
		{"redirect", args{"https://infutureconsulting.tistory.com/1177"}, "https://infutureconsulting.tistory.com/m/1177"},
		{"redirect", args{"https://infutureconsulting.tistory.com/m/1177"}, "https://infutureconsulting.tistory.com/m/1177"},
		{"redirect", args{"https://infuture.kr/1177"}, "https://infutureconsulting.tistory.com/m/1177"},
		{"redirect", args{"https://zdnet.co.kr/view/?no=20090914155953"}, "https://zdnet.co.kr/view/?no=20090914155953"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := cleanURL(tt.args.url)
			require.Equal(t, tt.wantURL, got)
		})
	}
}
