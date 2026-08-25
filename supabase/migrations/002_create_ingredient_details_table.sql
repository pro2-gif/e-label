-- 성분 상세 정보(구글 시트2) 저장을 위한 테이블 생성
CREATE TABLE IF NOT EXISTS public.ingredient_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ko TEXT NOT NULL,                     -- 성분명 (예: 덱스판테놀)
    desc_ko TEXT,                              -- 국문 효능 설명
    desc_en TEXT,                              -- 영어 번역본
    desc_jp TEXT,                              -- 일본어 번역본
    desc_ch TEXT,                              -- 중국어 번역본
    category TEXT DEFAULT '일반',               -- 구분 (예: '일반', '헤어' 등)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 성분명과 카테고리의 조합은 중복되지 않도록 고유(Unique) 제약 조건 설정
-- (예: '카퍼트라이펩타이드-1' + '일반', '카퍼트라이펩타이드-1' + '헤어'는 각각 1개씩만 존재 가능)
ALTER TABLE public.ingredient_details ADD CONSTRAINT ingredient_details_name_ko_category_key UNIQUE (name_ko, category);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.ingredient_details ENABLE ROW LEVEL SECURITY;

-- 모든 사용자(웹사이트 방문객)가 데이터를 읽을 수 있도록 허용 (SELECT 권한)
CREATE POLICY "Allow public read access on ingredient_details"
ON public.ingredient_details FOR SELECT
TO public
USING (true);

-- 데이터가 수정(UPDATE)될 때마다 updated_at 시간을 자동으로 갱신하는 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 부착
CREATE TRIGGER update_ingredient_details_updated_at
    BEFORE UPDATE ON public.ingredient_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 테이블과 컬럼에 대한 코멘트 (설명) 추가
COMMENT ON TABLE public.ingredient_details IS '핵심 컨셉 성분의 다국어 설명 및 효능 데이터 (구글 시트2 대체용)';
COMMENT ON COLUMN public.ingredient_details.name_ko IS '성분명 (국문 원본)';
COMMENT ON COLUMN public.ingredient_details.category IS '카테고리 (일반, 헤어 등)';
