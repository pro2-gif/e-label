// =====================================================
// 인투메디 전자라벨 공용 스크립트 (script.js)
// =====================================================

// ▼ QR 코드 스캔 시 연결될 실제 인터넷 주소 (GitHub Pages)
const E_LABEL_BASE_URL = "https://pro2-gif.github.io/e-label/index.html";

// 구글 시트 ID
const SHEET_ID = "1dQOhtidzJfK3NXzzrzzPeAC10pv8wvbqnWRU-WjM3wQ";

// 식약처 화장품 성분 API 인증키
const MFDS_API_KEY = "8438e0c9c0276651df0610f950fb14f1e6b328ad92f388072a7fdf5dfed4c8b3";
const MFDS_API_URL = "https://apis.data.go.kr/1471000/CsmtcsIngdCpntInfoService01/getCsmtcsIngdCpntInfoService01";

// ▼ 새로운 구글 시트 컬럼 순서 (0-based)
// 0: 제품명 | 1: 용량 | 2: 기능성분류 | 3: 사용방법
// 4: 제조업자 | 5: 전성분 | 6: 주의사항 | 7: 소비자상담 | 8: 구매링크URL
const COL = {
    name:         0,
    volume:       1,
    functional:   2,
    howToUse:     3,
    manufacturer: 4,
    ingredients:  5,
    cautions:     6,
    customer:     7,
    buyUrl:       8
};

// 앱 상태 변수
let currentLang = 'ko';
let productsData = [];
let qrInstance = null;

// 번역 캐시 (API 재호출 방지)
const translationCache = {};
// 식약처 성분 영문명 캐시
const ingredientEnCache = {};

// 다국어 UI 라벨
const uiLabels = {
    volume:       { ko: "용량",                   en: "Volume" },
    functional:   { ko: "기능성 분류",             en: "Functional Classification" },
    howToUse:     { ko: "사용방법",               en: "How to Use" },
    manufacturer: { ko: "제조 및 책임판매업자",   en: "Manufacturer & Distributor" },
    ingredients:  { ko: "전성분",                 en: "Ingredients" },
    cautions:     { ko: "사용할 때의 주의사항",   en: "Cautions" },
    customer:     { ko: "소비자 상담",             en: "Customer Service" },
    buyBtn:       { ko: "구매하기",               en: "Buy Now" }
};

