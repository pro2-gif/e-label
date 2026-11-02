# 계획서 37: 모바일 카드 하단 화살표-QR버튼 겹침 수정 및 홈 복귀 초고속(순간) 전환 최적화

## 1. 개요 및 목적
사용자 요청 사항:
1. **모바일 홈 화면 카드 하단 겹침 해결**:
   - 모바일 2열 카드에서 `"QR & Download →"`(또는 `"QR 확인 및 다운로드 →"`)의 화살표와 우측의 작은 QR 사각 버튼이 겹쳐 보이는 현상 수정.
2. **홈 화면 복귀 시 로딩 지연(오래 걸림) 해결**:
   - 제품 상세 정보를 확인한 뒤 좌측 상단 [홈] 버튼(또는 상단 로고)을 눌러 홈으로 돌아올 때, 로딩 스피너("제품 목록을 불러오는 중입니다...")가 오래 걸리거나 멈추는 현상 해결 ➔ 0초 즉시(순간) 전환 구현.

---

## 2. 세부 원인 및 변경 계획

### A. 모바일 카드 하단 겹침 수정
- **원인**:
  - 모바일 2열 그리드에서 카드의 내부 가용 폭은 약 140px인데, 가운데 정렬된 텍스트("QR & Download →", 약 100px)와 `position: absolute; right: 0;`으로 고정된 32px QR 버튼이 공간 부족으로 12px가량 겹침.
- **수정안**:
  - `@media (max-width: 640px)`에서:
    - `.product-card-footer`: `display: flex; justify-content: space-between; position: static;`
    - `.product-card-action`: `font-size: 11px; gap: 2px; flex: 1; text-align: left;`
      - 화살표 아이콘: `font-size: 13px;`
    - `.product-card-qr-btn`: `position: static; width: 26px; height: 26px; margin-left: 6px; flex-shrink: 0;`
      - QR 아이콘: `font-size: 15px;`
  - PC에서는 기존의 우아한 중앙 정렬을 그대로 유지하고, 모바일에서는 좌측 텍스트 / 우측 QR 버튼으로 완벽히 분리되어 절대 겹치지 않도록 보장.

### B. 홈 화면 복귀 초고속(0초) 즉시 전환 최적화
- **원인**:
  1. `initViewer()`(QR 스캔/URL로 바로 진입 시)에서 데이터를 받아올 때 `window.globalSheetData` 전역 변수에 저장하지 않아, 홈으로 돌아올 때 `window.globalSheetData`가 비어있어 로딩 스피너가 계속 돌거나 데이터를 처음부터 다시 조회함.
  2. `loadSheetData()`에 메모리 캐시가 없어 매번 Supabase 네트워크 요청을 반복함.
- **수정안**:
  1. `initViewer()` 완료 시 `window.globalSheetData = data;`를 확실하게 캐싱.
  2. `loadSheetData()`에 인메모리 캐시(`window._cachedSheetData`) 탑재 (이미 가져온 데이터는 네트워크 왕복 없이 0.001초 만에 즉시 반환).
  3. `navigateToHome()` 수정:
     - `document.getElementById('home-loading-indicator')`가 화면을 가리지 않도록 숨김 처리.
     - `window.globalSheetData`가 있으면 즉시 `renderProductGrid(window.globalSheetData, currentLang)`를 실행하여 화면에 즉각 표시.
     - 만약 없더라도 `loadSheetData`를 통해 즉시 채워 넣도록 폴백 안전장치 마련.

---

## 3. 검증 계획
1. `npm.cmd run build` 빌드 검증.
2. Puppeteer 검증:
   - 모바일(375px) 영문 모드에서 카드 하단 `QR & Download →` 와 `[QR]` 버튼이 충분한 간격을 두고 절대 겹치지 않는지 확인.
   - 제품 상세 페이지 진입 후 상단 [홈] 버튼 클릭 시, 로딩 지연 없이 홈 화면 카드가 0.1초 내로 즉각 나타나는지 확인.
