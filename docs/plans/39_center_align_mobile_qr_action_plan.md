# 39_center_align_mobile_qr_action_plan.md

## 작업 개요
- **목적**: 모바일 화면 홈 카드 하단 "QR 확인 및 다운로드" 문구를 카드 정중앙으로 가운데 정렬 (모든 언어 공통)
- **배경**: 직전 모바일 패치에서 화살표와 QR 버튼 겹침을 방지하기 위해 `justify-content: space-between`을 적용하면서 문구가 좌측으로 치우쳐 보이는 현상 발생
- **해결 방안**:
  1. `.product-card-footer`를 `position: relative`로 설정하여 중앙 축 기준 레이아웃 복원
  2. `.product-card-action`에 `width: 100%; justify-content: center; text-align: center;`를 적용하고 좌우 `padding: 0 24px;`를 대칭 부여하여 카드의 완벽한 정중앙 정렬 보장
  3. `.product-card-qr-btn`은 `position: absolute; right: 0;`으로 우측 끝에 슬림(24px)하게 배치하여 문구 및 화살표와 물리적 겹침을 원천 차단
  4. 한국어(KO), 영어(EN), 일본어(JP), 중국어(ZH-CN, ZH-TW) 모든 언어에서 동일하게 정중앙 정렬 확인

## 대상 파일
- `index.html` (CSS 미디어 쿼리 314~349행)
