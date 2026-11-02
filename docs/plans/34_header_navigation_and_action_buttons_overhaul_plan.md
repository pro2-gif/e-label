# 계획서 34: 상단 네비게이션 개편, 신규 로고 적용 및 액션 버튼 정리

## 1. 개요 및 목적
사용자 요청 사항:
1. **제품 구매하기 / 제품 견적의뢰 버튼 전제품 삭제**:
   - 상단 제품명 우측에 있던 "제품 구매하기" 버튼 삭제.
   - 하단 정보 표 아래에 있던 다크 카드 "제품 견적 의뢰" 버튼 삭제.
2. **홈페이지 바로가기 버튼 추가**:
   - 기존 "제품 카탈로그 보기 (PDF)" 버튼 바로 아래에 제니트리 공식 홈페이지로 이동하는 버튼 추가.
   - 기존 카탈로그 버튼과 통일된 카드 디자인(`catalog-link-card`) 및 다국어 지원 적용.
3. **상단 네비게이션 및 홈 버튼 개편**:
   - 하단 중앙의 "홈으로" 버튼을 제거하고, 상단 로고 클릭 시 홈 화면으로 이동하도록 연동.
   - 상단 바 좌측 상단에 "홈" 버튼(`btn-top-home`) 신규 배치 (상세 뷰어 화면에서 활성화).
   - 기존 좌측 상단에 위치하던 언어 선택기(KO, EN, JP, ZH-CN, ZH-TW)를 **우측 상단**으로 이동.
4. **새 로고 적용**:
   - 바탕화면 `logo` 폴더 내의 공식 SVG 파일(`JT_Logo_Wordmark.svg`, `JT_Logo_Wordmark_White.svg`)을 `public/logo/`에 탑재하여 기존 로고 교체.

---

## 2. 세부 구현 계획

### A. 로고 파일 배치 및 교체
- `logo/JT_Logo_Wordmark.svg` 및 `JT_Logo_Wordmark_White.svg` ➔ `public/logo/` 복사.
- `index.html` 내 로고 `img`의 `src`를 `./logo/JT_Logo_Wordmark.svg`로 교체.
- 로고 컨테이너(`.jt-logo`)에 `cursor: pointer;` 스타일을 부여하고 클릭 시 `navigateToHome()` 호출.

### B. 상단 헤더(`top-controller`) 재배치
- 구조:
  ```html
  <header class="top-controller">
      <!-- 좌측 상단: 홈 버튼 -->
      <div class="top-left-actions">
          <button id="btn-top-home" class="top-home-btn" title="홈으로 이동" type="button" style="display: none;">
              <span class="material-icons" style="font-size: 18px;">home</span>
              <span id="label-top-home">홈</span>
          </button>
      </div>

      <!-- 우측 상단: 언어 선택기 및 음성 안내(TTS) -->
      <div class="top-right-actions" style="display: flex; align-items: center; gap: 8px;">
          <div class="lang-switcher">
              <button id="btn-ko" class="lang-btn active">KO</button>
              <button id="btn-en" class="lang-btn">EN</button>
              <button id="btn-jp" class="lang-btn">JP</button>
              <button id="btn-ch" class="lang-btn">ZH-CN</button>
              <button id="btn-tw" class="lang-btn">ZH-TW</button>
          </div>
          <div class="barrier-free-actions">
              <button id="btn-tts" class="icon-btn" title="음성 안내(TTS)" style="display: none;">
                  <span class="material-icons">volume_up</span>
              </button>
          </div>
      </div>
  </header>
  ```
- CSS 스타일:
  - `.top-controller`: `display: flex; justify-content: space-between; align-items: center;` 유지.
  - `.top-home-btn`: 컴팩트하고 깔끔한 라운드 버튼 스타일링, 호버 및 다국어 지원.
  - 하단 고정 푸터(`.bottom-fixed`): `display: none !important;`로 숨김 처리하여 화면 공간 확보.

### C. 버튼 삭제 및 홈페이지 바로가기 버튼 추가
- 삭제:
  - `#buy-btn-wrapper` (제품 구매하기) DOM 요소 삭제.
  - `#quote-standalone-container` (제품 견적 의뢰) DOM 요소 삭제.
- 신규 추가:
  - 카탈로그 버튼 아래에 `#website-btn-wrapper` 추가:
    - 클래스: `catalog-link-card` 동일 적용.
    - 아이콘: `language` + `open_in_new`.
    - 라벨 ID: `label-hero-website-text` (기본 "홈페이지 바로가기").
    - 링크 ID: `btn-hero-website` (기본 `https://janytree.com/`).
- 다국어 매핑:
  - `uiLabels.websiteBtn`: `{ ko: "홈페이지 바로가기", en: "Official Website", jp: "公式サイトへ", ch: "官方网站", tw: "官方網站" }`
  - `uiLabels.topHomeBtn`: `{ ko: "홈", en: "Home", jp: "ホーム", ch: "首页", tw: "首頁" }`
  - `uiLabels.socialWebsiteUrl` 연동으로 언어별 맞춤 홈페이지 이동.

### D. 자바스크립트 네비게이션 연동
- 공통 함수 `navigateToHome()` 정의:
  - TTS 중단, URL 파라미터 리셋, 상세 뷰어 숨김, 홈 화면 표시, 스크롤 최상단 이동, 상단 홈 버튼 및 TTS 버튼 숨김.
- 이벤트 연결:
  - 상단 로고(`.jt-logo`), 신규 상단 홈 버튼(`#btn-top-home`) 클릭 시 `navigateToHome()` 실행.
  - 상세 뷰어 진입 시(`#btn-top-home`) 표시(`display: inline-flex`).

---

## 3. 검증 계획
1. `npm.cmd run build` 빌드 성공 확인.
2. PC 및 모바일 화면 캡쳐 검증:
   - 우측 상단 언어 선택기 및 좌측 상단 홈 버튼 위치 확인.
   - 새 로고 정상 표기 및 로고/홈버튼 클릭 시 홈 화면 이동 동작 확인.
   - 카탈로그 버튼 아래 "홈페이지 바로가기" 버튼 노출 및 제품구매하기/제품견적의뢰 버튼 완전 제거 확인.
