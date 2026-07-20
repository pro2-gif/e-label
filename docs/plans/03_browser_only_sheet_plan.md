# [Goal Description]
사용자의 요청에 따라, 컴퓨터에 파이썬이나 기타 프로그램을 전혀 설치하지 않고 오직 **인터넷 브라우저 하나만으로 동작하는 구글 시트 연동 다중 제품 e-라벨 화면**을 구현합니다.

## User Review Required
> [!IMPORTANT]
> 안티그래비티(Antigravity)는 화면을 마우스로 드래그 앤 드롭해서 만드는 '노코드 비주얼 빌더(No-code Visual Builder)' 플랫폼이 아니라, **사용자를 대신해 완성된 형태의 프로그래밍 코드를 직접 작성해 드리는 'AI 개발자'**입니다. 따라서 내장된 비주얼 시트 커넥터 화면은 존재하지 않습니다.
>
> **대신, 이 문제를 완벽하게 해결할 방법이 있습니다.**
> 파이썬 서버 대신 **순수 HTML과 JavaScript만 사용하여**, 브라우저가 열리자마자 백그라운드에서 구글 시트 데이터를 실시간으로 읽어오고 화면을 자동으로 그려주는 파일을 만들어 드리겠습니다. 
> 
> 수인 님은 **아무 프로그램도 설치할 필요 없이 완성된 파일만 더블클릭**하시면 됩니다!

## Open Questions
- 이전에 작성된 디자인(스타일)과 QR코드 생성기 기능을 그대로 유지하면서, 구글 시트를 읽어오는 로직만 새롭게 추가하여 하나의 완성된 `index.html` 파일로 만들어 드려도 괜찮으신가요?

## Proposed Changes

### [Frontend & Data Fetching Component]
프로그램 설치 없이 브라우저에서 모두 동작하는 구글 시트 연동 웹 페이지 구축

#### [MODIFY] [index.html](file:///C:/Users/user/Desktop/e-label/index.html)
- 기존 정적 HTML 파일에 구글 시트 CSV 파싱 로직(`fetch API`)을 추가합니다.
- 화면 상단에 3개의 제품(리쥬, 화이트, 하이드로)을 선택할 수 있는 **드롭다운 메뉴(Select Box)**를 추가합니다.
- 제품을 선택하면 화면의 e-라벨 내용이 구글 시트 데이터로 즉각 교체되는 동적 렌더링을 구현합니다.
- 화면 한쪽에 선택한 제품에 해당하는 고유 주소의 QR 코드를 띄워주는 기능(`qrious.js` 활용)을 병합합니다.

#### [DELETE] [app.py](file:///C:/Users/user/Desktop/e-label/app.py) & [requirements.txt](file:///C:/Users/user/Desktop/e-label/requirements.txt)
- 설치가 필요한 파이썬 환경의 파일들은 불필요하므로 깔끔하게 삭제합니다.

## Verification Plan

### Manual Verification
- 바탕화면의 `e-label` 폴더에서 `index.html` 파일을 크롬 브라우저로 엽니다.
- 브라우저가 자동으로 구글 시트에서 최신 텍스트를 불러와 화면에 뿌려주는지 확인합니다.
- 제품을 변경할 때마다 내용과 QR 코드가 정상적으로 갱신되는지 테스트합니다.
