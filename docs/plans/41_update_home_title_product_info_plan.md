# 41_update_home_title_product_info_plan.md

## 작업 개요
- **목적**: 홈 화면 메인 제목을 "제니트리 제품 정보"에서 "제품 정보"로 수정
- **배경**: 상단에 이미 공식 로고(Janytree)가 위치하므로 불필요한 회사명 중복을 배제하고 단정하고 세련된 "제품 정보"로 정돈

## 대상 파일 및 수정 위치
- `index.html`:
  1. 1078행: 정적 HTML `<h1 id="maker-title">제품 정보</h1>`
  2. 1703행: 다국어 객체 `uiLabels.makerTitle.ko = "제품 정보"`

## 검증 계획
- `npm.cmd run build` 빌드 검증
- Puppeteer 스크립트로 모바일 및 PC 홈 화면 렌더링 확인
