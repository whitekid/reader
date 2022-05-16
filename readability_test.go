package reader

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestReadability(t *testing.T) {
	data := `   <br/>밀러는 첫 번째 학급의 학생들에게는 "학교에서 너희 교실이 가장 깨끗하구나", "너희들처럼 교실을 깨끗하게 사용하는 아이들이 있다니 자랑스럽구나", "워낙 깨끗해서 청소하기가 쉽구나" 라는 메시지를 8일 동안 지속적으로 전달했습니다. 자긍심이 느껴지도록 '너희는 그렇게 좋은 아이들이야'라고 인정한 것입니다. 반면 두 번째 학급의 학생들에게는 "청소하는 아이들을 도와야 한다", "모두 정리정돈을 잘해야 한다", "바닥에 사탕 껍질을 버리지 말고 꼭 쓰레기통에 버려야 한다"는 식으로 '의무'를 강조하는 메시지를 주입시켰습니다. 대조군으로 선정된 세 번째 학급에는&nbsp;아무런 메시지를 전달하지 않았습니다.</p><p><br />10일째 되는 날, 제과회사에서 나왔다고 가장한 홍보 사원이 학생들에게 껍질에 쌓인 사탕을 나눠준 후에 학생들의 행동을 살폈습니다. 쓰레기통에 버려진 사탕 껍질의 수도 세어 보았죠. 그랬더니 '자긍심 조건'의 학생들이 '의무 조건'의 학생들보다 교실 바닥이나 책상 아래에 사탕 껍질을 덜 버리는 것은 물론이었고 실험 진행자가 바닥에 몰래 버린 사탕 껍질도 더 많이 줍는 모습을 보였습니다. 의무를 강조하기보다는 자긍심을 자극하는 방법이 긍정적인 변화를 유도하는 데 효과적이었던 겁니다.  <br /><br />2주일이 흐른 후에 포장지에 쌓인 퍼즐을 학생들에게 나눠주고서 마음껏 즐기라고 한 후에 역시 쓰레기통에 잘 버려진 포장지 수를 세었습니다. 2주일이나 지났으니 메시지 주입 효과가 미약해졌으리라 예상했지만, '자긍심 조건'의 학생들은 여전히 쓰레기를 올바르게 처리하는 모습을 보였습니다. 반면 '의무 조건'의 학생들은 바닥에 마구 쓰레기를 버리던, 실험을 시작하기 xxx`
	fmt.Printf("%d\n", len(data))

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
		{
			"https://m.blog.naver.com/businessinsight/222222702267", args{fixture: "naverblog.html"},
			false,
			"애플의 리더는 이래서 특별해졌다..변혁기에 눈여겨봐야 할 리더의 자질 ㅣ인터비즈",
			"인터비즈\n\t\t공식블로그\n\t\n\t2021. 1. 28. 9:47",
			"\"애플에서 퇴사 당한 것은 내 인생에서 최고의 경험이었어요."},
		{
			"https://www.ciokorea.com/news/234834", args{fixture: "ciokorea.html"},
			false,
			"대퇴직 IT 인력 공백 ‘해결사’, 로우코드가 뜬다",
			"", // Lucas Mearian
			"대퇴직으로 인해 숙련된 개발자가 부족해지면서 많은"},
		{
			"https://infutureconsulting.tistory.com/m/1177", args{fixture: "infuture.html"}, false,
			"'해야 한다'란 말은 변화를 못 일으킨다", "유정식", "밀러는 초등학교 2학년"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r, err := os.Open("fixtures/" + tt.args.fixture)
			require.NoError(t, err)
			defer r.Close()

			got, err := readableArticle(context.Background(), r, tt.name)
			if (err != nil) != tt.wantErr {
				require.Failf(t, `readableArticle() failed`, `error = %v, wantErr = %v`, err, tt.wantErr)
			}
			require.Equal(t, tt.wantTitle, got.Title, "title not equal")
			require.Equal(t, tt.wantByline, got.Byline, "byline not equal")
			require.Contains(t, got.TextContent, tt.wantText, "text not equals")
		})
	}
}
