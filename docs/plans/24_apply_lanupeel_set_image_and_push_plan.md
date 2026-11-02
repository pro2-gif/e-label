# 계획서 24: 라뉴필 세트 이미지(lanupeel_set.png) 적용 및 클라우드 배포(Push)

## 1. 개요 및 목적
- 사용자가 바탕화면 프로젝트 루트에 직접 추가한 라뉴필 2종 세트 이미지(`lanupeel_set.png`)를 홈 화면의 라뉴필 제품 카드 대표 이미지로 연결.
- 상대 경로(`./lanupeel_set.png`) 이미지도 정상 렌더링되도록 URL 파싱 로직 확장.
- 변경 사항 검증 후 GitHub 원격 저장소(`master`)로 클라우드 배포(Git Push) 수행.

---

## 2. 세부 구현 내용
1. `index.html` 내 `renderProductGrid`:
   - 라뉴필(`CLX-LAP` / '라뉴필') 제품 카드의 대표 이미지를 `./lanupeel_set.png`로 지정.
   - 상대경로(`.` 또는 `/`로 시작하는 로컬/정적 에셋 경로)를 정상 이미지 URL로 처리하도록 조건 보강.
2. `index.html` 내 `updateComponentData`:
   - 상세 화면에서도 상대경로 이미지가 정상 렌더링되도록 허용 조건 보강.

---

## 3. 검증 및 배포
1. Puppeteer 브라우저를 통해 홈 화면 쇼룸 그리드에서 라뉴필(`CLX-LAP`) 카드의 `img.src`가 `lanupeel_set.png`로 정상 로드되는지 확인.
2. `lanupeel_set.png`, `index.html`, `docs/plans/24_*.md` 개별 파일 스테이징 후 커밋(`RULE 15`).
3. GitHub 원격 저장소로 `git push` 실행 (`RULE 10`).
