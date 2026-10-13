-- 009_fill_remaining_tw_ingredients.sql
-- 누락된 마지막 2개 핵심 성분(알부틴, 피리독신에이치씨엘)의 중국어 번체(tw) 번역 데이터 업데이트

UPDATE public.ingredient_details
SET desc_tw = '有助於修護清透亮澤的膚色，打造明亮潔淨肌底的成分。平滑調理暗沉膚色，並透過豐盈的抗氧化護理保護肌膚抵禦外部刺激與壓力，有助於營造健康的肌膚環境。
(僅限原料特性)'
WHERE name_ko = '알부틴';

UPDATE public.ingredient_details
SET desc_tw = '一種水溶性維生素成分，有助於調節頭皮油水平衡，營造舒適的頭皮環境。為頭皮肌底提供豐盈營養，維持頭皮健康；淨澈調理多餘油脂與老廢角質，有助於打造潔淨清爽的頭皮環境。
(僅限原料特性)'
WHERE name_ko = '피리독신에이치씨엘';
