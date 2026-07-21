// =====================================================
// 인투메디 전자라벨 공용 스크립트 (script.js)
// =====================================================

// ▼ QR 코드 스캔 시 연결될 실제 인터넷 주소 (GitHub Pages)
// 스마트폰 카메라로 스캔했을 때 이 주소로 접속되어야 합니다.
const E_LABEL_BASE_URL = "https://pro2-gif.github.io/e-label/index.html";

// 구글 시트 ID
const SHEET_ID = "1dQOhtidzJfK3NXzzrzzPeAC10pv8wvbqnWRU-WjM3wQ";

// 식약처 화장품 성분 API 인증키
const MFDS_API_KEY = "8438e0c9c0276651df0610f950fb14f1e6b328ad92f388072a7fdf5dfed4c8b3";
const MFDS_API_URL = "https://apis.data.go.kr/1471000/CsmtcsIngdCpntInfoService01/getCsmtcsIngdCpntInfoService01";

// ▼ 구글 시트 헤더 검색용 키워드
// 시트의 열 순서가 바뀌거나 아직 추가되지 않더라도 오류 없이 데이터를 찾을 수 있게 해줍니다.
const COL_KW = {
    name:         ['제품명', '이름', 'product'],
    volume:       ['용량', '중량', 'volume'],
    functional:   ['기능성', '분류', 'functional'],
    batchno:      ['제조번호', '로트', 'batch'],
    expiration:   ['사용기한', '유통기한', 'expiration'],
    howToUse:     ['사용방법', '사용법', 'how'],
    manufacturer: ['제조업자', '책임판매', '제조', 'manufacturer'],
    ingredients:  ['전성분', '성분', 'ingredient'],
    cautions:     ['주의사항', '주의', 'caution'],
    customer:     ['소비자', '상담', '전화', 'customer'],
    buyUrl:       ['구매', '링크', 'url', 'buy']
};

// 앱 상태 변수
let currentLang = 'ko';
let productsData = [];
let qrInstance = null;

// 번역 캐시 (API 재호출 방지)
const translationCache = {};
// 식약처 성분 영문명 캐시
const ingredientEnCache = {};

// ▼ 영문 성분명 우선 매칭 사전 (Dictionary)
// 식약처 API보다 먼저 이 사전을 확인하여, 자주 사용되는 성분의 번역 오류를 방지합니다.
const ingredientDictionary = {
    "정제수": "Water",
    "펜틸렌글라이콜": "Pentylene Glycol",
    "부틸렌글라이콜": "Butylene Glycol",
    "1,2-헥산다이올": "1,2-Hexanediol"
};

// 다국어 UI 라벨
const uiLabels = {
    volume:       { ko: "용량",                   en: "Volume" },
    functional:   { ko: "기능성 분류",             en: "Functional Classification" },
    batchno:      { ko: "제조번호",               en: "Batch No." },      // 추가
    expiration:   { ko: "사용기한",               en: "Expiration Date" },// 추가
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

// 키워드 배열로 키(헤더) 찾기
function findKeyByKeywords(item, keywords) {
    const keys = Object.keys(item);
    for (const kw of keywords) {
        // 공백 제거 후 포함 여부 확인 (예: '사용 방법' 도 '사용방법'으로 찾음)
        const found = keys.find(k => k.replace(/\s+/g, '').includes(kw.replace(/\s+/g, '')));
        if (found) return found;
    }
    return null;
}

// 제품명 가져오기
function getProductDisplayName(item, lang) {
    const key = findKeyByKeywords(item, COL_KW.name);
    const rawName = key ? (item[key] || '') : '';
    const lines = rawName.split('\n').map(l => l.trim()).filter(l => l);

    if (lang === 'en') {
        const enLine = lines.find(line => !/[가-힣]/.test(line));
        if (enLine) return enLine;
    }
    return lines[0] || '';
}

// 키워드 기반으로 값 가져오기
function getColValue(item, keywords) {
    const key = findKeyByKeywords(item, keywords);
    return key ? (item[key] || '') : '';
}

// 제조업자 항목: 언어에 따라 한글 줄 or 영문 줄만 추출
function getManufacturerDisplay(item, lang) {
    const raw = getColValue(item, COL_KW.manufacturer);
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l);

    if (lang === 'ko') {
        const koLine = lines.find(l => /[가-힣]/.test(l));
        return koLine || lines[0] || raw;
    } else {
        const enLine = lines.find(l => !/[가-힣]/.test(l));
        return enLine || lines[lines.length - 1] || raw;
    }
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

        // ▼ 구매하기 버튼: 구글 시트의 구매링크 URL 사용
        document.getElementById('btn-buy').addEventListener('click', () => {
            let buyUrl = getColValue(target, COL_KW.buyUrl).trim();
            if (buyUrl) {
                // http로 시작하지 않는 주소(예: www.naver.com)가 입력된 경우 http:// 추가
                if (!buyUrl.startsWith('http')) {
                    buyUrl = 'http://' + buyUrl;
                }
                window.open(buyUrl, '_blank');
            } else {
                // 시트에 구매 링크가 비어있을 경우에만 기본 쇼핑몰로 이동
                window.open('https://intomedipro.com/', '_blank');
            }
        });

        // 돌아가기(홈) 버튼
        document.getElementById('btn-home').addEventListener('click', () => {
            window.location.href = window.location.pathname; // 쿼리 제거하고 새로고침
        });

        // TTS 버튼
        document.getElementById('btn-tts').addEventListener('click', () => {
            handleTts(target);
        });
    });
}

