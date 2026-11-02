# 17. 표 PC 최적화 확대, 전 제품명 가운데 정렬, 모바일 기존 틀 복원, 홈 타이틀 및 제품순서 변경, 구매하기 버튼 추가, TTS 음성지원 수리 계획서

## 1. 개요 및 사용자 요구사항
1. **표(테이블) PC 최적화 크기 확대**:
   - PC 환경에서 780px로 다소 좁아 보였던 본문 및 테이블 최대 폭을 **`900px`**로 시원하게 확대하여 가독성 극대화.
2. **전 제품 제품명 가운데 정렬**:
   - PC 화면에서 좌측 정렬되어 있던 제품명을 전 제품에 걸쳐 **가운데 정렬(`text-align: center`)** 로 통일.
3. **모바일 화면 기존 틀 완벽 복원**:
   - PC 최적화 과정에서 순서가 바뀌었던 모바일 화면을 기존 형태(1. 제품명/서브탭 -> 2. 제품 대표 이미지 -> 3. 버튼들) 그대로 복원.
4. **홈 화면 제목 문구 수정 및 제품 순서 재배열**:
   - 타이틀을 `제니트리 e-Label 쇼룸`으로 더욱 고급스럽고 직관적으로 수정.
   - 제품 정렬 순서를 수인이 지정한 10개 제품 순서로 완벽 재배열:
     1. 클리닉스 리쥬 (`CLX-RJ`)
     2. 클리닉스 화이트 (`CLX-WH`)
     3. 클리닉스 하이드로 (`CLX-HY`)
     4. 라뉴필 (`CLX-LAP`)
     5. 딥 모이스처 카머 (`INTO-DMC`)
     6. 오일 컨트롤 모이스처 카머 (`INTO-OCC`)
     7. 인텐시브 베리어 카머 (`INTO-IBC`)
     8. 앰플런스 하이드로 버블폼 (`AMP-HYB`)
     9. 앰플런스 하이드로 (`AMP-HYA`)
     10. 앰플런스 하이드로 크림 (`AMP-HYC`)
5. **한국어 전용 "제품 구매하기" 버튼 추가**:
   - `https://intomedipro.com/shop` 링크로 연결되는 프리미엄 구매 버튼 `#btn-hero-buy` 신설.
   - 한국어(`lang === 'ko'`)일 때만 표시되고 다국어에서는 자동으로 숨김 처리.
6. **음성지원(TTS) 완전 수리 및 홈 화면 스피커 삭제**:
   - 홈 화면 우측 상단의 스피커 모양(`#btn-tts`) 삭제(숨김).
   - 상세 뷰어 화면의 스피커(각 행별 TTS) 클릭 시 소리가 안 나오던 원인(Chromium Utterance GC 및 큐 정체 버그)을 완벽 수리.

---

## 2. 세부 구현 계획

### 1) PC 테이블 폭 900px 확대 & 제품명 가운데 정렬
- `.main-content`: `max-width: 900px !important;` (데스크톱)
- `.product-hero-layout`: `grid-template-columns: 340px 1fr !important; gap: 36px !important;`
- `.product-name`: 데스크톱/모바일 공통 `text-align: center !important; margin: 0 auto !important;`

### 2) 모바일 화면 기존 순서 복원
- 구조적 분기:
  - 데스크톱: 2단 그리드 (좌: 이미지, 우: 정보 + 버튼)
  - 모바일: 세로 1단 스택
    - `order: 1` -> 상단 제품명 및 서브탭
    - `order: 2` -> 제품 대표 이미지 카드 (`max-width: 320px ~ 360px`)
    - `order: 3` -> 카탈로그, 견적의뢰, 구매하기 버튼들

### 3) 홈 화면 제목 및 제품 순서 변경
- `uiLabels.makerTitle`: `제니트리 e-Label 쇼룸`
- `renderProductGrid`:
  - `productOrder` 배열에 맞추어 `sort()` 수행 후 렌더링.

### 4) 한국어 전용 "제품 구매하기" 버튼 신설
- `#btn-hero-buy`:
  - 아이콘: `shopping_bag`, 문구: `제품 구매하기 ➔`
  - 링크: `https://intomedipro.com/shop`
  - 한국어 조건부 렌더링 (`lang === 'ko' ? 'inline-flex' : 'none'`)

### 5) TTS 음성지원 수리 & 홈 화면 상단 스피커 제거
- 홈 화면에서는 `#btn-tts.style.display = 'none'` 적용.
- 상세 뷰어에서는 `#btn-tts.style.display = 'inline-flex'` (뷰어 진입 시).
- `playItemTts` 및 `handleTts`:
  - `window.currentUtterance = utterance` 전역 변수 바인딩 (Chromium early GC 방지)
  - `speechSynthesis.resume()` 호출 보장
  - 오디오 파라미터(`volume = 1.0`, `rate = 0.9`) 설정

---

## 3. 검증 계획
1. 홈 화면:
   - 우측 상단 스피커 아이콘이 없는지 확인
   - 메인 타이틀이 `제니트리 e-Label 쇼룸`으로 표기되는지 확인
   - 제품 카드가 수인이 요청한 10개 순서대로 정확히 나열되는지 확인
2. PC 데스크톱 상세 화면:
   - 본문 표 폭이 900px로 넓어져 텍스트가 시원하게 펼쳐지는지 확인
   - 제품명이 가운데 정렬되었는지 확인
   - 한국어 버전에서 "제품 구매하기" 버튼이 정상 노출되고 링크 연결되는지 확인
3. 모바일 상세 화면:
   - 기존의 "제품명 -> 서브탭 -> 제품 사진 -> 버튼들" 순서로 예쁘게 나오는지 확인
4. TTS 음성지원:
   - 스피커 버튼 클릭 시 음성 재생이 정상 작동하는지 확인
