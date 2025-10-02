# Reader - GetPocket Alternative

Cloudflare Workers 기반 읽기 목록 관리 시스템. URL을 저장하고 Safari Reader 스타일로 깔끔하게 읽을 수 있습니다.

## 기능

- **URL 저장**: 웹 페이지 URL을 저장하고 자동으로 본문 추출
- **읽기 모드**: Safari Reader 스타일의 깔끔한 읽기 화면
- **읽음/안읽음 관리**: 읽은 글과 안 읽은 글 구분
- **다크 모드**: 시스템 설정에 따라 자동 전환
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 기술 스택

- **Runtime**: Cloudflare Workers
- **Database**: D1 (SQLite)
- **Content Extraction**: @mozilla/readability + linkedom
- **Auto Deploy**: GitHub → Cloudflare Workers

## 설정 방법

### 1. D1 Database 생성

```bash
# D1 데이터베이스 생성
wrangler d1 create reader

# 출력된 database_id를 wrangler.toml에 복사
# [[d1_databases]]
# binding = "DB"
# database_name = "reader"
# database_id = "your-database-id-here"
```

### 2. 스키마 초기화

```bash
npm run db:init
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 로컬 개발

```bash
npm run dev
```

브라우저에서 `http://localhost:8787` 열기

### 5. 배포

```bash
npm run deploy
```

## 사용 방법

### 1. 글 저장
- 홈 화면 상단 입력창에 URL 입력
- `+ Add` 버튼 클릭
- 자동으로 본문 추출 및 읽기 모드로 이동

### 2. 글 읽기
- 안 읽은 글 목록에서 제목 클릭
- Safari Reader 스타일로 깔끔하게 읽기

### 3. 읽음 처리
- 읽기 화면 상단 `✓ Mark as Read` 버튼 클릭
- 자동으로 홈 화면으로 이동

## 프로젝트 구조

```
reader/
├── workers.js              # Workers 진입점, 라우터
├── schema.sql              # D1 스키마
├── wrangler.toml           # Cloudflare 설정
├── package.json
└── src/
    ├── handlers/
    │   ├── home.js         # GET / - 목록
    │   ├── post.js         # POST /post - URL 저장
    │   ├── reader.js       # GET /r/{id} - 읽기 모드
    │   └── markRead.js     # POST /r/{id}/mark-read
    ├── services/
    │   ├── extractor.js    # 컨텐츠 추출
    │   └── articleService.js # D1 CRUD
    ├── templates/
    │   ├── list.js         # 목록 HTML
    │   ├── reader.js       # 읽기 모드 HTML
    │   └── styles.js       # CSS
    └── types.js            # JSDoc 타입 정의
```

## API 엔드포인트

- `GET /` - 안 읽은 글 목록
- `POST /post` - URL 저장 (form data: url)
- `GET /r/{id}` - 글 읽기
- `POST /r/{id}/mark-read` - 읽음 처리

## 향후 개선 계획

- [ ] 태그 시스템
- [ ] 검색 기능
- [ ] 즐겨찾기
- [ ] 북마클릿
- [ ] RSS 피드

## 라이선스

MIT
