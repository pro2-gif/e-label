# 38_fix_lanupeel_tabs_and_jp_janytree_title_plan.md

## 작업 개요
1. **모바일 라뉴필 서브탭 버튼 1줄 나란히 정렬**
   - 영문 및 타언어에서 텍스트 길이로 인해 버튼(`[PEELING WASH]`, `[AMPOULE BOOSTER]`)이 상하 2줄로 분리되는 현상 수정
   - `#sub-tabs-container`의 모바일 `flex-wrap: nowrap !important;` 지정
   - `.sub-tab-btn`에 `flex: 1 1 0px; min-width: 0; padding: 10px 8px; font-size: 13px;`를 적용하여 1:1 균등 가로 나란히 배치 보장
2. **홈 화면 일본어 제목 영문(Janytree) 표기 통일**
   - 현재 일본어 모드 홈 제목이 `ジェニツリー製品情報のご案内`로 가타카나로 표기되던 것을 타언어(EN, ZH)와 동일하게 `Janytree製品情報のご案内`로 변경
   - `quoteDesc.jp`도 일관성을 위해 `Janytree GMPカスタム製品...`으로 정돈

## 대상 파일
- `index.html` (CSS 모바일 미디어 쿼리 872~882행, 다국어 라벨 1680행)

## 검증 계획
- 모바일(375px 너비)에서 라뉴필 상세 페이지 영문 모드 접속 시 버튼 2개가 가로 나란히 배치되는지 캡처 확인
- 홈 화면 일본어 모드에서 제목이 `Janytree製品情報のご案内`로 정상 표기되는지 캡처 확인
