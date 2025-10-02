# Reader Test Guide

## Manual Testing Checklist

### 1. URL 추가 기능 테스트

#### 네이버 블로그
```bash
# Method 1: Query string
curl -X POST "https://reader.whitekid.workers.dev/post?url=https://blog.naver.com/bizucafe/223886283493"

# Method 2: Referer header
curl -X POST https://reader.whitekid.workers.dev/post \
  -H "Referer: https://blog.naver.com/bizucafe/223886283493"
```

**기대 결과**:
- ✅ 제목이 og:title 메타태그에서 추출됨
- ✅ 콘텐츠가 #postViewArea에서 추출됨
- ✅ site_name이 "blog.naver.com"으로 설정됨
- ✅ 읽기 시간 계산됨

#### 일반 블로그/뉴스
```bash
curl -X POST "https://reader.whitekid.workers.dev/post?url=https://example.com/article"
```

**기대 결과**:
- ✅ Readability로 콘텐츠 추출
- ✅ 제목, 저자, 발행일 파싱
- ✅ 단어 수와 읽기 시간 계산

### 2. URL 정규화 테스트

#### 트래킹 파라미터 제거
```bash
# UTM 파라미터 포함 URL
curl -X POST "https://reader.whitekid.workers.dev/post?url=https://example.com/article?utm_source=twitter&utm_campaign=test"

# 네이버 블로그 트래킹 코드
curl -X POST "https://reader.whitekid.workers.dev/post?url=https://blog.naver.com/test/123?fromRss=true&trackingCode=rss"
```

**기대 결과**:
- ✅ utm_*, trackingCode, fromRss 파라미터가 제거됨
- ✅ 정규화된 URL로 저장됨
- ✅ 동일 URL 중복 체크 정상 작동

**검증 방법**:
1. 트래킹 파라미터 포함 URL로 추가
2. 동일 URL을 파라미터 없이 다시 추가 시도
3. 기존 article로 리다이렉트되는지 확인

### 3. Reader 뷰 기능 테스트

#### 글 읽기
```
https://reader.whitekid.workers.dev/r/1
```

**기대 결과**:
- ✅ Safari Reader 스타일 UI 표시
- ✅ 다크 모드 자동 전환
- ✅ "← Back" 버튼으로 홈 이동
- ✅ "🔗 Open Original" 버튼으로 원본 링크 열기
- ✅ "✓ Mark as Read" 버튼 표시

#### 읽음 처리
```bash
curl -X POST https://reader.whitekid.workers.dev/r/1/mark-read
```

**기대 결과**:
- ✅ is_read = 1로 업데이트
- ✅ read_at 타임스탬프 기록
- ✅ 홈으로 리다이렉트
- ✅ 홈 목록에서 해당 글 제거

### 4. 홈 화면 테스트

```
https://reader.whitekid.workers.dev/
```

**기대 결과**:
- ✅ 읽지 않은 글 목록 표시
- ✅ URL 추가 폼 표시
- ✅ 각 글마다 제목, 발췌, 메타 정보 표시
- ✅ 클릭 시 Reader 뷰로 이동

### 5. 에러 처리 테스트

#### 잘못된 URL
```bash
curl -X POST "https://reader.whitekid.workers.dev/post?url=invalid-url"
curl -X POST "https://reader.whitekid.workers.dev/post?url=/relative/path"
```

**기대 결과**:
- ✅ "Invalid URL format" 에러 메시지
- ✅ "URL must start with http:// or https://" 에러 메시지

#### 404 페이지
```bash
curl -X POST "https://reader.whitekid.workers.dev/post?url=https://example.com/nonexistent"
```

**기대 결과**:
- ✅ "HTTP 404: Not Found" 에러 메시지

#### 파싱 실패
```bash
curl -X POST "https://reader.whitekid.workers.dev/post?url=https://google.com"
```

**기대 결과**:
- ✅ "Failed to parse article content" 에러 메시지 (콘텐츠 없는 페이지)

### 6. 제거된 트래킹 파라미터 목록

다음 파라미터들이 자동으로 제거되어야 함:

**UTM 파라미터**:
- utm_source, utm_medium, utm_campaign, utm_term, utm_content

**소셜 미디어 트래킹**:
- fbclid (Facebook)
- gclid, gclsrc, dclid (Google)
- twclid, twsrc (Twitter/X)
- li_source, li_medium (LinkedIn)
- msclkid (Microsoft)
- ttclid (TikTok)

**기타 트래킹**:
- ref, ref_src, ref_url, referrer
- trackingCode, trackingId, tracking_id
- source, campaign, medium
- fromRss, from

## 자동화 테스트 (향후 구현)

현재 `src/services/extractor.test.ts`에 테스트 구조가 정의되어 있습니다.

완전한 자동화 테스트를 위해서는:
1. Vitest 또는 Jest 설치
2. Cloudflare Workers 테스트 환경 설정
3. Mock fetch 구현
4. CI/CD 파이프라인 통합

## 성능 테스트

### 응답 시간 측정
```bash
time curl -X POST "https://reader.whitekid.workers.dev/post?url=https://example.com/article"
```

**목표**:
- 콘텐츠 추출: < 3초
- Reader 뷰 렌더링: < 500ms
- 홈 목록 로딩: < 300ms

### 동시성 테스트
```bash
# 여러 요청 동시 실행
for i in {1..10}; do
  curl -X POST "https://reader.whitekid.workers.dev/post?url=https://example.com/article$i" &
done
wait
```

## 브라우저 테스트

### 다크 모드
1. 시스템 설정에서 다크 모드 활성화
2. Reader 뷰 열기
3. 자동으로 다크 테마 적용 확인

### 반응형 디자인
1. 모바일 뷰 (< 768px)
2. 태블릿 뷰 (768px - 1024px)
3. 데스크톱 뷰 (> 1024px)
4. 각 해상도에서 레이아웃 확인

### 접근성
1. 키보드 네비게이션 (Tab, Enter)
2. 스크린 리더 호환성
3. 색상 대비 (WCAG AA 기준)
