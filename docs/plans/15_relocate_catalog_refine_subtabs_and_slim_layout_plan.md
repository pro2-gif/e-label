# 15. 카탈로그 버튼 위치 이동, 라뉴필 서브탭/제품명 정돈, 본문 폭 슬림화 및 영상 축소 계획서

## 1. 개요 및 사용자 요구사항
1. **카탈로그 버튼 위치 이동**:
   - 좌측 이미지 하단에 있던 [제품 카탈로그 보기] 버튼을 **제품명 아래 & [제품 견적 의뢰] 버튼 위**로 이동
2. **라뉴필 제품명 및 서브탭 정돈**:
   - 제품명 "인투메디 클리닉스 라뉴필" 문구를 가운데 정렬(`text-align: center`)
   - 서브탭 텍스트에서 불필요한 3단 줄바꿈(`<br>`)을 없애고, 부모 제품명을 제거하여 **[필링 워시]**, **[앰플 부스터]** 로 단락 없이 가로로 단정하게 나열
3. **본문 좌우 폭 슬림화**:
   - 840px도 여전히 넓어 가독성이 불편하므로, 최적의 읽기 규격인 **`660px`** 수준으로 축소하여 테이블 전성분/주의사항의 시각적 피로도 해소
4. **소개영상 미리보기 크기 축소**:
   - 화면을 가득 채우던 유튜브 소개영상 썸네일을 **`max-width: 320px`**의 콤팩트하고 아담한 규격으로 강제 고정

---

## 2. 세부 구현 계획

### 1) 상단 히어로 구조 및 카탈로그 버튼 재배치
- 구조:
  1. 제품 이미지 래퍼 (`#product-image-wrapper`, 단독)
  2. 제품명 (`#product-name`, 가운데 정렬)
  3. 서브탭 (`#sub-tabs-container`, 가로 나열, 가운데 정렬)
  4. 제품 카탈로그 보기 (`#catalog-btn-wrapper`, 가운데 정렬)
  5. 제품 견적 의뢰 (`#btn-hero-quote`, 가운데 정렬)

### 2) 라뉴필 서브탭 텍스트 처리 개선
- 서브탭 생성 시 기존의 강제 줄바꿈(`<br>`) 로직 제거:
  ```javascript
  // 부모 제품명이 포함되어 있으면 순수 구성품 명칭(필링 워시, 앰플 부스터 등)만 추출
  let cleanName = rawName;
  if (parentName && cleanName.includes(parentName)) {
      cleanName = cleanName.replace(parentName, '').trim();
  }
  // 추가적인 접두사 정리 (라뉴필, LAHNUPEEL 등)
  cleanName = cleanName.replace(/^라뉴필\s*/i, '').replace(/^LAHNUPEEL\s*/i, '').replace(/^ラヌピール\s*/i, '').replace(/^拉纽皮尔\s*/i, '').trim();
  if (!cleanName) cleanName = rawName;
  btn.textContent = cleanName;
  btn.style.whiteSpace = 'nowrap';
  ```
- 결과: **[ 필링 워시 ]**, **[ 앰플 부스터 ]** 처럼 단락(줄바꿈) 없이 단 한 줄로 깔끔하게 가로 나열!

### 3) 본문 폭 660px 슬림화
- `.main-content`: `max-width: 660px !important; margin: 0 auto;`
- 상단 히어로: 모바일 및 PC 모두에서 660px 단일 중심 캔버스로 정돈되어, 320px 제품 사진 아래에 제품명과 버튼들이 예쁘게 모여 프리미엄 감성 극대화

### 4) 소개영상 크기 축소 (320px)
- `.video-section`: `max-width: 320px; margin: 36px auto 0; text-align: center;`
- `.video-wrapper`: `width: 100%; max-width: 320px; aspect-ratio: 16 / 9; margin: 0 auto; border-radius: 14px; overflow: hidden;`
- 채널 링크 섹션: `max-width: 360px; margin: 20px auto 0;`

---

## 3. 검증 계획
1. Puppeteer로 라뉴필 화면(`?c=CLX-LAP`)에 접속하여:
   - "인투메디 클리닉스 라뉴필" 제품명 가운데 정렬 확인
   - 서브탭 텍스트가 [필링 워시], [앰플 부스터]로 한 줄 가로 나열되는지 확인
   - 카탈로그 버튼이 제품 견적의뢰 버튼 바로 위에 위치하는지 확인
   - 본문 폭(660px) 및 소개영상 크기(320px) 확인
2. 스크린샷 캡처 및 검증 후 보고
