# 계획서 25: 홈 화면 제품명 가운데 정렬, 제품 견적의뢰 강조 배경 적용, 라뉴필 세트 이미지 웹 서빙 완벽 해결

## 1. 개요 및 목적
1. **홈 화면 쇼룸 카드 제품명 가운데 정렬**:
   - 쇼룸 카드의 `.product-card-name`에 `text-align: center;`를 적용하여 모든 제품명이 정중앙에 정갈하게 정렬되도록 수정.
2. **제품 견적 의뢰 버튼 시각적 강조 (배경색 적용)**:
   - 하단 표 아래의 `[제품 견적 의뢰]` 버튼을 다크 차콜(`#1F2328`) 배경과 골드 포인트 아이콘(`#FBBF24`), 흰색 텍스트 및 호버 시 블루(`#305CDE`) 효과를 적용하여 확실하게 시선을 끄는 프리미엄 Call-To-Action으로 강화.
3. **라뉴필 세트 이미지 웹 서빙 및 대체 아이콘 문제 해결**:
   - Vite 기반 빌드 환경에서 정적 에셋이 누락되지 않도록 `public/lanupeel_set.png`와 루트 `lanupeel_set.png` 동기화.
   - 웹 서버(Cloudflare Pages) 배포 시 `dist/lanupeel_set.png`로 정상 복사되도록 구성하고, 이미지 경로를 안정화.

---

## 2. 세부 구현 계획

### A. 제품명 가운데 정렬
- `index.html` 내 `.product-card-name` CSS:
  ```css
  text-align: center !important;
  ```

### B. 제품 견적의뢰 독립 카드 스타일 강조
- `.standalone-quote-card` 스타일을 다크 프리미엄 배경으로 업그레이드:
  - 배경: `#1F2328;` (제니트리 대표 색상)
  - 글자색: `#ffffff;` (굵기 700, 16px)
  - 좌측 아이콘: `color: #FBBF24; font-size: 24px;` (골드 포인트)
  - 그림자: `0 6px 20px rgba(31, 35, 40, 0.18);`
  - 호버 시: `background: #305CDE;` (Accent Blue) & 살짝 떠오름

### C. 라뉴필 세트 이미지 빌드 및 배포 보장
- `public/lanupeel_set.png` 파일 생성 및 git 추적 추가.
- `index.html` 내 라뉴필 이미지 참조를 `lanupeel_set.png`로 일원화.
- 로컬 `vite build`를 실행하여 `dist/lanupeel_set.png` 생성 확인.

---

## 3. 검증 및 배포 계획
1. Puppeteer(Edge)를 통한 브라우저 검증:
   - 홈 화면: 제품 카드명 가운데 정렬 확인 및 라뉴필 카드 이미지 2048x2048 정상 로드 확인.
   - 상세 화면: 표 아래 `[제품 견적 의뢰]` 버튼이 다크 배경으로 눈에 띄게 강조되었는지 확인.
2. `git add` (`RULE 15`): `public/lanupeel_set.png`, `index.html`, 계획서 파일 개별 추가.
3. `git commit` 및 `git push origin master`.
