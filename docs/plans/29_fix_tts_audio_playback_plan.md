# Plan 29: 스피커 음성지원(TTS) 기능 복구 및 크로스 브라우저 호환성 강화 계획서

## 1. 개요 및 목적
- **사용자 요청 사항**:
  - "스피커 아이콘을 클릭했을 때 음성지원이 전혀 되고 있지 않아."
- **현상 및 원인 분석**:
  1. **헤더 전체 스피커 버튼 이벤트 리스너 미등록**:
     - `index.html` 하단의 `document.addEventListener('DOMContentLoaded', ...)` 블록이 스크립트 실행 시점과 맞지 않아 이벤트 리스너 바인딩이 누락됨.
     - 또한 `window.currentTargetItem`이 비어 있는 경우 클릭 이벤트가 완전히 무시됨.
  2. **`cancel()` 직후 `speak()` 호출 시 오디오 취소/침묵 버그**:
     - `window.speechSynthesis.cancel()` 비동기 명령 직후 즉시 `speak()`를 호출하여, 새로 요청한 발화가 취소 처리되는 브라우저 레이스 컨디션 발생.
  3. **대만 번체(`tw`) 언어 코드 매핑 오류**:
     - `currentLang === 'tw'`일 때 `zh-TW`가 아닌 `en-US`로 잘못 지정되어 있었음.
  4. **모바일 브라우저 오디오 큐 락**:
     - `paused` 상태 해제(`resume()`) 및 `speak()` 전 딜레이 부족.

---

## 2. 작업 상세 내용
### 1) 이벤트 리스너 즉시 바인딩 개선
- `DOMContentLoaded`에만 의존하지 않고, 즉시 실행 및 `document.readyState !== 'loading'` 체크로 헤더 스피커 버튼(`#btn-tts`)에 클릭 이벤트를 확실히 바인딩.
- `window.currentTargetItem`이 없더라도 화면에 렌더링된 DOM 텍스트를 읽어서 즉시 발화할 수 있는 안전한 fallback 로직 적용.

### 2) `playItemTts` (테이블 항목별 스피커) 개선
- `cancel()` 호출 후 `setTimeout(..., 60)` 딜레이를 주어 브라우저 음성 엔진 취소 경쟁 방지.
- 언어 매핑 수정: `ko` ➔ `ko-KR`, `en` ➔ `en-US`, `jp` ➔ `ja-JP`, `ch` ➔ `zh-CN`, `tw` ➔ `zh-TW`.
- 발화 시작 전 `speechSynthesis.resume()` 호출로 모바일/데스크톱 락 해제.

### 3) `handleTts` (상단 헤더 전체 듣기 스피커) 개선
- 텍스트 청크 분할 및 재생 콜백 체인 안정화.
- 재생/일시정지 토글 동작 정상화.
- 재생 중 헤더 스피커 아이콘 스타일 피드백(`playing` 클래스) 연동.

---

## 3. 검증 계획
1. Puppeteer 브라우저 테스트:
   - 테이블의 항목별 스피커 버튼 클릭 시 실제 `SpeechSynthesis.speak()` 발화 이벤트가 성공적으로 트리거되는지 검증.
   - 상단 헤더의 전체 TTS 버튼 클릭 시 `window.ttsChunks` 생성 및 발화가 정상 시작되는지 검증.
2. 빌드 및 테스트 통과 확인 후 Git 커밋 & 푸시.
