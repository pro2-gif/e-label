# [Goal Description]
구글 시트 연동 데이터를 기반으로, 전자라벨 뷰어 화면(`index.html`)과 QR 코드 생성 화면(`qr_maker.html`)을 다시 분리하고, 제품명 파싱 오류 및 QR 코드 스캔 불가 문제를 해결합니다.

## User Review Required
> [!IMPORTANT]
> 1. **QR 코드 스캔 불가 원인**: 현재 파일이 수인 님의 '내 컴퓨터 바탕화면(`file:///C:/...`)'에 있기 때문에, 스마트폰으로 QR을 찍으면 접속할 수 없는 주소로 인식되어 '데이터 없음' 에러가 납니다. QR 코드가 정상 작동하려면 이 파일이 실제 웹 서버에 올라가야 합니다. 우선 QR 코드에 들어가는 주소를 `https://intomedipro.com/e-label/index.html?product=...` 와 같은 실제 인터넷 주소 형식으로 임시 지정해 두겠습니다. (추후 회사 서버 주소로 변경 가능)
> 2. **화면 분리**: QR 코드 생성 화면에서는 라벨 상세 정보를 보이지 않게 해달라는 요청에 따라, 역할을 두 개로 나눕니다.
>    - `qr_maker.html`: 관리자용. 제품을 선택하고 QR 코드를 다운로드하는 화면
>    - `index.html`: 소비자용. 스마트폰으로 QR을 찍었을 때 나타나는 제품 상세 정보 화면

## Open Questions
- QR 코드 안에 들어갈 기본 웹 주소(URL)를 `https://intomedipro.com/e-label/index.html` 로 설정해두어도 괜찮으신가요? 나중에 이 주소대로 서버에 파일을 올리셔야 소비자들이 볼 수 있습니다.

## Proposed Changes

### [QR Maker Component]
제품명 선택 및 QR 생성 전용 화면 구축

#### [NEW] [qr_maker.html](file:///C:/Users/user/Desktop/e-label/qr_maker.html)
- 제품 선택 드롭다운과 실시간 QR 코드 렌더링, 다운로드 버튼만 배치합니다.
- 복잡한 제품 상세 정보(표)는 이 화면에서 모두 제거합니다.

### [E-Label Viewer Component]
소비자가 보게 될 모바일 최적화 상세 화면

#### [MODIFY] [index.html](file:///C:/Users/user/Desktop/e-label/index.html)
- QR 생성 관련 UI(드롭다운, QR 이미지 등)를 모두 제거합니다.
- 오직 URL 파라미터(`?product=...`)를 읽어서 해당 제품의 정보만 표 형태로 깔끔하게 보여줍니다.

#### [MODIFY] [script.js](file:///C:/Users/user/Desktop/e-label/script.js)
- JSONP 파싱 시 `제품명`이라는 정확한 한글 문자열 매칭 대신, 첫 번째 열(`headers[0]`)을 무조건 제품명으로 인식하도록 로직을 개선하여 '제품 1'로만 뜨는 버그를 완벽히 고칩니다.
- 실행되는 HTML 파일이 `qr_maker.html`인지 `index.html`인지 구분하여, 필요한 화면만 그려주도록 자바스크립트를 수정합니다.

## Verification Plan
- `qr_maker.html`을 열어 제품 목록이 정상적으로 드롭다운에 표시되는지, 상세 표 없이 QR만 잘 나오는지 확인합니다.
- 스마트폰으로 모니터의 QR 코드를 스캔했을 때 올바른 URL 형식(`https://...`)으로 읽히는지 확인합니다.
