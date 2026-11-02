# 20. PC 테이블 1140px 대폭 확대, 견적/구매 버튼 색상 통일, 모바일 표 정렬 정상화 및 TTS 완전 수리 계획서

## 1. 개요 및 사용자 요구사항
1. **PC 정보 테이블 폭 대폭 확대**:
   - PC 화면에서 900px도 여전히 여백이 많아 보였으므로, **`1140px`** 수준으로 시원하게 확대하여 모니터 화면을 가득 채우는 최적의 가독성 제공.
2. **제품 견적의뢰 & 제품 구매하기 버튼 색상 통일**:
   - 기존의 다크(견적) / 블루(구매) 색상 차이를 **프리미엄 Charcoal 다크(`#1F2328`)** 로 통일하여 완벽한 일체감 형성.
3. **모바일 표 정렬 정상화 (2열 정상 표 복원)**:
   - `style.css`에서 모바일(`max-width: 600px`)일 때 `.info-table tr`을 세로 flex로 쪼개어 th와 td가 상하로 분리되던 현상을 제거.
   - 모바일에서도 좌측(라벨 `th`, 32%)과 우측(값 `td`, 68%)이 나란히 있는 **가로 2열 정상 표 형태**로 단정하게 최적화.
4. **TTS 음성지원 완전 수리**:
   - 아이폰(iOS Safari) 및 모바일/데스크톱 브라우저에서 스피커 버튼 클릭 시 소리가 나지 않던 원인(User Gesture 소멸, 큐 정체, 가비지 컬렉션)을 완벽 수리.

---

## 2. 세부 구현 계획

### 1) PC 테이블 폭 1140px 확대
- `.main-content`: `max-width: 1140px !important;`
- `.product-hero-layout`: `grid-template-columns: 360px 1fr !important; gap: 20px 48px !important;`
- `.info-table th`: `width: 20% !important; padding: 18px 24px !important;`
- `.info-table td`: `width: 80% !important; padding: 18px 28px !important; font-size: 15px !important;`

### 2) 버튼 색상 통일 (Charcoal #1F2328)
- `#btn-hero-buy`:
  - `background: #1F2328 !important;`
  - `color: #ffffff !important;`
  - 호버 시: `background: #305CDE !important;`
  - 견적의뢰 버튼(`#btn-hero-quote`)과 완벽한 쌍(Pair) 형성.

### 3) 모바일 표 정렬 정상화
- `style.css` 및 `index.html`:
  - 모바일에서 `.info-table tr`을 `display: table-row !important;`로 고정.
  - `th`는 `display: table-cell !important; width: 32% !important; text-align: center !important; vertical-align: middle !important;`
  - `td`는 `display: table-cell !important; width: 68% !important; text-align: left !important; vertical-align: middle !important;`
  - 3번째 캡처처럼 상하로 깨져 보이던 현상 100% 정상화.

### 4) TTS 음성지원 수리
- iOS Safari 및 Chromium 대응 `playItemTts` 완전 재작성:
  - 동기적 `speak` 호출 보장
  - `window.currentUtterance` 바인딩
  - 빈 텍스트 폴백 보장
  - 무음 스위치 안내 추가

---

## 3. 검증 계획
1. PC 데스크톱 화면에서 테이블 너비가 1140px로 확대되고 버튼 색상이 통일되었는지 스크린샷 캡처 검증.
2. 모바일 화면에서 표가 좌(th)/우(td) 정상적인 2열 테이블로 깔끔하게 정렬되는지 스크린샷 캡처 검증.
3. TTS 함수가 정상 실행되는지 Puppeteer 콘솔 검증.
