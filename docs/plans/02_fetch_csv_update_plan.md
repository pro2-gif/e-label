# 구글 시트 데이터 로딩 방식 개선 (CSV Fetch & Fallback)

## 🎯 목표
기존 JSONP(`gviz/tq`) 방식의 데이터 페치 로직이 일부 브라우저나 외부 호스팅(Vercel 등) 환경에서 무한 로딩 이슈를 유발하는 것을 해결하기 위해, 차단 위험이 없는 **CSV Fetch** 방식으로 로직을 전면 교체합니다. 
또한 네트워크 문제 발생 시 화면이 백지가 되는 것을 방지하기 위해 기본 하드코딩된 **Fallback 데이터**를 제공합니다.

## 📝 주요 변경 사항 (Proposed Changes)
1. **API 주소 변경**: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv` 로 요청
2. **CSV Parser 작성**: 정규식을 이용해 콤마, 따옴표, 줄바꿈이 포함된 CSV 텍스트를 정확하게 배열로 파싱하는 커스텀 `parseCSV` 함수 구현
3. **Fallback 데이터 추가**: `script.js` 상단에 최소한의 제품 리스트 데이터를 추가하여, fetch 실패 시 `productsData`를 즉각 채우도록 에러 핸들링 구성

## 🧪 테스트 계획 (Verification Plan)
- 실제 구글 시트 주소를 연결하여 데이터 파싱 오류 확인
- 인위적으로 `SHEET_ID`를 망가뜨려 Fallback 데이터가 정상적으로 렌더링되는지 확인