// =====================================================
// ■ 식약처 API: 한글 성분명 → 영문명 조회
//   1차: 직접 호출 시도 (일부 환경에서 CORS 없이 작동)
//   2차: allorigins.win 프록시
//   3차: corsproxy.io 프록시
//   최종 보완: Google Translate
// =====================================================
async function fetchWithTimeout(url, timeoutMs = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return res;
    } catch (e) {
        clearTimeout(timer);
        throw e;
    }
}

async function queryMfdsApi(korName) {
    const apiPath = `${MFDS_API_URL}?serviceKey=${MFDS_API_KEY}&IngdKorNm=${encodeURIComponent(korName)}&type=json&numOfRows=1`;

    // 시도할 URL 목록 (직접 호출 → 두 가지 프록시)
    const candidates = [
        apiPath,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(apiPath)}`,
        `https://corsproxy.io/?${encodeURIComponent(apiPath)}`
    ];

    for (const url of candidates) {
        try {
            const res  = await fetchWithTimeout(url, 5000);
            const data = await res.json();
            const engName = data?.body?.items?.[0]?.INGR_ENG_NAME;
            if (engName) return engName; // 성공 시 즉시 반환
        } catch (e) {
            // 해당 URL 실패 → 다음 URL 시도
        }
    }
    return null; // 모든 URL 실패
}

async function lookupIngredientEn(korName) {
    const trimmed = korName.trim();
    if (!trimmed) return trimmed;
    
    // 0차: 사전(Dictionary) 예외 처리 우선 확인
    if (ingredientDictionary[trimmed]) return ingredientDictionary[trimmed];
    
    if (ingredientEnCache[trimmed]) return ingredientEnCache[trimmed]; // 캐시 확인

    // 1차~3차: 식약처 API (공식 INCI 영문명)
    const official = await queryMfdsApi(trimmed);
    if (official) {
        ingredientEnCache[trimmed] = official;
        return official;
    }

    // 최종 보완: Google Translate (식약처 DB에 없는 성분 처리)
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
    document.getElementById('label-batchno').textContent     = uiLabels.batchno[lang]; // 추가
    document.getElementById('label-expiration').textContent  = uiLabels.expiration[lang]; // 추가
    document.getElementById('label-how-to-use').textContent  = uiLabels.howToUse[lang];
    document.getElementById('label-manufacturer').textContent = uiLabels.manufacturer[lang];
    document.getElementById('label-ingredients').textContent  = uiLabels.ingredients[lang];
    document.getElementById('label-cautions').textContent    = uiLabels.cautions[lang];
    document.getElementById('label-customer').textContent    = uiLabels.customer[lang];
    document.getElementById('btn-buy').textContent           = uiLabels.buyBtn[lang];

    // 원본 데이터 (언어별 처리)
    let productName  = getProductDisplayName(item, lang);
    let volume       = getColValue(item, COL_KW.volume);
    let functional   = getColValue(item, COL_KW.functional);
    let batchno      = getColValue(item, COL_KW.batchno); // 추가
    let expiration   = getColValue(item, COL_KW.expiration); // 추가
    // 제조업자: 언어별로 해당 줄만 추출 (번역 불필요)
    let manufacturer = getManufacturerDisplay(item, lang);
    let ingredients  = getColValue(item, COL_KW.ingredients);
    let cautions     = getColValue(item, COL_KW.cautions);
    let customer     = getColValue(item, COL_KW.customer);

    // ▼ 영어 모드: 각 항목 번역 수행
    if (lang === 'en') {
        // 제조업자는 이미 영문 추출 완료, 번역 불필요
        [volume, functional, batchno, expiration, cautions, customer] = await Promise.all([
            translateText(volume),
            translateText(functional),
            translateText(batchno), // 제조번호도 번역(영문/숫자 혼용 처리)
            translateText(expiration), // 사용기한도 번역
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
    document.getElementById('val-batchno').textContent     = batchno; // 추가
    document.getElementById('val-expiration').textContent  = expiration; // 추가
    document.getElementById('val-manufacturer').textContent = manufacturer;
    document.getElementById('val-ingredients').textContent  = ingredients;
    document.getElementById('val-cautions').textContent    = cautions;
    document.getElementById('val-customer').textContent    = customer;

    // 사용방법: 주의사항 경고 박스 분리 렌더링
    const warnKeywordKo  = "* 주의사항 :";
    const originalHowToUse = getColValue(item, COL_KW.howToUse);
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
        
        // QR 영역 클릭 시 즉시 해당 제품 뷰어로 이동 (화면 깜빡임 없이)
        document.getElementById('qr-to-viewer-btn').addEventListener('click', () => {
            const idx = parseInt(selectEl.value);
            const selectedItem = data[idx];
            if (!selectedItem) return;
            
            const name = getProductDisplayName(selectedItem, 'ko');
            // URL 파라미터를 추가하여 페이지 리로드 (공유하기 쉽도록 URL 업데이트)
            window.location.href = `?product=${encodeURIComponent(name)}`;
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
    const volume      = getColValue(item, COL_KW.volume);
    const functional  = getColValue(item, COL_KW.functional);
    const howToUse    = getColValue(item, COL_KW.howToUse).split('* 주의사항 :')[0].trim();
    const cautions    = getColValue(item, COL_KW.cautions);

    const text = `${productName}. ${uiLabels.volume[currentLang]}, ${volume}. ${uiLabels.functional[currentLang]}, ${functional}. ${uiLabels.howToUse[currentLang]}, ${howToUse}. ${uiLabels.cautions[currentLang]}, ${cautions}`;

    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = currentLang === 'ko' ? 'ko-KR' : 'en-US';
    utterance.rate   = 0.9;
    window.speechSynthesis.speak(utterance);
}