// =====================================================
// ■ 구글 시트 데이터 로딩 (JSONP 방식 - CORS 문제 없음)
// =====================================================
function loadSheetData(callback) {
    window._sheetCallback = function(json) {
        try {
            const rows = json.table.rows;
            if (!rows || rows.length < 2) throw new Error("데이터가 없습니다.");

            const headers = rows[0].c.map(cell => (cell && cell.v) ? String(cell.v).trim() : '');

            productsData = [];
            for (let i = 1; i < rows.length; i++) {
                const rowCells = rows[i].c;
                const item = {};
                for (let j = 0; j < headers.length; j++) {
                    item[headers[j]] = (rowCells && rowCells[j] && rowCells[j].v != null)
                        ? String(rowCells[j].v).trim()
                        : '';
                }
                // 제품명(첫 번째 열)이 비어있는 행은 건너뜀
                const firstColKey = headers[0];
                if (item[firstColKey]) {
                    productsData.push(item);
                }
            }

            callback(null, productsData);
        } catch (err) {
            callback(err, null);
        }
    };

    const script = document.createElement('script');
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:_sheetCallback`;
    script.onerror = () => callback(new Error("네트워크 연결 오류"), null);
    document.head.appendChild(script);
}

// 제품명 가져오기
// lang='ko' → 첫 번째 줄(한국어), lang='en' → 시트에 이미 있는 영문명 추출
function getProductDisplayName(item, lang) {
    const keys = Object.keys(item);
    const rawName = item[keys[COL.name]] || '';
    const lines = rawName.split('\n').map(l => l.trim()).filter(l => l);

    if (lang === 'en') {
        // 한글 문자가 없는 줄 = 영문명 (이미 시트에 입력된 공식 영문명 사용)
        const enLine = lines.find(line => !/[가-힣]/.test(line));
        if (enLine) return enLine;
    }
    // 기본값: 첫 번째 줄 (한국어)
    return lines[0] || '';
}

// 컬럼 인덱스로 값 가져오기
function getColValue(item, colIndex) {
    const keys = Object.keys(item);
    return keys[colIndex] ? (item[keys[colIndex]] || '') : '';
}

// =====================================================
// ■ 뷰어 모드 (index.html) - 소비자가 QR 스캔 시 보는 화면
// =====================================================
function initViewer() {
    const loadingEl = document.getElementById('loading-screen');
    const errorEl   = document.getElementById('error-screen');
    const mainEl    = document.getElementById('main-content');
    const footerEl  = document.getElementById('bottom-footer');

    const urlParams    = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');

    loadSheetData(function(err, data) {
        if (err || !data || data.length === 0) {
            loadingEl.style.display = 'none';
            document.getElementById('error-msg').textContent = '시트 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
            errorEl.style.display = 'flex';
            return;
        }

        // QR 파라미터로 제품 찾기 (이름 부분 포함 매칭)
        let targetIndex = 0;
        if (productParam) {
            const found = data.findIndex(item => {
                const name = getProductDisplayName(item).toLowerCase();
                return name.includes(productParam.toLowerCase());
            });
            if (found !== -1) targetIndex = found;
        }

        const target = data[targetIndex];

        loadingEl.style.display = 'none';
        mainEl.style.display = 'block';
        footerEl.style.display = 'flex';

        renderLabel(target, 'ko');

        // 언어 버튼
        document.getElementById('btn-ko').addEventListener('click', () => {
            if (currentLang === 'ko') return;
            currentLang = 'ko';
            document.getElementById('btn-ko').classList.add('active');
            document.getElementById('btn-en').classList.remove('active');
            renderLabel(target, 'ko');
        });
        document.getElementById('btn-en').addEventListener('click', () => {
            if (currentLang === 'en') return;
            currentLang = 'en';
            document.getElementById('btn-en').classList.add('active');
            document.getElementById('btn-ko').classList.remove('active');
            renderLabel(target, 'en');
        });

        // ▼ 구매하기 버튼: 구글 시트 8번째 열 (구매링크 URL) 사용
        document.getElementById('btn-buy').addEventListener('click', () => {
            const buyUrl = getColValue(target, COL.buyUrl);
            if (buyUrl && buyUrl.startsWith('http')) {
                window.open(buyUrl, '_blank');
            } else {
                window.open('https://intomedipro.com/', '_blank');
            }
        });

        // TTS 버튼
        document.getElementById('btn-tts').addEventListener('click', () => {
            handleTts(target);
        });
    });
}

// =====================================================
// ■ 식약처 API: 한글 성분명 → 영문명 조회
// =====================================================
async function lookupIngredientEn(korName) {
    const trimmed = korName.trim();
    if (!trimmed) return trimmed;
    if (ingredientEnCache[trimmed]) return ingredientEnCache[trimmed]; // 캐시 확인

    try {
        // CORS 우회: allorigins 프록시를 통해 식약처 API 호출
        const apiUrl = `${MFDS_API_URL}?serviceKey=${MFDS_API_KEY}&IngdKorNm=${encodeURIComponent(trimmed)}&type=json&numOfRows=1`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();

        const engName = data?.body?.items?.[0]?.INGR_ENG_NAME;
        if (engName) {
            ingredientEnCache[trimmed] = engName;
            return engName;
        }
    } catch (e) {
        // 조회 실패 시 Google Translate로 보완
    }

    // ▼ 식약처 DB에 없거나 API 실패 시 → Google Translate로 번역 (국문 그대로 반환 X)
    const translated = await translateText(trimmed);
    ingredientEnCache[trimmed] = translated;
    return translated;
}

// =====================================================
// ■ 전성분 목록 전체 영문 변환
//   1차: 식약처 API 조회
//   2차: 조회 실패 시 Google Translate 번역
// =====================================================
async function translateIngredients(korIngredients) {
    if (!korIngredients || korIngredients.trim() === '') return korIngredients;

    // 콤마 단위로 개별 성분 분리
    const parts = korIngredients.split(',').map(s => s.trim()).filter(s => s);

    // 모든 성분을 병렬로 동시에 조회 (속도 최적화)
    const enNames = await Promise.all(parts.map(kor => lookupIngredientEn(kor)));

    return enNames.join(', ');
}

// =====================================================
// ■ 일반 텍스트 자동 번역 (Google Translate 무료 API)
// =====================================================
async function translateText(text) {
    if (!text || text.trim() === '') return text;
    if (translationCache[text]) return translationCache[text];

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res  = await fetch(url);
        const data = await res.json();

        let translated = '';
        if (data && data[0]) {
            for (let i = 0; i < data[0].length; i++) {
                if (data[0][i][0]) translated += data[0][i][0];
            }
        }

        if (translated) {
            translationCache[text] = translated;
            return translated;
        }
        return text;
    } catch (e) {
        return text;
    }
}

// =====================================================
// ■ 라벨 데이터 화면 렌더링
// =====================================================
async function renderLabel(item, lang) {
    const loadingEl = document.getElementById('loading-screen');
    const mainEl    = document.getElementById('main-content');
    const footerEl  = document.getElementById('bottom-footer');

    // 영어 번역 중 로딩 화면 표시
    if (lang === 'en') {
        mainEl.style.display   = 'none';
        footerEl.style.display = 'none';
        loadingEl.style.display = 'flex';
        loadingEl.querySelector('p').textContent = 'Translating product info...';
    }

    // UI 라벨 (테이블 왼쪽 항목명) 업데이트
    document.getElementById('label-volume').textContent       = uiLabels.volume[lang];
    document.getElementById('label-functional').textContent  = uiLabels.functional[lang];
    document.getElementById('label-how-to-use').textContent  = uiLabels.howToUse[lang];
    document.getElementById('label-manufacturer').textContent = uiLabels.manufacturer[lang];
    document.getElementById('label-ingredients').textContent  = uiLabels.ingredients[lang];
    document.getElementById('label-cautions').textContent    = uiLabels.cautions[lang];
    document.getElementById('label-customer').textContent    = uiLabels.customer[lang];
    document.getElementById('btn-buy').textContent           = uiLabels.buyBtn[lang];

    // 원본 한국어 데이터
    let productName  = getProductDisplayName(item, lang); // lang에 따라 한/영 자동 선택
    let volume       = getColValue(item, COL.volume);
    let functional   = getColValue(item, COL.functional);
    let manufacturer = getColValue(item, COL.manufacturer);
    let ingredients  = getColValue(item, COL.ingredients);
    let cautions     = getColValue(item, COL.cautions);
    let customer     = getColValue(item, COL.customer);

    // ▼ 영어 모드: 각 항목 번역 수행
    if (lang === 'en') {
        // 제품명은 이미 lang으로 선택했으므로 번역 불필요, 나머지만 번역
        [volume, functional, manufacturer, cautions, customer] = await Promise.all([
            translateText(volume),
            translateText(functional),
            translateText(manufacturer),
            translateText(cautions),
            translateText(customer)
        ]);

        // 전성분은 식약처 API(INCI 영문명) 우선 조회 후 구글 번역으로 보완
        ingredients = await translateIngredients(ingredients);
    }

    // 제품명 표시 (EN이면 시트에서 직접 영문명 추출)
    document.getElementById('product-name').textContent = lang === 'en'
        ? getProductDisplayName(item, 'en')
        : getProductDisplayName(item, 'ko');

    // 데이터 값 채우기
    document.getElementById('val-volume').textContent       = volume;
    document.getElementById('val-functional').textContent  = functional;
    document.getElementById('val-manufacturer').textContent = manufacturer;
    document.getElementById('val-ingredients').textContent  = ingredients;
    document.getElementById('val-cautions').textContent    = cautions;
    document.getElementById('val-customer').textContent    = customer;

    // 사용방법: 주의사항 경고 박스 분리 렌더링
    const warnKeywordKo  = "* 주의사항 :";
    const originalHowToUse = getColValue(item, COL.howToUse);
    const valHowToUseEl  = document.getElementById('val-how-to-use');
    valHowToUseEl.innerHTML = '';

    if (originalHowToUse.includes(warnKeywordKo)) {
        const parts = originalHowToUse.split(warnKeywordKo);
        const mainDiv = document.createElement('div');
        mainDiv.style.whiteSpace = 'pre-line';

        const warnDiv = document.createElement('div');
        warnDiv.className = 'warning-box';

        if (lang === 'en') {
            mainDiv.textContent = await translateText(parts[0].trim());
            warnDiv.innerHTML = `<span class="material-icons" style="font-size:18px;margin-top:2px;">warning</span><span>* Precautions: ${await translateText(parts[1].trim())}</span>`;
        } else {
            mainDiv.textContent = parts[0].trim();
            warnDiv.innerHTML = `<span class="material-icons" style="font-size:18px;margin-top:2px;">warning</span><span>* 주의사항 : ${parts[1].trim()}</span>`;
        }
        valHowToUseEl.appendChild(mainDiv);
        valHowToUseEl.appendChild(warnDiv);
    } else {
        valHowToUseEl.style.whiteSpace = 'pre-line';
        valHowToUseEl.textContent = lang === 'en' ? await translateText(originalHowToUse) : originalHowToUse;
    }

    // 번역 완료 후 화면 다시 표시
    if (lang === 'en') {
        loadingEl.style.display = 'none';
        mainEl.style.display   = 'block';
        footerEl.style.display = 'flex';
    }
}

// =====================================================
// ■ QR 메이커 모드 (qr_maker.html) - 관리자용
// =====================================================
function initQrMaker() {
    const selectEl     = document.getElementById('product-select-maker');
    const downloadBtn  = document.getElementById('btn-download');

    qrInstance = new QRious({
        element: document.getElementById('qr-canvas'),
        size: 260,
        level: 'H',
        value: E_LABEL_BASE_URL
    });

    loadSheetData(function(err, data) {
        if (err || !data || data.length === 0) {
            selectEl.innerHTML = '<option value="">데이터 로딩 실패 - 인터넷 연결 확인</option>';
            return;
        }

        selectEl.innerHTML = '';
        data.forEach((item, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = getProductDisplayName(item, 'ko');
            selectEl.appendChild(option);
        });

        updateQrDisplay(data[0]);

        selectEl.addEventListener('change', () => {
            const idx = parseInt(selectEl.value);
            updateQrDisplay(data[idx]);
        });
    });

    // QR 이미지 다운로드 (제품명 포함 합성)
    downloadBtn.addEventListener('click', () => {
        const productName = selectEl.options[selectEl.selectedIndex]?.textContent || '제품';
        const qrCanvas    = document.getElementById('qr-canvas');

        const compositeCanvas = document.createElement('canvas');
        const ctx      = compositeCanvas.getContext('2d');
        const padding  = 30;
        const textHeight = 50;
        compositeCanvas.width  = qrCanvas.width + padding * 2;
        compositeCanvas.height = qrCanvas.height + padding * 2 + textHeight;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

        ctx.fillStyle    = '#111827';
        ctx.font         = 'bold 20px Pretendard, sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(productName, compositeCanvas.width / 2, padding + textHeight / 2);
        ctx.drawImage(qrCanvas, padding, padding + textHeight);

        const link = document.createElement('a');
        const safeName = productName.replace(/[/\\?%*:|"<>]/g, '_');
        link.download = `${safeName}_QR코드.png`;
        link.href = compositeCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// QR 코드 화면 업데이트
function updateQrDisplay(item) {
    const titleDisplay = document.getElementById('qr-product-title-display');
    const urlPreview   = document.getElementById('qr-url-preview');
    const name         = getProductDisplayName(item, 'ko');
    const qrUrl        = `${E_LABEL_BASE_URL}?product=${encodeURIComponent(name)}`;

    titleDisplay.textContent = name;
    urlPreview.textContent   = qrUrl;
    qrInstance.value         = qrUrl;
}

// =====================================================
// ■ TTS (음성 안내) 처리
// =====================================================
function handleTts(item) {
    if (!window.speechSynthesis) {
        alert('이 브라우저는 음성 안내를 지원하지 않습니다.');
        return;
    }
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        return;
    }

    const productName = getProductDisplayName(item, 'ko');
    const volume      = getColValue(item, COL.volume);
    const functional  = getColValue(item, COL.functional);
    const howToUse    = getColValue(item, COL.howToUse).split('* 주의사항 :')[0].trim();
    const cautions    = getColValue(item, COL.cautions);

    const text = `${productName}. ${uiLabels.volume[currentLang]}, ${volume}. ${uiLabels.functional[currentLang]}, ${functional}. ${uiLabels.howToUse[currentLang]}, ${howToUse}. ${uiLabels.cautions[currentLang]}, ${cautions}`;

    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = currentLang === 'ko' ? 'ko-KR' : 'en-US';
    utterance.rate   = 0.9;
    window.speechSynthesis.speak(utterance);
}
