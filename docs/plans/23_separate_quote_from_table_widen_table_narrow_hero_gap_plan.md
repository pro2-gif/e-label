# 계획서 23: 제품 견적의뢰 표 분리(독립 카드), 표 가로폭 확장, 제품 이미지-제품명 간격 축소 및 라뉴필 이미지 안내

## 1. 개요 및 목적
1. **제품 견적의뢰 분리 및 (GMP) 단어 삭제**:
   - 하단 표의 `row-quote` 행을 표에서 제외하고, 표 바로 아래에 별도의 독립된 화이트 카드 섹션(`#quote-standalone-container`)으로 분리.
   - 버튼 문구에서 `(GMP)` 단어를 삭제하고 깔끔하게 **`"제품 견적 의뢰"`**로 통일.
2. **제품 정보 표 가로 너비 확장**:
   - `main-content`의 최대 너비를 기존 1140px에서 **`1240px`**로 넓혀 표 전체가 가로로 시원하게 펼쳐지도록 개선.
3. **제품 이미지와 제품명 사이 간격 축소**:
   - 데스크톱 히어로 영역을 `grid-template-columns: 340px 400px` 및 `justify-content: center`, 간격 `28px`로 설정하여 이미지 바로 옆에 제품명과 버튼이 긴밀하게 붙도록 조정.
4. **라뉴필 세트 대표 이미지 변경 방법 안내**:
   - 사용자에게 초보자 눈높이에 맞춰 이미지 교체 방법(채팅 첨부 / 로컬 파일 / 링크)을 직관적으로 안내.

---

## 2. 세부 구현 계획

### A. 제품 견적의뢰 독립 카드 배치
- `index.html` 내 `<table class="info-table">` 안의 `<tr id="row-quote">` 행 제거.
- `</div><!-- .table-container -->` 바로 아래에 독립 카드 컨테이너 추가:
  ```html
  <div id="quote-standalone-container" class="quote-standalone-container">
      <a id="btn-standalone-quote" href="https://gmp.janytree.app/catalog/3770ff9ccb7d42299afe152298451a1e" target="_blank" class="standalone-quote-card">
          <div style="display: flex; align-items: center; gap: 10px;">
              <span class="material-icons quote-icon-left">request_quote</span>
              <span id="label-standalone-quote-text">제품 견적 의뢰</span>
          </div>
          <span class="material-icons quote-icon-right">open_in_new</span>
      </a>
  </div>
  ```
- 다국어 라벨 매핑에서 `quoteBtn`의 `ko` 값을 `"제품 견적 의뢰"`((GMP) 제거)로 정비.

### B. 표 가로폭 확장 (1240px 캔버스)
- `.main-content`: `max-width: 1240px !important;`
- `.table-container`: `width: 100%;` (1240px 너비에 맞춰 시원하게 확장)

### C. 상단 히어로 간격 좁히기
- `.product-hero-layout` (@media min-width: 860px):
  - `grid-template-columns: 340px 400px !important;`
  - `justify-content: center !important;`
  - `gap: 16px 28px !important;`
  - 이미지와 텍스트 사이가 멀어지지 않고 딱 알맞은 거리감 유지.

---

## 3. 검증 계획
1. **PC 데스크톱 화면**:
   - 이미지와 제품명 사이 거리가 28px로 좁혀졌는지 확인.
   - 정보 테이블 폭이 1240px로 넓어졌는지 확인.
   - 표 마지막에 `소비자 상담`이 있고, 표 아래에 별도의 독립된 화이트 카드 형태로 `"제품 견적 의뢰"`((GMP) 없음)가 노출되는지 확인.
2. **모바일 화면 (390px)**:
   - 2열 테이블 정상 유지 및 하단에 독립 견적의뢰 카드가 예쁘게 배치되는지 확인.
