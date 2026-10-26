-- 010_add_catalog_url_to_product_translations.sql
-- 제품 번역 테이블(product_translations)에 언어별 카탈로그 파일 링크(catalog_url) 컬럼 추가

ALTER TABLE public.product_translations 
ADD COLUMN IF NOT EXISTS catalog_url TEXT;

COMMENT ON COLUMN public.product_translations.catalog_url IS '언어별 제품 카탈로그 파일 URL (PDF 또는 이미지)';
