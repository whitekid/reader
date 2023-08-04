package reader

import (
	"context"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestReadability(t *testing.T) {
	type args struct {
		fixture string
	}
	tests := [...]struct {
		name       string
		args       args
		wantErr    bool
		wantTitle  string
		wantByline string
		wantText   string
	}{
		// curl 'https://www.technologyreview.kr/sam-altman-this-is-what-i-learned-from-dall-e-2/' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/112.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' -H 'Accept-Language: ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'DNT: 1' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: none' -H 'Sec-Fetch-User: ?1' -H 'Sec-GPC: 1' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'TE: trailers' | gzip -d
		// TODO 403 ...
		{"https://www.technologyreview.kr/sam-altman-this-is-what-i-learned-from-dall-e-2/", args{fixture: "technologyreview.html"},
			false,
			"오픈AI CEO '샘 올트먼' 인터뷰: 내가 DALL-E 2에서 배운 것 - MIT Technology Review",
			"Will Douglas Heaven",
			"오픈AI(OpenAI)의 CEO 샘 올트먼"},
		{"https://m.blog.naver.com/bizucafe/223079236552", args{fixture: "bizucafe.html"},
			false,
			"스타트업을 하며 겪는 19가지 공통점 (한글 번역) | What Startups Are Really Like | Paul Graham Essay",
			"BZCF\n\t\n\t3시간 전",
			"저는 글을 쓸 때마다, 어떤 글이 사람들에게"},
		{"https://m.blog.naver.com/businessinsight/222222702267", args{fixture: "businessinsight.html"},
			false,
			"애플의 리더는 이래서 특별해졌다..변혁기에 눈여겨봐야 할 리더의 자질 ㅣ인터비즈",
			"인터비즈\n\t\t공식블로그\n\t\n\t2021. 1. 28. 9:47",
			"\"애플에서 퇴사 당한 것은 내 인생에서 최고의 경험이었어요."},
		{"https://www.ciokorea.com/news/234834", args{fixture: "ciokorea.html"},
			false,
			"대퇴직 IT 인력 공백 ‘해결사’, 로우코드가 뜬다",
			"", // Lucas Mearian
			"대퇴직으로 인해 숙련된 개발자가 부족해지면서 많은"},
		{"https://infutureconsulting.tistory.com/m/1177", args{fixture: "infuture.html"}, false,
			"'해야 한다'란 말은 변화를 못 일으킨다", "유정식", "밀러는 초등학교 2학년"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			r, err := os.Open("fixtures/" + tt.args.fixture)
			require.NoError(t, err)
			defer r.Close()

			got, err := ReadableArticle(context.Background(), r, tt.name)
			if (err != nil) != tt.wantErr {
				require.Failf(t, `readableArticle() failed`, `error = %v, wantErr = %v`, err, tt.wantErr)
			}
			require.Equal(t, tt.wantTitle, got.Title, "title not equal")
			require.Equal(t, tt.wantByline, got.Byline, "byline not equal")
			require.Contains(t, got.TextContent, tt.wantText, "text not equals")
		})
	}
}

func TestReadabilityEx(t *testing.T) {
	type args struct {
		fixture string
	}
	tests := [...]struct {
		name       string
		args       args
		wantErr    bool
		wantTitle  string
		wantByline string
		wantText   string
	}{
		// curl 'https://www.technologyreview.kr/sam-altman-this-is-what-i-learned-from-dall-e-2/' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/112.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' -H 'Accept-Language: ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'DNT: 1' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: none' -H 'Sec-Fetch-User: ?1' -H 'Sec-GPC: 1' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'TE: trailers' | gzip -d
		// TODO 403 ...
		{"https://www.technologyreview.kr/sam-altman-this-is-what-i-learned-from-dall-e-2/", args{fixture: "technologyreview.html"},
			false,
			"오픈AI CEO '샘 올트먼' 인터뷰: 내가 DALL-E 2에서 배운 것 - MIT Technology Review",
			"Will Douglas Heaven",
			"오픈AI(OpenAI)의 CEO 샘 올트먼"},
		{"https://m.blog.naver.com/bizucafe/223079236552", args{fixture: "bizucafe.html"},
			false,
			"스타트업을 하며 겪는 19가지 공통점 (한글 번역) | What Startups Are Really Like | Paul Graham Essay",
			"BZCF\n\t\n\t3시간 전",
			"저는 글을 쓸 때마다, 어떤 글이 사람들에게"},
		{"https://m.blog.naver.com/businessinsight/222222702267", args{fixture: "businessinsight.html"},
			false,
			"애플의 리더는 이래서 특별해졌다..변혁기에 눈여겨봐야 할 리더의 자질 ㅣ인터비즈",
			"인터비즈\n\t\t공식블로그\n\t\n\t2021. 1. 28. 9:47",
			"\"애플에서 퇴사 당한 것은 내 인생에서 최고의 경험이었어요."},
		{"https://www.ciokorea.com/news/234834", args{fixture: "ciokorea.html"},
			false,
			"대퇴직 IT 인력 공백 ‘해결사’, 로우코드가 뜬다",
			"", // Lucas Mearian
			"대퇴직으로 인해 숙련된 개발자가 부족해지면서 많은"},
		{"https://infutureconsulting.tistory.com/m/1177", args{fixture: "infuture.html"}, false,
			"'해야 한다'란 말은 변화를 못 일으킨다", "유정식", "밀러는 초등학교 2학년"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			r, err := os.Open("fixtures/" + tt.args.fixture)
			require.NoError(t, err)
			defer r.Close()

			got, err := ReadableArticleEx(context.Background(), r, tt.name)
			if (err != nil) != tt.wantErr {
				require.Failf(t, `readableArticle() failed`, `error = %v, wantErr = %v`, err, tt.wantErr)
			}
			require.Equal(t, tt.wantTitle, got.Title, "title not equal")
			require.Equal(t, tt.wantByline, got.Byline, "byline not equal")
			require.Contains(t, got.TextContent, tt.wantText, "text not equals")
		})
	}
}
