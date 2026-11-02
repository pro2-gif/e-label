# Plan 32: 모바일 상세 표에서 빈 항목(-) 완전 숨김(display: none) 처리 계획서

## 1. 개요 및 원인 분석
- **사용자 요청 사항**:
  - "관리자페이지에서 - 표기된 항목은 pc에서는 보이지 않는데(2번째 캡쳐본) 모바일 버전에서는 빈칸으로 보여(3번째 캡쳐본). 모바일에서 확인할 때도 pc와 동일하게 - 표기된 항목은 아예 안보이게 해줘"
- **원인 분석**:
  - `index.html` 내 모바일 미디어 쿼리(`@media (max-width: 859px)`)에 `.info-table tr { display: table-row !important; }` 스타일이 지정되어 있음.
  - 이로 인해 자바스크립트에서 빈 값(-) 판정 후 인라인으로 `row.style.display = 'none'`을 주더라도, CSS의 `!important`에 밀려 모바일에서 행(`tr`)이 무조건 강제 노출되어 빈칸으로 보였음.

---

## 2. 작업 상세 내용
### 1) CSS 수정 (`index.html`)
- 모바일 미디어 쿼리(`@media (max-width: 859px)`)에 숨김 우선순위 규칙 추가:
  ```css
  .info-table tr.row-hidden,
  .info-table tr[style*="display: none"] {
      display: none !important;
  }
  ```

### 2) JavaScript 수정 (`index.html`)
- `updateRowDisplay`:
  - 빈 값/대시(`-`, `—`, `''`) 판정 시 `row.classList.add('row-hidden')` 및 `row.style.setProperty('display', 'none', 'important')` 적용.
  - 값이 있을 때는 `row.classList.remove('row-hidden')` 및 `row.style.removeProperty('display')`.
- `clinicalRow`, `conceptRow`, `rowHowToUse` 등 모든 동적 행 숨김 로직에도 동일하게 `row.classList.add('row-hidden')` 및 `setProperty('display', 'none', 'important')` 적용.

---

## 3. 검증 계획
1. Puppeteer 브라우저 테스트:
   - 모바일 뷰(375px)에서 '인투메디 클리닉스 라뉴필'(필링 워시) 상세 페이지 진입.
   - 기능성 분류 행(`#row-functional`)의 `computedStyle.display`가 `none`인지 확인.
   - 스크린샷 캡처하여 용량 다음 행으로 바로 '제조업자 및 책임판매업자'가 연결되는지 확인.
2. 커밋 및 클라우드 푸시.
