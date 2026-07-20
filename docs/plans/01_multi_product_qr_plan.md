# [Goal Description]
구글 시트에 정리된 다수의 화장품 제품 정보(리쥬, 화이트, 하이드로)를 e-라벨 시스템에 연동합니다. 
각 제품별로 고유한 파라미터(URL parameter)를 부여하여, QR 코드를 스캔했을 때 해당 제품의 정보가 정확하게 표시되는 동적(Dynamic) 다중 제품 전자라벨 시스템을 구축합니다.

## User Review Required
> [!IMPORTANT]
> 1. 시트에 영어 번역본이 기재되지 않은 항목들(사용방법, 전성분, 주의사항 등)에 대해서는, 기존 '리쥬' 제품의 영문 번역 데이터를 기반으로 유사하게 자동 번역하여 임시 적용해 두겠습니다. 나중에 코드를 통해 직접 수정하실 수 있습니다.
> 2. `qr_maker.html`에서는 직접 URL을 입력하는 방식 대신, **"제품 선택 드롭다운(Select Box)"**을 추가하여 제품을 고르면 해당 제품에 맞는 고유 URL의 QR 코드가 즉시 생성되도록 변경하겠습니다.

## Open Questions
- 전성분이나 각 제품별 특징 등 텍스트 내용 중 특별히 줄바꿈(엔터)이 더 필요한 곳이 있나요? (현재는 쉼표 기준으로 나열되도록 데이터베이스에 삽입하겠습니다.)
- 하단 "구매하기" 버튼의 경우 각 제품별로 링크가 달라야 하나요, 아니면 기존처럼 공통 스토어(intomedipro.com)로 보내면 될까요? 우선은 공통 주소로 반영하겠습니다.

## Proposed Changes

### [Database & Logic Component]
다중 제품 데이터를 관리하고 URL에 따라 정보를 바꿔 보여주는 로직 적용

#### [MODIFY] [script.js](file:///C:/Users/user/Desktop/e-label/script.js)
- 기존 단일 `db.product_info` 객체를 제품 ID(ex: `reju`, `white`, `hydro`)를 키(Key)로 가지는 다중 객체 배열로 변경합니다.
- 사진으로 제공해주신 시트 데이터를 국/영문으로 정리하여 모두 기입합니다.
- 브라우저 주소창의 파라미터(예: `?product=white`)를 읽어와서, 화면의 UI 요소들에 해당 제품의 데이터를 바인딩하는 로직을 추가합니다.

### [QR Generator Component]
제품별 QR 코드를 쉽게 생성하기 위한 UI 개편

#### [MODIFY] [qr_maker.html](file:///C:/Users/user/Desktop/e-label/qr_maker.html)
- 사용자가 직접 텍스트나 URL을 입력하지 않도록, `script.js`의 DB를 참조하거나 자체 옵션을 가지는 `<select>` 드롭다운 메뉴를 도입합니다.
- 제품을 선택하면 `http://192.168.0.40:5173/?product=해당제품ID` 형태의 URL로 QR 코드가 자동 갱신되게 만듭니다.
- 다운로드되는 파일명도 자동으로 `인투메디_클리닉스_화이트_단상자_QR코드.png` 처럼 제품명에 맞게 변경되도록 수정합니다.

## Verification Plan

### Manual Verification
- 브라우저에서 `index.html?product=white` 등으로 접속하여 화이트 제품의 정보가 제대로 뜨는지 확인합니다.
- `qr_maker.html`에서 제품을 바꿀 때마다 QR 코드가 갱신되고, 다운로드 시 해당 제품의 이름이 사진 파일 안팎으로 잘 반영되는지 확인합니다.
- 모바일(스마트폰)로 생성된 각 제품의 QR을 찍었을 때, 올바른 제품 정보 화면으로 떨어지는지 테스트합니다.
