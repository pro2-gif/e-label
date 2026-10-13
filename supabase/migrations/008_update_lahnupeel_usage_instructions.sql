-- 008_update_lahnupeel_usage_instructions.sql
-- 인투메디 클리닉스 라뉴필 (CLX-LAP#1, CLX-LAP#2) 사용방법에 바이알 오픈 방법 및 주의사항 추가

-- 1. CLX-LAP#1 (필링 워시)
-- ko
UPDATE public.product_translations
SET usage_instructions = '세안 후, 적당량을 얼굴 전체에 펴 바르고 30~40초간 부드럽게 문지른 뒤 미온수로 깨끗이 씻어냅니다.

[바이알 오픈 방법]
바이알의 캡을 화살표 방향으로 힘을 주어 연 다음 테두리의 알루미늄을 제거 후 고무마개를 열어줍니다. 이후 드로퍼를 끼워 사용해 주세요. 
 * 주의사항 : 바이알 개봉 시 오픈 부분이 날카로울 수 있으니 사용에 주의하시기 바랍니다.'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#1') AND lang_code = 'ko';

-- en
UPDATE public.product_translations
SET usage_instructions = 'After cleansing, apply an appropriate amount evenly over the entire face, gently massage for 30–40 seconds, and rinse off thoroughly with lukewarm water.

[How to Open the Vial]
Push the cap of the vial in the direction of the arrow to open, remove the aluminum ring around the rim, and then remove the rubber stopper. Attach the dropper before use.
* Caution : Be careful when opening the vial, as the opened edge may be sharp.'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#1') AND lang_code = 'en';

-- jp
UPDATE public.product_translations
SET usage_instructions = '洗顔後、適量を顔全体にのばし、30〜40秒ほどやさしくマッサージするように馴染ませた後、ぬるま湯できれいに洗い流します。

【バイアルの開封方法】
バイアルのキャップを矢印の方向に力を入れて開けた後、縁のアルミニウムを取り除き、ゴム栓を開けます。その後、ドロッパーを装着してご使用ください。
 * 注意事項：バイアルの開封時、開口部分が鋭利になっている場合がありますので、ご使用の際はご注意ください。'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#1') AND lang_code = 'jp';

-- ch
UPDATE public.product_translations
SET usage_instructions = '洁面后，取适量均匀涂抹于整个面部，轻轻按摩30~40秒后，用温水彻底冲洗干净。

[安瓶开启方法]
顺着箭头方向用力推开安瓶顶盖，拆除边缘铝箔后拔出橡胶塞。随后套上滴管即可使用。
 * 注意事项：开启安瓶时切口可能较为锋利，使用时请注意安全。'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#1') AND lang_code = 'ch';

-- tw
UPDATE public.product_translations
SET usage_instructions = '潔面後，取適量均勻塗抹於全臉，輕柔按摩30~40秒後，以溫水徹底沖洗乾淨。

[安瓿瓶開啟方法]
順著箭頭方向用力推開安瓿瓶蓋，撕除邊緣鋁封後取下橡膠塞，隨後套上滴管即可使用。
 * 注意事項：開啟安瓿瓶時切口處可能較為鋒利，使用時請多加小心。'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#1') AND lang_code = 'tw';


-- 2. CLX-LAP#2 (앰플 부스터)
-- ko
UPDATE public.product_translations
SET usage_instructions = '필링 워시 사용 후, 적당량을 얼굴 전체에 도포하여 마사지하며 완전히 흡수시켜 줍니다. 이때 피부가 마르지 않도록 중간중간 내용을 덧발라가며 충분히 흡수시켜 주는 것이 좋습니다.

[바이알 오픈 방법]
바이알의 캡을 화살표 방향으로 힘을 주어 연 다음 테두리의 알루미늄을 제거 후 고무마개를 열어줍니다. 이후 드로퍼를 끼워 사용해 주세요. 
 * 주의사항 : 바이알 개봉 시 오픈 부분이 날카로울 수 있으니 사용에 주의하시기 바랍니다.'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#2') AND lang_code = 'ko';

-- en
UPDATE public.product_translations
SET usage_instructions = 'After using the peeling wash, apply an appropriate amount evenly over the entire face, massage gently, and let it stay until fully absorbed. It is recommended to reapply the product occasionally during the process to keep the skin from drying out, ensuring sufficient absorption.

[How to Open the Vial]
Push the cap of the vial in the direction of the arrow to open, remove the aluminum ring around the rim, and then remove the rubber stopper. Attach the dropper before use.
* Caution : Be careful when opening the vial, as the opened edge may be sharp.'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#2') AND lang_code = 'en';

-- jp
UPDATE public.product_translations
SET usage_instructions = 'ピーリングウォッシュの使用後、適量を顔全体に塗布し、マッサージしながら十分に馴染ませます。この際、肌が乾燥しないよう途中で重ね塗りしながらしっかりと吸収させることが推奨されます。

【バイアルの開封方法】
バイアルのキャップを矢印の方向に力を入れて開けた後、縁のアルミニウムを取り除き、ゴム栓を開けます。その後、ドロッパーを装着してご使用ください。
 * 注意事項：バイアルの開封時、開口部分が鋭利になっている場合がありますので、ご使用の際はご注意ください。'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#2') AND lang_code = 'jp';

-- ch
UPDATE public.product_translations
SET usage_instructions = '使用去角质洁面产品后，取适量涂抹于整个面部，轻轻按摩至完全吸收。在此过程中，建议适时重复涂抹以防止肌肤干燥，使其充分吸收。

[安瓶开启方法]
顺着箭头方向用力推开安瓶顶盖，拆除边缘铝箔后拔出橡胶塞。随后套上滴管即可使用。
 * 注意事项：开启安瓶时切口可能较为锋利，使用时请注意安全。'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#2') AND lang_code = 'ch';

-- tw
UPDATE public.product_translations
SET usage_instructions = '使用煥膚潔面露後，取適量均勻塗抹於全臉，輕柔按摩至完全吸收。建議過程中隨時補塗以避免肌膚乾燥，並幫助充分吸收。

[安瓿瓶開啟方法]
順著箭頭方向用力推開安瓿瓶蓋，撕除邊緣鋁封後取下橡膠塞，隨後套上滴管即可使用。
 * 注意事項：開啟安瓿瓶時切口處可能較為鋒利，使用時請多加小心。'
WHERE product_id IN (SELECT id FROM public.products WHERE product_code = 'CLX-LAP#2') AND lang_code = 'tw';
