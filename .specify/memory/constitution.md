<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Initial constitution creation for Reader project
Modified principles: N/A (initial version)
Added sections: Core Principles (5), Technical Standards, Development Workflow, Governance
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section validated
  ✅ spec-template.md - Requirements alignment validated
  ✅ tasks-template.md - Task categorization validated
Follow-up TODOs: None
-->

# Reader 프로젝트 헌법

## Core Principles

### I. 단순성 우선 (Simplicity First)

모든 기능은 가장 단순한 방식으로 구현되어야 한다. 복잡한 아키텍처나 불필요한 추상화를 피하고,
직접적이고 이해하기 쉬운 코드를 작성한다. YAGNI(You Aren't Gonna Need It) 원칙을 엄격히 따른다.

**근거**: Cloudflare Workers의 제한된 실행 환경에서는 단순하고 효율적인 코드가 필수이며,
유지보수와 디버깅이 용이해야 한다.

**규칙**:
- 새로운 의존성 추가 시 반드시 정당한 이유 필요
- 3개 이상의 파일에 영향을 주는 변경은 설계 검토 필요
- 추상화 계층은 명확한 재사용 사례가 있을 때만 도입

### II. 웹 표준 준수 (Web Standards Compliance)

HTML, CSS, JavaScript의 웹 표준을 준수하고, 프레임워크나 빌드 도구 없이 동작해야 한다.
브라우저 네이티브 기능을 우선 활용하며, 폴리필이나 트랜스파일링을 최소화한다.

**근거**: Cloudflare Workers 환경에서 빌드 복잡도를 줄이고, 빠른 배포와 디버깅을 가능하게 한다.

**규칙**:
- 외부 JavaScript 라이브러리는 서버 사이드 처리에만 사용 (클라이언트는 바닐라 JS)
- CSS는 네이티브 변수와 모던 선택자 활용
- HTML은 시맨틱 마크업 준수

### III. 성능과 효율성 (Performance & Efficiency)

Cloudflare Workers의 CPU 시간 제한(50ms)과 메모리 제약을 고려하여 효율적인 코드를 작성한다.
불필요한 연산, 중복 데이터베이스 쿼리, 과도한 메모리 사용을 피한다.

**근거**: Workers 환경의 실행 시간 제한을 초과하면 요청이 실패하며, 사용자 경험이 저하된다.

**규칙**:
- 각 핸들러의 응답 시간은 50ms 이내 목표
- D1 쿼리는 인덱스를 활용하고 필요한 컬럼만 조회
- HTML 생성 시 템플릿 문자열 사용으로 메모리 효율성 확보
- 외부 API 호출(콘텐츠 추출 등)은 타임아웃 설정 필수

### IV. 점진적 향상 (Progressive Enhancement)

기본 기능은 JavaScript 없이도 동작해야 하며, JavaScript는 사용자 경험을 향상시키는
보조 수단으로만 사용한다. 다크 모드, 반응형 디자인 등은 CSS 기반으로 구현한다.

**근거**: 다양한 네트워크 환경과 기기에서 안정적인 서비스를 제공하며, 접근성을 보장한다.

**규칙**:
- 모든 핵심 기능(URL 저장, 목록 조회, 읽기)은 서버 사이드 렌더링
- JavaScript는 선택적 기능(애니메이션, 클라이언트 검증 등)에만 사용
- CSS 미디어 쿼리와 변수로 테마와 반응형 구현

### V. 타입 안전성과 검증 (Type Safety & Validation)

TypeScript를 사용하여 타입 안전성을 확보하고, 런타임에서도 입력 검증을 수행한다.
모든 외부 입력(URL, form data)은 검증 후 처리하며, 예상치 못한 데이터 형식에 대한
에러 처리를 명확히 한다.

**근거**: 런타임 에러를 사전에 방지하고, 디버깅 시간을 단축하며, 안전한 서비스를 제공한다.

**규칙**:
- 모든 .ts 파일은 `npm run typecheck` 통과 필수
- 사용자 입력은 utils/validation.ts의 검증 함수 사용
- D1 쿼리 결과는 타입 단언 전 null/undefined 체크
- 에러는 utils/response.ts의 표준 응답 형식 사용

## Technical Standards

### 프로젝트 구조

```
src/
├── handlers/          # HTTP 요청 핸들러 (각 엔드포인트별)
├── services/          # 비즈니스 로직 (article, extractor)
├── templates/         # HTML 생성 템플릿
├── utils/             # 공통 유틸리티 (validation, response)
└── types.ts           # 공유 타입 정의
```

**규칙**:
- 핸들러는 요청/응답 처리만 담당, 비즈니스 로직은 services로 분리
- 템플릿은 순수 함수로 작성, 데이터 의존성 명확히
- 유틸리티는 재사용 가능한 순수 함수로 구성

### 의존성 관리

**허용되는 의존성**:
- @mozilla/readability - 콘텐츠 추출
- linkedom - 서버 사이드 DOM 파싱
- @cloudflare/workers-types - 타입 정의
- TypeScript, Vitest, Wrangler - 개발 도구

**새 의존성 추가 기준**:
1. 명확한 문제 해결 목적
2. 번들 크기 영향 검토 (Workers 1MB 제한)
3. 대체 구현의 복잡도가 현저히 높은 경우
4. 활발히 유지보수되는 패키지

### 데이터베이스

**D1 사용 원칙**:
- 정규화된 스키마 유지 (schema.sql 참조)
- 인덱스 활용으로 쿼리 성능 최적화
- 트랜잭션은 필요한 경우에만 사용
- 마이그레이션은 schema.sql 수정 후 수동 적용

**쿼리 가이드라인**:
- SELECT는 필요한 컬럼만 명시
- WHERE 절은 인덱스 컬럼 우선 활용
- LIMIT 사용으로 결과 크기 제한
- 에러 처리 필수 (D1 쿼리 실패 시)

## Development Workflow

### 코드 작성 흐름

1. **타입 정의**: types.ts에 필요한 타입 추가
2. **유틸리티 구현**: 재사용 가능한 함수는 utils/ 디렉토리에
3. **서비스 로직**: services/에 비즈니스 로직 구현
4. **핸들러 작성**: handlers/에 HTTP 요청 처리
5. **템플릿 생성**: templates/에 HTML 생성 함수
6. **라우팅 연결**: workers.js에 라우트 추가

### 테스트 전략

**테스트 작성 기준**:
- 복잡한 비즈니스 로직(extractor, validation 등)은 단위 테스트 필수
- 간단한 CRUD 로직은 테스트 선택적
- 통합 테스트는 핵심 사용자 시나리오 중심

**테스트 실행**:
- `npm run test` - 모든 테스트 실행
- `npm run test:watch` - 개발 중 자동 테스트
- `npm run typecheck` - 타입 체크 (커밋 전 필수)

### 커밋과 배포

**커밋 메시지 형식**:
```
<type>: <subject>

<body>
```

**Type**:
- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- test: 테스트 추가/수정
- docs: 문서 수정
- chore: 빌드/도구 설정

**배포 절차**:
1. `npm run typecheck` 통과 확인
2. `npm run test` 통과 확인
3. `npm run deploy` 실행
4. 프로덕션 환경에서 주요 기능 수동 테스트

### 코드 리뷰 기준

**필수 체크리스트**:
- [ ] TypeScript 타입 에러 없음
- [ ] 입력 검증 적절히 수행
- [ ] 에러 처리 명확함
- [ ] 불필요한 복잡도 없음
- [ ] 성능 영향 검토 (특히 D1 쿼리, 외부 API 호출)
- [ ] 웹 표준 준수 (HTML/CSS)
- [ ] 모바일 반응형 동작 확인

## Governance

### 헌법 개정 절차

1. **제안**: 개정 필요성과 내용을 명확히 문서화
2. **검토**: 기존 코드와의 호환성, 마이그레이션 비용 평가
3. **승인**: 프로젝트 관리자 승인
4. **적용**: 헌법 버전 업데이트 및 관련 문서 수정
5. **전파**: 팀 공유 및 기존 코드 점진적 마이그레이션

### 버전 관리

**버전 형식**: MAJOR.MINOR.PATCH

- **MAJOR**: 기존 원칙 제거 또는 근본적 변경 (하위 호환 불가)
- **MINOR**: 새로운 원칙 추가 또는 기존 원칙의 중요한 확장
- **PATCH**: 표현 명확화, 오타 수정, 예시 추가 등

### 준수 검증

**개발 시**:
- 모든 PR은 헌법 준수 여부 체크
- 복잡도 증가는 명확한 정당성 필요
- 새 의존성 추가는 Technical Standards 기준 검토

**정기 리뷰**:
- 분기별 헌법 효용성 검토
- 위반 사례 분석 및 개선 방안 도출
- 필요 시 헌법 개정 제안

**Version**: 1.0.0 | **Ratified**: 2025-01-05 | **Last Amended**: 2025-01-05
