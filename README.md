# 나의 성향 아키타입 테스트

요즘 일상 장면으로 된 54개 질문에 답하면 6가지 성격 차원 점수를 계산하고, 24가지 성향 아키타입 중 가장 가까운 유형을 보여주는 웹 심리테스트입니다. 다음 성격심리학 연구를 참고했습니다.

- HEXACO 모델(Ashton & Lee)
- Big Five
- IPIP(International Personality Item Pool)

> 이 테스트는 성격심리학 연구를 참고한 자기이해용 테스트이며, 임상적 진단이나 평가를 대신하지 않습니다.

이론적 근거, 문항 설계 원칙, 채점 방식, 분포 검증 결과, 한계점은 [docs/methodology.md](docs/methodology.md)에 정리되어 있습니다.

## 주요 기능

- **문항 화면**: 한 화면에 한 문항, 진행률 바, 이전 문항으로 돌아가기. 키보드 1~5와 ←/→도 됩니다.
- **이어하기**: 응답 진행 상태를 브라우저 localStorage에 저장하므로 새로고침해도 이어서 할 수 있습니다.
- **결과 화면**: 유형 상징 아이콘(직접 그린 SVG), 일치도, 6차원 레이더 차트, 차원별 양극 막대, 차원별 상세 해석, 유형 설명, 궁합, 숨은 닮은꼴
- **결과 공유**: 짧은 코드가 담긴 URL로 결과를 그대로 재현할 수 있습니다(`/result/?r=2khkifi`, 문항 개편 전 6글자 링크도 호환). 결과 카드를 PNG로 저장할 수도 있습니다.
- **유형 도감**: 24개 유형 카드 그리드와 유형별 상세 페이지
- **개인정보 보호**: 서버 저장도, 개인정보 수집도 없습니다. 정적 사이트로 빌드됩니다.

## 기술 스택

| 분류 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 15 (App Router, `output: "export"` 정적 빌드), React 19, TypeScript |
| 스타일 | Tailwind CSS v4 |
| 차트 | Recharts |
| 결과 이미지 저장 | html-to-image |
| 테스트 | Vitest |
| 시뮬레이션 실행 | tsx |

## 빠른 시작

Node.js 20 이상이 필요합니다.

```bash
npm install
```

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### npm 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 정적 사이트 빌드 → `out/` 폴더 |
| `npm test` | 단위 테스트 (채점 로직, 공유 코드, 데이터 규칙) |
| `npm run simulate` | 유형 분포 시뮬레이션 (10,000건 × 시나리오) → `docs/simulation-results.md` 갱신. 기준을 벗어나면 실패 코드로 끝납니다 |
| `npm run simulate -- --calibrate` | 프로토타입 크기를 미세조정해 `data/types.json`에 반영한 뒤 다시 검증합니다 |

> npm 11 이상에서 `esbuild` 설치 스크립트 관련 경고가 나올 수 있습니다. 테스트나 시뮬레이션 실행 중 esbuild 오류가 나면 경고 메시지에 안내된 대로 `npm approve-scripts esbuild`로 허용한 뒤 다시 설치하세요.

## 프로젝트 구조

```
app/
  page.tsx              시작 화면
  test/page.tsx         문항 화면
  result/page.tsx       결과 화면 (?r= 공유 코드로 결과 재현)
  types/page.tsx        24유형 도감
  types/[id]/page.tsx   유형 상세 (정적 생성)
components/             TestRunner, ResultView, ShareCard, ProfileRadar, DimensionBars, SymbolIcon 등
lib/
  scoring.ts            채점 로직 (순수 함수)
  share.ts              공유 코드 인코딩/디코딩
  storage.ts            localStorage 진행 상태 저장
  data.ts, types.ts     데이터 로딩과 타입
  profile.ts            점수 → 문구, 색상 도우미
data/
  dimensions.json       6개 차원 정의 (이름, 양극 라벨)
  items.json            54문항 (id, 문항, 차원, 역채점 여부, 참고 구성개념)
  types.json            24개 유형 (프로토타입, 설명, 궁합, 색상 등)
scripts/simulate.ts     분포 검증 시뮬레이션
tests/                  scoring / share / data 단위 테스트
docs/
  methodology.md        방법론 문서
  simulation-results.md 최신 시뮬레이션 결과 (자동 생성)
```

## 데이터 수정하기

데이터는 코드와 분리되어 있습니다. 수정한 뒤에는 꼭 아래 두 명령을 실행하세요.

```bash
npm test
```

```bash
npm run simulate
```

- **문항 문구 수정** (`data/items.json`): 15~40자, 같은 차원 문항이 연속되지 않을 것, 차원별 9문항·역채점 4문항 규칙을 테스트가 검사합니다.
- **유형 설명 수정** (`data/types.json`): 강점 3개, 주의할 점 2개, 해시태그 3~5개, 설명 3~4문장, 궁합 유형 id가 실제로 있는지, 금지된 유형명을 쓰지 않았는지를 테스트가 검사합니다.
- **프로토타입 수정**: 유형 사이 최소 거리 0.75 이상을 테스트가 검사합니다. 분포가 기준(1.5~9%)을 벗어나면 `npm run simulate -- --calibrate`로 보정하세요.
- **주의: 공유 코드 호환성**: 문항 수나 차원 구성을 바꾸면 이전에 공유된 링크(`?r=`)의 결과가 달라질 수 있습니다.

## 배포

### GitHub Pages (현재 사용 중)

`main` 브랜치에 push하면 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)이 테스트 → 정적 빌드 → 배포를 자동으로 실행합니다. 사이트 주소는 `https://<GitHub 아이디>.github.io/<저장소 이름>/`입니다.

- 처음 한 번 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정해야 합니다.
- 하위 경로(`/<저장소 이름>`)는 워크플로가 `PAGES_BASE_PATH`로 자동 전달합니다(`next.config.ts`의 `basePath`).
- 무료 계정에서 GitHub Pages를 쓰려면 저장소가 공개(public)여야 합니다. 응답 데이터는 서버로 전송되지 않으므로 저장소에 개인정보가 쌓이지 않습니다.

### Vercel

1. 이 저장소를 GitHub에 올립니다.
2. [Vercel](https://vercel.com)에서 **Add New → Project**를 누르고 저장소를 가져옵니다.
3. Framework Preset은 **Next.js**로 자동 감지됩니다. 빌드 설정은 기본값 그대로 두고 **Deploy**를 누릅니다.

`next.config.ts`에 `output: "export"`가 설정되어 있어서 서버 기능 없이 정적 파일로 배포됩니다.

### 다른 정적 호스팅 (Netlify, S3 등)

```bash
npm run build
```

생성된 `out/` 폴더를 그대로 업로드하면 됩니다. 페이지 경로는 `trailingSlash: true` 설정에 따라 `/types/pioneer/index.html` 형식으로 만들어집니다.

> 하위 경로에 배포한다면 빌드할 때 `PAGES_BASE_PATH=/경로` 환경변수를 지정하세요.

## 저작권과 출처

- 문항 54개는 IPIP-HEXACO의 하위요인 개념을 참고해 한국어로 새로 작성했습니다. NEO-PI-R, MBTI 등 상용 검사의 문항은 사용하지 않았습니다.
- 유형명은 기존 검사(16Personalities, 에니어그램 등)의 유형명과 겹치지 않게 지었습니다.
- 아이콘은 직접 그린 SVG입니다. 웹 글꼴은 Pretendard(SIL Open Font License)를 CDN으로 불러옵니다.
