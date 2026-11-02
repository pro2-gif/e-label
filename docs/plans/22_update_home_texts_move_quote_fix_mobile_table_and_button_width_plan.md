# 계획서 22: 홈 화면 문구 수정, 제품 견적 의뢰 위치 이동, 상단 버튼 너비 축소 및 모바일 표 정렬 보강

## 1. 개요 및 목적
사용자 요청 사항:
1. **홈 화면 문구 수정**:
   - 부제목: `"제품을 선택하시면 제품 정보 및 견적을 의뢰하실 수 있습니다."` ➔ `"제품을 선택하시면 제품 정보 확인 및 견적을 의뢰하실 수 있습니다."`
   - 카드 액션 버튼: `"라벨 정보 보기"` ➔ `"QR 확인 및 다운로드"`
2. **제품 견적 의뢰 위치 이동**:
   - 상단 헤더 영역에서 견적의뢰 버튼을 제거하고, 하단 정보 테이블의 **소비자 상담 아래(`row-quote`)** 항목으로 배치.
3. **상단 버튼 가로 너비 축소 (PC 최적화)**:
   - PC 1140px 레이아웃에서 너무 길게 늘어지던 상단 버튼들(카탈로그 보기, 구매하기)의 너비를 `max-width: 360px`로 컴팩트하게 제한하고 중앙 정렬.
4. **모바일 표 2열 정렬 보강**:
   - 모바일 환경에서 항목명(`th`)과 내용(`td`)이 위아래로 떨어지지 않고, 좌측 항목 / 우측 내용의 2열 테이블로 정갈하게 유지되도록 스타일 견고화.

---

## 2. 세부 구현 계획

### A. 홈 화면 문구 변경
- `index.html` 내 `maker-desc` 초기 텍스트 및 `uiLabels.makerDesc` 다국어 매핑 업데이트.
- `uiLabels.viewLabelBtn` 다국어 매핑을 `"QR 확인 및 다운로드"`(각 언어별 번역 반영)로 변경하고, `renderProductGrid`의 fallback 텍스트도 동기화.

### B. "제품 견적 의뢰" 테이블 행 배치
- `<tr id="row-customer">` 바로 아래에 `<tr id="row-quote">` 행 신규 추가:
  - `th id="label-quote"`: "제품 견적 의뢰"
  - `td id="val-quote"`: `table-quote-card` 버튼 (GMP 견적 링크: `https://gmp.janytree.app/catalog/3770ff9ccb7d42299afe152298451a1e`)
- 상단의 `.hero-quote-wrapper`는 제거하여 상단 공간을 심플하고 가볍게 정리.
- `uiLabels.quote` 다국어 번역 키를 연동하여 언어 전환 시 자동 반영.

### C. 상단 버튼 가로 너비 축소
- `.product-hero-actions-area`: `display: flex; flex-direction: column; align-items: center; width: 100%;`
- `.catalog-btn-wrapper`, `.buy-btn-wrapper`: `max-width: 360px !important; margin: 0 auto !important; width: 100% !important;`
- `.catalog-link-card`, `.hero-buy-btn`: `max-width: 360px !important; width: 100% !important;`
- 이를 통해 PC 대화면에서도 우측 버튼이 과도하게 늘어지지 않고 미려한 황금비율 카드로 배치.

### D. 모바일 표 2열 정렬 견고화
- `.info-table`의 `display: table !important; width: 100% !important; table-layout: fixed !important;`
- `th`, `td` 모두 `display: table-cell !important;` 유지 및 미디어쿼리 우선순위 정비.

---

## 3. 검증 계획
1. **홈 화면**:
   - 부제목 문구가 `"제품을 선택하시면 제품 정보 확인 및 견적을 의뢰하실 수 있습니다."`로 정상 표기되는지 확인.
   - 제품 카드 하단 버튼이 `"QR 확인 및 다운로드"`로 표기되는지 확인.
2. **제품 상세 화면 (PC)**:
   - 상단 제품명 아래에 카탈로그 보기 및 구매하기 버튼이 `max-width: 360px` 컴팩트 너비로 단정하게 나오는지 확인.
   - 테이블 하단 "소비자 상담" 바로 아래에 "제품 견적 의뢰" 행과 바로가기 카드가 노출되는지 확인.
3. **제품 상세 화면 (모바일 390px)**:
   - 테이블의 모든 항목(용량, 제조업자, 전성분, ..., 소비자상담, 제품견적의뢰)이 좌측 th, 우측 td 2열로 정상 배치되는지 확인.
