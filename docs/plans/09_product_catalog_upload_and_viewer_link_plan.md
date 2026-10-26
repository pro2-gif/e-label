# 제품 카탈로그 다국어 등록 및 뷰어 연동 구현 계획서

## 1. 개요
* **목적**: 제품별 다국어(한국어, 영어, 일본어, 중국어 간체, 중국어 번체) 카탈로그(PDF 또는 이미지)를 관리자 화면에서 업로드하고, 고객 뷰어 화면에서 원클릭으로 열람할 수 있도록 지원.
* **관련 화면**:
  1. **관리자 모드 (`admin.html`)**: 제품 수정 모달에 카탈로그 업로드 탭 및 언어별 파일 업로더 추가.
  2. **고객 뷰어 화면 (`index.html`)**: 현재 선택된 언어에 맞는 카탈로그 열람 링크/버튼 노출.
  3. **데이터베이스 (`Supabase`)**: `product_translations` 테이블에 `catalog_url` 컬럼 추가.

---

## 2. 세부 구현 계획

### 1단계: Supabase 데이터베이스 및 스토리지 준비
* **DB 컬럼 추가**:
  * 마이그레이션 파일: `supabase/migrations/010_add_catalog_url_to_product_translations.sql`
  * 쿼리:
    ```sql
    ALTER TABLE public.product_translations 
    ADD COLUMN IF NOT EXISTS catalog_url TEXT;
    ```
* **파일 스토리지 (Supabase Storage)**:
  * 기존 공용 버킷 `product-images`를 그대로 활용하여 PDF 및 이미지 카탈로그 파일을 안전하게 업로드 및 공개 URL 발급.

---

### 2단계: 관리자 화면 (`admin.html`) 수정
* **제품 수정/추가 모달 UI 확장**:
  * 탭 목록에 `[ 📖 카탈로그 ]` 탭을 추가:
    * `[ 국문 | 영문 | 일본어 | 중국어(간체) | 중국어(번체) | 📖 카탈로그 ]`
  * 카탈로그 탭 내용:
    * 5개 언어(국문, 영문, 일본어, 중국어 간체, 중국어 번체)별로 독립된 파일 업로드 상자 제공.
    * 파일 첨부 시 `Supabase Storage`에 자동 업로드되고, 파일명과 함께 [열람 ↗] 미리보기 및 [삭제] 기능 지원.
    * 허용 확장자: PDF, 이미지(PNG, JPG, WEBP).
* **데이터 바인딩 및 저장 로직**:
  * `formData.translations[l].catalog_url` 연동.
  * 기존 `saveProduct()`가 `product_translations`에 언어별 데이터를 일괄 upsert하므로 자동으로 DB에 반영됨.

---

### 3단계: 고객 뷰어 화면 (`index.html`) 수정
* **카탈로그 바로가기 버튼 UI 구성**:
  * 위치 후보:
    * **옵션 1 (추천 - 상단)**: 제품 대표 이미지 카드 바로 아래, 또는 세트 탭 아래에 깔끔한 카드형 링크 버튼 배치.
    * **옵션 2 (하단)**: 제품 정보 테이블 바로 아래 (브랜드 링크 섹션 위).
  * 디자인 (JT 디자인 시스템 준수):
    * 둥근 모서리(`border-radius: 12px`), 브랜드 강조색(`--color-accent` or `--color-primary`), 책/문서 아이콘(`menu_book` 또는 `picture_as_pdf`) 및 외부 링크 아이콘(`open_in_new`).
  * 다국어 라벨 매핑:
    * `ko`: `제품 카탈로그 보기 (PDF)`
    * `en`: `View Product Catalog`
    * `jp`: `製品カタログを見る`
    * `ch`: `查看产品目录`
    * `tw`: `查看產品目錄`
* **동작 로직**:
  * 현재 선택된 언어(`currentLang`)의 카탈로그 URL이 존재하면 버튼 노출, 없으면 영문/국문 우선 대체 혹은 버튼 숨김 처리.
  * 버튼 클릭 시 새 창(`_blank`)으로 PDF/이미지 카탈로그가 즉시 열림.

---

## 3. 안전성 검증 및 배포 절차
1. Supabase SQL 에디터에서 컬럼 추가 쿼리 실행.
2. `admin.html` 로컬 테스트 (파일 업로드, 삭제, 저장 확인).
3. `index.html` 로컬 테스트 (언어 전환 시 카탈로그 링크 동적 변경 및 클릭 열람 확인).
4. 수인의 최종 확인 후 깃 커밋 및 푸시.
