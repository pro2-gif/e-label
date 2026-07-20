# [Goal Description]
기존 정적 HTML/JS 방식 대신, 파이썬 기반의 **Streamlit 프레임워크**를 사용하여 구글 시트 데이터를 실시간으로 읽어오고 e-라벨을 화면에 띄워주는 웹 앱을 구축합니다.

## User Review Required
> [!IMPORTANT]
> 1. 제공해주신 구글 시트 URL에서 CSV 형태로 데이터를 읽어오는 로직을 작성합니다.
> 2. 성능 향상을 위해 Streamlit의 `@st.cache_data` 데코레이터를 사용하여 시트 데이터를 캐싱(Caching)합니다.
> 3. 선택한 제품에 맞는 e-라벨 내용이 화면에 렌더링되며, 해당 전자라벨(또는 제품)로 연결되는 QR 코드가 실시간으로 생성되어 화면에 함께 표시되도록 구현합니다.

## Open Questions
- Streamlit 환경은 기존 HTML 화면 디자인(Premium Aesthetics)을 그대로 100% 재현하기에는 제약이 있을 수 있습니다. Streamlit이 제공하는 깔끔한 기본 UI 요소(st.columns, st.markdown 등)를 활용하여 모던하게 구성해도 괜찮으신가요?
- QR 코드가 가리키는 링크는 이 Streamlit 앱 자체가 되어야 할까요, 아니면 다른 외부 주소를 가리켜야 할까요? (기본적으로는 이 Streamlit 앱에 파라미터를 넘기는 방식으로 구성하겠습니다.)

## Proposed Changes

### [Streamlit App Component]
기존 HTML 방식을 대체할 파이썬 웹 앱 코드 작성

#### [NEW] [app.py](file:///C:/Users/user/Desktop/e-label/app.py)
- 구글 시트 데이터를 판다스(Pandas)로 불러오고 전처리하는 로직 (`@st.cache_data` 적용)
- 사이드바(Sidebar) 혹은 상단에 제품 선택 드롭다운 UI 제공
- 선택된 제품의 용량, 사용방법, 전성분, 주의사항 등을 보여주는 e-라벨 메인 뷰 구현
- `qrcode` 라이브러리를 활용하여 실시간으로 생성된 인쇄용 QR 코드를 화면 한쪽에 띄워주는 기능 추가

#### [MODIFY] [package.json](file:///C:/Users/user/Desktop/e-label/package.json) (Optional)
- 파이썬 환경이므로 `package.json` 대신 `requirements.txt`가 필요합니다.

#### [NEW] [requirements.txt](file:///C:/Users/user/Desktop/e-label/requirements.txt)
- `streamlit`, `pandas`, `qrcode`, `Pillow` 등 필요한 파이썬 라이브러리 명시

## Verification Plan
- 터미널에서 `streamlit run app.py`를 실행합니다.
- 브라우저에 접속하여 구글 시트의 최신 데이터(3가지 제품)가 정상적으로 로드되는지 확인합니다.
- 제품을 변경할 때마다 제품 정보와 QR 코드가 실시간으로 즉시 갱신되는지 확인합니다.
