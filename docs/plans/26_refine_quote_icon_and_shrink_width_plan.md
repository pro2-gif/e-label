# Plan 26: 제품 견적 의뢰 버튼 아이콘 개선 및 가로 너비 축소 계획서

## 1. 개요 및 목적
- **사용자 요청 사항**:
  1. "제품 견적 의뢰 앞에 이모지를 수정해줘."
  2. "그리고 가로 길이도 좀 줄여줘 지금 너무 길어서 이상해"
- **현상 분석**:
  - 현재 견적 의뢰 버튼 좌측 아이콘이 `request_quote` 아이콘에 노란색 골드 컬러(`color: #FBBF24`)로 설정되어 있어 달러($) 기호가 부각되고 이모지처럼 튀어 보임.
  - PC 화면에서 `.standalone-quote-card`가 부모 컨테이너(1240px)를 100% 채워 좌우로 지나치게 길게 늘어나 텍스트와 우측 화살표 간격이 과도하게 벌어져 보임.
- **개선 목표**:
  1. 좌측 아이콘을 단정하고 세련된 공식 서류/문서 아이콘(`description`)으로 교체하고, 색상을 부드러운 화이트(`color: #ffffff`)로 정돈하여 다크 카드와 품격 있게 어울리도록 개선.
  2. 버튼의 가로 길이를 컴팩트하게 `max-width: 440px;`로 제한하고 `margin: 0 auto;`로 중앙 정렬하여, PC에서도 꽉 찬 긴 막대가 아닌 안정적이고 균형 잡힌 프리미엄 버튼으로 완성. 모바일에서는 자연스럽게 100% 너비 유지.

---

## 2. 작업 상세 내용
### 1) CSS 수정 (`index.html`)
- `.standalone-quote-card`:
  - `max-width: 440px !important;`
  - `margin: 0 auto !important;`
- `.standalone-quote-card .quote-icon-left`:
  - `color: #ffffff !important;` (노란색 달러 느낌 탈피)
  - `font-size: 22px !important;`

### 2) HTML 수정 (`index.html`)
- `<span class="material-icons quote-icon-left">request_quote</span>`
  ➔ `<span class="material-icons quote-icon-left">description</span>`

---

## 3. 검증 계획
1. Puppeteer 브라우저 테스트 스크립트 실행:
   - PC 1440px 화면에서 견적의뢰 카드의 렌더링된 너비가 440px인지 검증.
   - 아이콘 텍스트가 `description`이며 흰색으로 깔끔하게 렌더링되는지 확인.
   - 모바일(375px) 화면에서도 좌우 여백과 함께 정상 렌더링되는지 스크린샷 검증.
2. 커밋 및 클라우드 푸시.
