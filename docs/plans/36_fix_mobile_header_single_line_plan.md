# 계획서 36: 모바일 상단 네비게이션(홈 버튼, 언어 선택기) 1줄(한 단락) 컴팩트 정렬

## 1. 개요 및 배경
- **현상**: 모바일 화면(폭 375~390px)에서 상단 바의 요소들(홈 버튼, KO/EN/JP/ZH-CN/ZH-TW 언어 버튼, TTS 스피커 버튼)의 패딩과 글자 크기가 커서 가로 공간이 부족해짐.
- **문제점**:
  - `Home` ➔ `Ho` / `me`
  - `KO` ➔ `K` / `O`
  - `EN` ➔ `E` / `N`
  - `ZH-CN` ➔ `ZH-` / `CN`
  - 각 버튼 내부 텍스트가 2줄로 강제 줄바꿈(단락 나뉨)되어 가독성과 미관이 심각하게 저해됨.
- **목표**:
  - 모든 헤더 버튼에 `white-space: nowrap !important;`를 부여하여 줄바꿈을 원천 차단.
  - 모바일 환경(`max-width: 640px` 및 `max-width: 390px`)에 맞추어 상단 패딩, 버튼 크기, 폰트 크기를 컴팩트하게 조율하여 1줄(한 단락)로 미려하게 배치.

---

## 2. 변경 계획

### `index.html` 내 헤더 스타일 보강
1. **공통 속성**:
   - `.top-home-btn`: `white-space: nowrap; flex-shrink: 0;`
   - `.lang-btn`: `white-space: nowrap;`
2. **모바일 최적화 (`@media (max-width: 640px)`)**:
   - `.top-controller`: `padding: 10px 12px !important;` (좌우 여백 축소)
   - `.top-home-btn`: `padding: 4px 8px !important; font-size: 11px !important; gap: 3px !important;`
     - 홈 아이콘: `font-size: 16px !important;`
   - `.top-right-actions`: `gap: 5px !important;`
   - `.lang-switcher`: `padding: 2px !important; border-radius: 6px !important;`
   - `.lang-btn`: `padding: 4px 6px !important; font-size: 11px !important; letter-spacing: -0.02em !important;`
   - `.icon-btn` (TTS 버튼): `width: 30px !important; height: 30px !important;`
     - 볼륨 아이콘: `font-size: 17px !important;`
3. **초소형 화면 최적화 (`@media (max-width: 390px)`)**:
   - `.top-controller`: `padding: 8px 8px !important;`
   - `.top-home-btn`: `padding: 4px 6px !important; font-size: 11px !important;`
   - `.lang-btn`: `padding: 3px 5px !important; font-size: 10.5px !important;`

---

## 3. 검증 계획
1. `npm.cmd run build` 빌드 검증.
2. Puppeteer 모바일(375px) 화면 캡처:
   - 한국어 및 영문(`Home`, `KO`, `EN`, `JP`, `ZH-CN`, `ZH-TW`) 상태에서 글자 쪼개짐 없이 가로 1줄로 완벽히 정렬되는지 확인.
