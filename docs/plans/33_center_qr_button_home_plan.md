# 계획서 33: 홈 화면 제품 카드 "QR 확인 및 다운로드" 버튼 중앙 정렬

## 1. 개요 및 배경
- **요청 사항**: 홈 화면의 제품 카드 하단에 위치한 `"QR 확인 및 다운로드"`의 위치를 카드 중앙으로 정렬.
- **현상 분석**:
  - 홈 화면 카드의 제품명(`.product-card-name`)은 정중앙으로 배치되어 있음.
  - 반면 하단 푸터(`.product-card-footer`)는 `display: flex; justify-content: space-between;`으로 설정되어 있어, 좌측 텍스트 버튼(`QR 확인 및 다운로드 ->`)이 좌측 끝으로 치우치고 우측 끝에 작은 QR 아이콘 버튼(`product-card-qr-btn`)이 배치되어 불균형하게 보임.
- **목적**:
  - 제품 카드 하단의 `"QR 확인 및 다운로드"` 텍스트와 화살표 아이콘을 카드의 정중앙 축에 맞추어 시각적 균형과 안정감을 높임.
  - 우측 끝의 QR 코드 다운로드 팝업 버튼은 기존 위치(우측 정렬)에 그대로 유지하여 기능성을 유지함.

---

## 2. 변경 계획

### CSS 스타일 수정 (`index.html`)
1. `.product-card-footer`:
   - `justify-content: space-between;` ➔ `justify-content: center;`
   - `position: relative;` 부여 (우측 서브 버튼 절대 위치 기준 마련)
   - `min-height: 32px;` 확보
2. `.product-card-action`:
   - `justify-content: center;`
   - `text-align: center;`
   - 모바일(`max-width: 640px`) 환경에서도 중앙 정렬 유지
3. `.product-card-qr-btn`:
   - `position: absolute; right: 0; top: 10px; bottom: 0; margin: auto 0;` 적용하여 상단 패딩 영역을 침범하지 않고 깔끔하게 우측 수직 중앙 정렬 유지.

---

## 3. 검증 계획
1. `npm run build` 번들 빌드 정상 여부 확인.
2. Puppeteer 화면 검증 (PC 1200px 및 모바일 375px)으로 카드의 제품명과 "QR 확인 및 다운로드"가 동일한 중앙 정렬 수직 축에 미려하게 배치되는지 확인.
