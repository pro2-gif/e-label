// =====================================================
// 인투메디 전자라벨 공용 스크립트 (script.js)
// =====================================================

// ▼ QR 코드 스캔 시 연결될 실제 인터넷 주소 (Vercel)
// 스마트폰 카메라로 스캔했을 때 이 주소로 접속되어야 합니다.
const E_LABEL_BASE_URL = "https://e-label-lyart.vercel.app/";

// 구글 시트 ID (새로 제공해주신 ID 적용)
const SHEET_ID = "1202j3dJ_p-6_424X9v";

// 식약처 화장품 성분 API 인증키
const MFDS_API_KEY = "8438e0c9c0276651df0610f950fb14f1e6b328ad92f388072a7fdf5dfed4c8b3";
const MFDS_API_URL = "https://apis.data.go.kr/1471000/CsmtcsIngdCpntInfoService01/getCsmtcsIngdCpntInfoService01";

let COL = {
    name: 0,
    volume: 1,
    functional: 2,
    batchno: 3,
    expiration: 4,
    manufacturer: 5,
    conceptKo: 6,
    conceptEn: 7,
    clinical: 8,
    ingredientsKo: 9,
    ingredientsEn: 10,
    howToUse: 11,
    cautions: 12,
    customer: 13,
    buyUrl: 14
};

// 동적으로 헤더 행을 읽어 COL 인덱스를 업데이트하는 함수
function initColumns(headerRow) {
    if (!headerRow || headerRow.length < 5) return;
    
    const headers = headerRow.map(h => (h || '').replace(/\s+/g, '').toLowerCase());
    headers.forEach((h, idx) => {
        if (h.includes('제품명')) COL.name = idx;
        else if (h.includes('용량')) COL.volume = idx;
        else if (h.includes('기능성분류')) COL.functional = idx;
        else if (h.includes('제조번호')) COL.batchno = idx;
        else if (h.includes('사용기한')) COL.expiration = idx;
        else if (h.includes('제조업자') || h.includes('책임판매업자')) COL.manufacturer = idx;
        else if (h.includes('핵심컨셉성분(국문)')) COL.conceptKo = idx;
        else if (h.includes('핵심컨셉성분(영문)')) COL.conceptEn = idx;
        else if (h.includes('인체적용시험결과') || h.includes('인증')) COL.clinical = idx;
        else if (h.includes('전성분(국문)')) COL.ingredientsKo = idx;
        else if (h.includes('전성분(영문)')) COL.ingredientsEn = idx;
        else if (h.includes('사용방법')) COL.howToUse = idx;
        else if (h.includes('주의사항')) COL.cautions = idx;
        else if (h.includes('소비자상담')) COL.customer = idx;
        else if (h.includes('구매하기')) COL.buyUrl = idx;
    });
}

// 앱 상태 변수
let currentLang = 'ko';
let productsData = [];
let currentQrUrl = '';

// 번역 캐시 (API 재호출 방지)
const translationCache = {};
// 식약처 성분 영문명 캐시
const ingredientEnCache = {};

// =====================================================
// ■ 핵심 컨셉 성분 사전 (Fallback)
// =====================================================
const conceptFallbackDesc = {
    "나이아신아마이드": "#미백기능성 #피부톤개선\n식약처 고시 미백 성분으로, 칙칙한 피부를 맑고 화사하게 가꾸며 피지 조절에 도움을 줍니다.",
    "아데노신": "#주름개선기능성 #탄력강화\n식약처 고시 주름개선 성분으로, 피부의 콜라겐 합성을 촉진하여 주름을 완화하고 탄력을 부여합니다.",
    "히알루론산": "#수분공급 #피부장벽강화\n강력한 수분 끌어당김 효과로 피부를 촉촉하게 유지합니다.",
    "소듐하이알루로네이트": "#수분보호막 #보습유지\n자기 무게의 1000배 수분을 끌어당겨 피부 표면에 탄탄한 수분 보습막을 형성합니다.",
    "하이드롤라이즈드하이알루로닉애씨드": "#속건조개선 #깊은보습\n입자가 작은 저분자 히알루론산으로, 피부 깊숙이 스며들어 속건조를 빠르게 해결해 줍니다.",
    "소듐하이알루로네이트크로스폴리머": "#수분잠금 #고보습\n촘촘하게 교차 결합된 수분망을 형성하여 오랜 시간 수분이 날아가지 않게 잠가줍니다.",
    "덱스판테놀": "#피부진정 #장벽강화\n피부에 흡수되어 비타민B5로 변환되며, 손상된 피부 장벽을 튼튼하게 회복하고 진정시킵니다.",
    "판테놀": "#보습진정 #장벽회복\n피부에 수분을 공급하고 자극받은 피부를 편안하게 진정시킵니다.",
    "병풀추출물": "#피부진정 #시카케어\n자극받은 피부를 편안하게 진정시키고 피부 장벽을 강화합니다.",
    "세라마이드": "#보습유지 #피부보호\n피부 장벽을 튼튼하게 하여 수분 증발을 막아줍니다.",
    "시어버터": "#강력보습 #영양공급\n건조한 피부에 깊은 영양과 보습을 제공합니다.",
    "알부틴": "#미백기능성 #색소침착개선\n식약처 고시 미백 성분으로, 멜라닌 생성을 억제하여 기미와 주근깨 완화에 도움을 줍니다.",
    "글루타티온": "#항산화 #브라이트닝\n일명 '백옥주사' 성분으로 불리며, 강력한 항산화 작용으로 피부를 생기있게 밝혀줍니다.",
    "트라넥사믹애씨드": "#기미케어 #피부톤개선\n멜라닌 색소의 확장을 막아 기미와 색소침착을 효과적으로 케어해 줍니다.",
    "시스테인": "#항산화 #멜라닌억제\n피부 산화를 방지하고 멜라닌 생성을 억제하여 맑은 피부로 가꾸어 줍니다.",
    "소듐디엔에이": "#조직재생 #탄력회복\n연어에서 추출한 PDRN 성분으로, 무너진 피부 조직의 재생을 돕고 탄력을 근본적으로 회복시킵니다.",
    "카퍼트라이펩타이드-1": "#피부재생 #탄력부여\n손상된 피부의 재생을 돕고 콜라겐과 엘라스틴 생성을 촉진하여 탄력을 높여줍니다.",
    "아세틸헥사펩타이드-8": "#바르는보톡스 #주름완화\n일명 '바르는 보톡스'로 불리며, 표정 주름을 완화하고 피부 탄력을 증가시킵니다.",
    "에스에이치-올리고펩타이드-1": "#EGF #피부장벽강화\n표피세포 성장인자(EGF)로, 피부 재생 주기를 앞당겨 건강한 피부 장벽을 만들어줍니다.",
    "에스에이치-폴리펩타이드-3": "#KGF #턴오버촉진\n각질세포 성장인자(KGF)로, 피부 표면의 턴오버를 촉진하여 매끄러운 결을 만들어줍니다.",
    "에스에이치-올리고펩타이드-2": "#IGF-1 #세포활력\n인슐린유사 성장인자로, 피부 세포의 성장을 촉진하고 탄력을 강화합니다.",
    "에스에이치-폴리펩타이드-11": "#aFGF #콜라겐합성\n산성 섬유아세포 성장인자로, 콜라겐과 엘라스틴 합성을 촉진합니다.",
    "에스에이치-폴리펩타이드-16": "#VEGF #영양공급\n혈관 내피 성장인자로, 피부 깊은 곳까지 원활하게 영양을 공급하도록 돕습니다.",
    "에스에이치-폴리펩타이드-4": "#SCF #피부활력\n줄기세포 인자로, 피부 본연의 활력을 되찾아 줍니다.",
    "에스에이치-올리고펩타이드-33": "#피부재생 #탄력유지\n미세한 피부 손상을 케어하고 탄력 있는 피부로 가꾸어 줍니다.",
    "에스에이치-폴리펩타이드-9": "#VEGF #생기부여\n피부에 영양을 공급하여 생기 있고 건강한 피부로 유지시켜 줍니다.",
    "에스에이치-폴리펩타이드-64": "#장벽강화 #수분유지\n피부 장벽을 탄탄하게 가꾸어 수분 손실을 막아줍니다.",
    "에스에이치-폴리펩타이드-60": "#피부보호 #진정케어\n외부 자극으로부터 피부를 보호하고 편안하게 진정시킵니다.",
    "에스에이치-폴리펩타이드-7": "#hGH #턴오버주기개선\n피부 본연의 턴오버 주기를 정상화하여 탄력 넘치는 피부로 가꾸어 줍니다.",
    "에스에이치-폴리펩타이드": "#피부재생 #탄력부여\n피부 본연의 힘을 길러주고 탄탄하게 가꿔줍니다.",
    "락토바실러스/하이드롤라이즈드완두콩추출발효여과물": "#독자특허성분 #발효공법\n발효 공법을 통해 저분자화한 제니트리만의 독자 특허 성분입니다."
};

// 모달 제어 함수 (위키피디아 API로 실시간 성분 정보 제공)
window.openIngredientModal = async function(koName, enName) {
    const modalEl = document.getElementById('ingredient-modal');
    const nameEl  = document.getElementById('modal-ing-name');
    const descEl  = document.getElementById('modal-ing-desc');

    const displayName = (currentLang === 'en' && enName) ? enName : koName;
    nameEl.textContent = displayName;
    descEl.innerHTML   = '<span style="color:#9ca3af;">정보를 불러오는 중입니다...</span>';
    modalEl.classList.add('show');

    // 1단계: Fallback 사전 즉시 표시
    const fallback = conceptFallbackDesc[koName];
    if (fallback) {
        let fb = fallback;
        if (currentLang === 'en') {
            // 영문 모드일 경우: 구글 번역 API로 한글 문구를 통째로 번역
            descEl.innerHTML = '<span style="color:#9ca3af;">Translating...</span>';
            const translatedFb = await translateText(fb);
            descEl.textContent = translatedFb;
        } else {
            descEl.textContent = fb;
        }
        return; // Fallback(화장품 전용 사전) 정보가 있으면 여기서 즉시 종료하여 위키피디아 의학 정보가 덮어쓰지 못하게 함
    }

    // 2단계: 위키피디아 API에서 실제 정보 가져오기 (비동기)
    try {
        let summary = null;

        // 한국어 위키피디아에서 먼저 시도
        const koRes = await fetch(
            `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(koName)}`,
            { signal: AbortSignal.timeout(4000) }
        ).catch(() => null);

        if (koRes && koRes.ok) {
            const koData = await koRes.json();
            if (koData.type !== 'disambiguation' && koData.extract) {
                summary = koData.extract.substring(0, 300);
            }
        }

        // 한국어 실패 시 영어 위키피디아 재시도
        if (!summary && enName) {
            const enRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(enName)}`,
                { signal: AbortSignal.timeout(4000) }
            ).catch(() => null);

            if (enRes && enRes.ok) {
                const enData = await enRes.json();
                if (enData.type !== 'disambiguation' && enData.extract) {
                    summary = enData.extract.substring(0, 300);
                }
            }
        }

        if (summary) {
            descEl.textContent = summary;
        } else if (!fallback) {
            descEl.textContent = enName
                ? 'No detailed information found.'
                : '성분 상세 정보를 찾을 수 없습니다.';
        }
    } catch (e) {
        if (!fallback) descEl.textContent = '성분 정보를 불러오는 중 오류가 발생했습니다.';
    }
};
window.closeIngredientModal = function(event) {
    if (event && event.target.id !== 'ingredient-modal') return;
    document.getElementById('ingredient-modal').classList.remove('show');
}

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
    volume: { ko: "용량", en: "Volume" },
    functional: { ko: "기능성 분류", en: "Functional Classification" },
    batchno: { ko: "제조번호", en: "Batch No." },      // 추가
    expiration: { ko: "사용기한", en: "Expiration Date" },// 추가
    howToUse: { ko: "사용방법", en: "How to use" },
    manufacturer: { ko: "제조업자 및 책임판매업자 / 주소", en: "Manufacturer / Address" },
    ingredients: { ko: "전성분", en: "Ingredients" },
    cautions: { ko: "사용할 때의 주의사항", en: "Cautions" },
    customer: { ko: "소비자 상담", en: "Customer Service" },
    buyBtn: { ko: "구매하기", en: "Buy Now" },
    homeBtn: { ko: "돌아가기", en: "Go Back" },
    clinicalTitle: { ko: "인체적용시험 결과", en: "Clinical Test Results" },
    clinicalClose: { ko: "닫기", en: "Close" },
    videoTitle: { ko: "🎬 제니트리 소개 영상", en: "🎬 Janytree Introduction Video" },
    watchYoutube: { ko: "YouTube에서 동영상 보기", en: "Watch video on YouTube" },
    concept: { 
        ko: "핵심 컨셉 성분<br><span style=\"font-size:11px; font-weight:normal; color:#6b7280;\">터치하여 특징 보기</span>", 
        en: "Key Ingredients<br><span style=\"font-size:11px; font-weight:normal; color:#6b7280;\">Click for details</span>" 
    },
    socialWebsite: { ko: "홈페이지", en: "Website" },
    socialYoutube: { ko: "유튜브", en: "YouTube" },
    socialInstagram: { ko: "인스타그램", en: "Instagram" }
};

// =====================================================
// ■ CSV 파싱 유틸리티 (정규식 기반 - 아주 안전함)
// =====================================================
function parseCSV(text) {
    if (!text) return [];
    const rows = [];
    // CSV 파싱 정규식 (콤마, 따옴표, 줄바꿈 완벽 처리)
    const pattern = new RegExp(
        "(\\,|\\r?\\n|\\r|^)" +
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        "([^\"\\,\\r\\n]*))",
        "gi"
    );
    let row = [];
    let matches = null;
    while (matches = pattern.exec(text)) {
        let matchedDelimiter = matches[1];
        // 콤마가 아닌 줄바꿈을 만났다면 다음 행으로 이동
        if (matchedDelimiter.length && matchedDelimiter !== ",") {
            rows.push(row);
            row = [];
        }
        let matchedValue;
        if (matches[2]) {
            // 따옴표로 감싸진 값의 이중 따옴표("")를 단일 따옴표(")로 변환
            matchedValue = matches[2].replace(new RegExp("\"\"", "g"), "\"");
        } else {
            // 일반 값
            matchedValue = matches[3];
        }
        row.push(matchedValue);
    }
    // 마지막 행 추가
    if (row.length > 0) rows.push(row);
    return rows;
}

// =====================================================
// ■ 예비 데이터 (Fallback Data)
// 인터넷 오류나 시트 차단 시 화면 멈춤을 방지하기 위한 안전망
// =====================================================
const fallbackData = [
    [
        "인투메디 클리닉스 리쥬\nINTOMEDI CLINIX REJUE",
        "4ml x 5ea",
        "주름개선 기능성\n(질병의 예방 및 치료를 위한 의약품이 아님)",
        "B25112701",
        "2028.11.27",
        "(주)제니트리 / 서울시 금천구 가산디지털2로 67, 2001호, 1403호, B105호\nJANYTREE INC. / #2001, #1403, #B105, 67, Gasan digital 2-ro, Geumcheon-gu, Seoul, Republic of Korea",
        "적당량을 덜어 피부에 골고루 펴 바른 후 흡수시켜 줍니다.\n* 주의사항 : 바이알 개봉 시 오픈 부분이 날카로울 수 있으니 사용에 주의하시기 바랍니다.",
        "정제수, 펜틸렌글라이콜, 트라넥사믹애씨드, 락토바실러스/하이드롤라이즈드완두콩추출발효여과물, 부틸렌글라이콜, 다이메틸설폰, 하이드록시프로필사이클로덱스트린, 덱스판테놀, 병풀추출물, 소듐하이알루로네이트, 하이드롤라이즈드콜라겐, 알란토인, 아데노신, 호장근뿌리추출물, 황금추출물, 알지닌, 녹차추출물, 스페인감초뿌리추출물, 소듐하이알루로네이트크로스폴리머, 로즈마리잎추출물, 마트리카리아꽃추출물, 소듐디엔에이, 페퍼민트추출물, 카퍼트라이펩타이드-1, 아세틸헥사펩타이드-8, 1,2-헥산다이올, 포스파티딜콜린, 폴리솔베이트20, 레시틴, 에스에이치-올리고펩타이드-1",
        "1. 화장품 사용 시 또는 사용 후 직사광선에 의하여 사용부위가 붉은 반점, 부어오름 또는 가려움증 등의 이상 증상이나 부작용이 있는 경우 전문의 등과 상담할 것\n2. 상처가 있는 부위 등에는 사용을 자제할 것\n3. 보관 및 취급 시의 주의사항\n  가) 어린이의 손이 닿지 않는 곳에 보관할 것\n  나) 직사광선을 피해서 보관할 것",
        "02-6296-8484",
        "https://intomedipro.com/"
    ]
];

// =====================================================
// ■ 구글 시트 데이터 로딩 (CSV Fetch 방식)
// =====================================================
async function loadSheetData(callback) {
    try {
        // 수인이 요청한 pub?output=csv 방식 적용
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?output=csv`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("네트워크 응답 오류");

        const text = await res.text();
        const rows = parseCSV(text);

        if (!rows || rows.length < 2) throw new Error("데이터 부족");

        // 첫 번째 행(헤더)을 분석하여 열(Column) 인덱스 동적 매핑
        if (rows.length > 0) {
            initColumns(rows[0]);
        }

        productsData = [];
        // 첫 줄은 헤더이므로 인덱스 1부터 시작
        for (let i = 1; i < rows.length; i++) {
            const item = rows[i].map(val => val ? val.trim() : '');
            // 14개 열 미만이면 빈 문자열로 채움 (0~13: 제품명 ~ 구매하기)
            while (item.length < 14) item.push('');

            if (item[0]) productsData.push(item);
        }
        callback(null, productsData);
    } catch (err) {
        console.warn("시트 로딩 실패, Fallback 데이터를 사용합니다:", err);
        productsData = fallbackData;
        callback(null, productsData); // 에러가 나도 fallback 데이터로 렌더링 속행
    }
}

// 제품명 가져오기
function getProductDisplayName(item, lang) {
    const rawName = item[COL.name] || '';
    const lines = rawName.split('\n').map(l => l.trim()).filter(l => l);

    if (lang === 'en') {
        const enLine = lines.find(line => !/[가-힣]/.test(line));
        if (enLine) return enLine;
    }
    return lines[0] || '';
}

// 인덱스 기반으로 값 가져오기
function getColValue(item, colIndex) {
    return item[colIndex] || '';
}

// 제조업자 항목: 언어에 따라 한글 줄 or 영문 줄만 추출
function getManufacturerDisplay(item, lang) {
    const raw = getColValue(item, COL.manufacturer);
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
    const errorEl = document.getElementById('error-screen');
    const mainEl = document.getElementById('main-content');
    const footerEl = document.getElementById('bottom-footer');

    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');

    loadSheetData(function (err, data) {
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
            window.speechSynthesis.cancel();
            window.ttsChunks = [];
            const ttsBtn = document.getElementById('btn-tts');
            if (ttsBtn) ttsBtn.classList.remove('playing');
            currentLang = 'ko';
            document.getElementById('btn-ko').classList.add('active');
            document.getElementById('btn-en').classList.remove('active');
            renderLabel(target, 'ko');
        });
        document.getElementById('btn-en').addEventListener('click', () => {
            if (currentLang === 'en') return;
            window.speechSynthesis.cancel();
            window.ttsChunks = [];
            const ttsBtn = document.getElementById('btn-tts');
            if (ttsBtn) ttsBtn.classList.remove('playing');
            currentLang = 'en';
            document.getElementById('btn-en').classList.add('active');
            document.getElementById('btn-ko').classList.remove('active');
            renderLabel(target, 'en');
        });

        // 구매하기 버튼 클릭 시 TTS 강제 정지
        const buyBtn = document.getElementById('btn-buy');
        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                window.speechSynthesis.cancel();
                window.ttsChunks = [];
                window.ttsLastCharIndex = 0;
                const ttsBtn = document.getElementById('btn-tts');
                if (ttsBtn) ttsBtn.classList.remove('playing');
            });
        }

        // ▼ 구매하기 버튼: 구글 시트의 구매링크 URL 사용
        document.getElementById('btn-buy').addEventListener('click', () => {
            let buyUrl = getColValue(target, COL.buyUrl).trim();
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
            const res = await fetchWithTimeout(url, 5000);
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
        const res = await fetch(url);
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
    const mainEl = document.getElementById('main-content');
    const footerEl = document.getElementById('bottom-footer');

    // 영어 번역 중 로딩 화면 표시
    if (lang === 'en') {
        mainEl.style.display = 'none';
        footerEl.style.display = 'none';
        loadingEl.style.display = 'flex';
        loadingEl.querySelector('p').textContent = 'Translating product info...';
    }

    // UI 라벨 (테이블 왼쪽 항목명) 업데이트
    document.getElementById('label-volume').textContent = uiLabels.volume[lang];
    document.getElementById('label-functional').textContent = uiLabels.functional[lang];
    const conceptHeader = document.getElementById('label-concept-ingredients');
    if (conceptHeader) conceptHeader.innerHTML = uiLabels.concept[lang];
    document.getElementById('label-batchno').textContent = uiLabels.batchno[lang]; // 추가
    document.getElementById('label-expiration').textContent = uiLabels.expiration[lang]; // 추가
    document.getElementById('label-how-to-use').textContent = uiLabels.howToUse[lang];
    document.getElementById('label-manufacturer').textContent = uiLabels.manufacturer[lang];
    document.getElementById('label-ingredients').textContent = uiLabels.ingredients[lang];
    document.getElementById('label-cautions').textContent = uiLabels.cautions[lang];
    document.getElementById('label-customer').textContent = uiLabels.customer[lang];
    
    // 비디오 섹션 라벨 업데이트
    const lblVideoTitle = document.getElementById('label-video-title');
    if(lblVideoTitle) lblVideoTitle.textContent = uiLabels.videoTitle[lang];
    const lblWatchYoutube = document.getElementById('label-watch-youtube');
    if(lblWatchYoutube) lblWatchYoutube.textContent = uiLabels.watchYoutube[lang];
    document.getElementById('btn-buy').textContent = uiLabels.buyBtn[lang];
    const lblSocialWebsite = document.getElementById('label-social-website');
    if(lblSocialWebsite) lblSocialWebsite.textContent = uiLabels.socialWebsite[lang];
    const lblSocialYoutube = document.getElementById('label-social-youtube');
    if(lblSocialYoutube) lblSocialYoutube.textContent = uiLabels.socialYoutube[lang];
    const lblSocialInstagram = document.getElementById('label-social-instagram');
    if(lblSocialInstagram) lblSocialInstagram.textContent = uiLabels.socialInstagram[lang];

    // 원본 데이터 (언어별 처리)
    let productName = getProductDisplayName(item, lang);
    let volume = getColValue(item, COL.volume);
    let functional = getColValue(item, COL.functional);
    let batchno = getColValue(item, COL.batchno); // 추가
    let expiration = getColValue(item, COL.expiration); // 추가
    // 제조업자: 언어별로 해당 줄만 추출 (번역 불필요)
    let manufacturer = getManufacturerDisplay(item, lang);
    let ingredients = getColValue(item, COL.ingredientsKo);
    let cautions = getColValue(item, COL.cautions);
    let customer = getColValue(item, COL.customer);

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

        // 전성분은 영문 열이 있으면 가져오고 없으면 식약처 API/구글번역 사용
        let ingredientsEn = getColValue(item, COL.ingredientsEn);
        if (ingredientsEn) {
            ingredients = ingredientsEn;
        } else {
            ingredients = await translateIngredients(ingredients);
        }
    }

    // 제품명 표시 (EN이면 시트에서 직접 영문명 추출)
    document.getElementById('product-name').textContent = lang === 'en'
        ? getProductDisplayName(item, 'en')
        : getProductDisplayName(item, 'ko');

    // 데이터 값 채우기
    document.getElementById('val-volume').textContent = volume;
    document.getElementById('val-functional').textContent = functional;
    document.getElementById('val-batchno').textContent = batchno; // 추가
    document.getElementById('val-expiration').textContent = expiration; // 추가
    document.getElementById('val-manufacturer').textContent = manufacturer;
    document.getElementById('val-ingredients').textContent = ingredients;

    // 인체적용시험 결과 엠블럼 렌더링
    const emblemContainer = document.getElementById('emblem-container');
    if (emblemContainer) {
        emblemContainer.innerHTML = '';
        const clinicalText = getColValue(item, COL.clinical);
        if (clinicalText) {
            emblemContainer.style.display = 'flex';
            // 여러 줄(엔터)로 인증이 여러 개 작성될 수 있으므로 분리
            const tests = clinicalText.split('\n').filter(t => t.trim() !== '');
            
            tests.forEach(test => {
                let badgeHtml = '';
                let iconType = 'clinical'; // default
                let badgeTitle = currentLang === 'ko' ? '인체적용시험 완료' : 'Clinical Test';
                let bgClass = 'bg-gray-100 text-gray-800 border-gray-200';
                
                if (test.includes('비건') || test.toLowerCase().includes('vegan')) {
                    iconType = 'vegan';
                    badgeTitle = 'Vegan';
                    bgClass = 'bg-green-50 text-green-700 border-green-200';
                    badgeHtml = `<span class="mr-1">🌱</span> ${badgeTitle}`;
                } else if (test.includes('저자극') || test.includes('더마') || test.toLowerCase().includes('derma') || test.includes('일차자극') || test.includes('민감성')) {
                    iconType = 'derma';
                    badgeTitle = currentLang === 'ko' ? '저자극 테스트 완료' : 'Dermatologically Tested';
                    bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
                    badgeHtml = `<span class="mr-1">💧</span> ${badgeTitle}`;
                } else {
                    badgeHtml = `<span class="mr-1">🩺</span> ${badgeTitle}`;
                }

                const badgeBtn = document.createElement('button');
                badgeBtn.className = `px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm transition-transform transform hover:scale-105 active:scale-95 ${bgClass}`;
                badgeBtn.innerHTML = badgeHtml;
                badgeBtn.onclick = async () => {
                    const title = uiLabels.clinicalTitle[currentLang];
                    document.getElementById('btn-clinical-close').textContent = uiLabels.clinicalClose[currentLang];
                    
                    if (currentLang === 'en') {
                        const translated = await translateText(test);
                        openClinicalModal(title, translated, iconType);
                    } else {
                        openClinicalModal(title, test, iconType);
                    }
                };
                emblemContainer.appendChild(badgeBtn);
            });
        } else {
            emblemContainer.style.display = 'none';
        }
    }

    // ▼ 핵심 컨셉 성분 렌더링 (시트의 conceptKo/conceptEn 열에서 직접 읽어옴)
    const conceptRow = document.getElementById('row-concept-ingredients');
    const conceptContainer = document.getElementById('val-concept-ingredients');
    if (conceptContainer) {
        conceptContainer.innerHTML = '';

        const rawConceptKo = getColValue(item, COL.conceptKo).trim();
        const rawConceptEn = getColValue(item, COL.conceptEn).trim();

        const koNames = rawConceptKo ? rawConceptKo.split(',').map(s => s.trim()).filter(Boolean) : [];
        const enNames = rawConceptEn ? rawConceptEn.split(',').map(s => s.trim()).filter(Boolean) : [];

        for(let idx = 0; idx < koNames.length; idx++) {
            const koName = koNames[idx];
            const displayName = (lang === 'en' && enNames[idx]) ? enNames[idx] : koName;
            const ingDesc = conceptFallbackDesc[koName] || '';
            let displayDesc = ingDesc;
            if (lang === 'en' && ingDesc) {
                displayDesc = await translateText(ingDesc);
            }

            const badge = document.createElement('span');
            badge.className = 'concept-badge ingredient-badge';
            badge.textContent = displayName;
            badge.onclick = () => window.openIngredientModal(
                displayName,
                displayDesc || (lang === 'en' ? 'Detailed information coming soon.' : '성분 상세 정보를 준비 중입니다.')
            );

            conceptContainer.appendChild(badge);
        };

        if (koNames.length > 0) {
            conceptRow.style.display = 'table-row';
        } else {
            conceptRow.style.display = 'none';
        }
    }

    document.getElementById('val-cautions').textContent = cautions;
    document.getElementById('val-customer').textContent = customer;

    // 사용방법: 주의사항 경고 박스 분리 렌더링
    const warnKeywordKo = "* 주의사항 :";
    const originalHowToUse = getColValue(item, COL.howToUse);
    const valHowToUseEl = document.getElementById('val-how-to-use');
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
        mainEl.style.display = 'block';
        footerEl.style.display = 'flex';
    }
}

// =====================================================
// ■ QR 메이커 모드 (qr_maker.html) - 관리자용
// =====================================================
function initQrMaker() {
    const selectEl = document.getElementById('product-select-maker');
    const downloadBtn = document.getElementById('btn-download');

    // 페이지 시작 시 HTML에 미리 작성해둔(하드코딩) 3개의 옵션에 맞추어 QR 코드 캔버스만 초기화
    updateQrDisplay(fallbackData[0]);

    // 2. 실제 시트 데이터 비동기(Fetch) 로딩 (전체 Try-Catch 보호 적용)
    loadSheetData(function (err, data) {
        let activeData = fallbackData; // 기본은 fallbackData로 설정

        if (!err && data && data.length > 0) {
            // 로딩 성공 시 실제 데이터로 덮어쓰기
            activeData = data;
            selectEl.innerHTML = '';
            data.forEach((item, idx) => {
                const option = document.createElement('option');
                option.value = idx;
                option.textContent = getProductDisplayName(item, 'ko');
                selectEl.appendChild(option);
            });
            updateQrDisplay(data[0]);
        }

        // 이벤트 리스너: 성공하든 실패하든 activeData를 바라보도록 설정
        selectEl.addEventListener('change', () => {
            const idx = parseInt(selectEl.value);
            if (activeData[idx]) {
                updateQrDisplay(activeData[idx]);
            }
        });

        document.getElementById('qr-to-viewer-btn').addEventListener('click', () => {
            const idx = parseInt(selectEl.value);
            const selectedItem = activeData[idx];
            if (!selectedItem) return;

            const name = getProductDisplayName(selectedItem, 'ko');
            window.location.href = `?product=${encodeURIComponent(name)}`;
        });
    });

    // QR 이미지 다운로드
    downloadBtn.addEventListener('click', () => {
        if (!currentQrUrl) return;
        const productName = selectEl.options[selectEl.selectedIndex]?.textContent || '제품';
        const safeName = productName.replace(/[/\\?%*:|"<>]/g, '_');

        fetch(currentQrUrl)
            .then(res => res.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.download = `${safeName}_QR코드.png`;
                link.href = URL.createObjectURL(blob);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(err => {
                // Fetch(CORS) 실패 시 새 창으로 이미지 열기
                window.open(currentQrUrl, '_blank');
            });
    });
}

// QR 코드 화면 업데이트
function updateQrDisplay(item) {
    const titleDisplay = document.getElementById('qr-product-title-display');
    const container = document.getElementById('qr-container');
    const urlPreview = document.getElementById('qr-url-preview');

    const name = getProductDisplayName(item, 'ko');
    const productUrl = `${E_LABEL_BASE_URL}?product=${encodeURIComponent(name)}`;

    // 외부 API를 이용해 고해상도 QR코드 URL 획득
    currentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productUrl)}`;

    titleDisplay.textContent = name;
    urlPreview.textContent = productUrl;

    // img 태그로 즉시 렌더링
    container.innerHTML = `
        <img src="${currentQrUrl}" alt="QR Code" style="width:200px; height:200px; margin-bottom:10px; border-radius:8px;" />
        <p style="font-size:12px; color:#2563eb; font-weight:600; margin-top:0px; margin-bottom:5px;">👉 클릭하여 라벨 정보 바로 보기</p>
    `;
}

// =====================================================
// ■ TTS (음성 안내)
// =====================================================
window.currentUtterance = null;
window.ttsChunks = [];
window.ttsIndex = 0;
window.isTtsPaused = false;
window.ttsLastCharIndex = 0; // 단어 경계 추적용

function playNextTtsChunk() {
    const ttsBtn = document.getElementById('btn-tts');
    if (window.ttsIndex >= window.ttsChunks.length) {
        if (ttsBtn) ttsBtn.classList.remove('playing');
        window.ttsChunks = [];
        return;
    }
    
    const text = window.ttsChunks[window.ttsIndex];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'ko' ? 'ko-KR' : 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    if (currentLang === 'en') {
        const googleVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en'));
        if (googleVoice) utterance.voice = googleVoice;
    }
    utterance.rate = 0.9;
    window.ttsLastCharIndex = 0; // 초기화

    utterance.onstart = () => { if (ttsBtn) ttsBtn.classList.add('playing'); };
    utterance.onboundary = (e) => {
        if (e.charIndex) {
            window.ttsLastCharIndex = e.charIndex;
        }
    };
    utterance.onend = () => {
        if (window.isTtsPaused) return; 
        window.ttsIndex++;
        playNextTtsChunk();
    };
    utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return; 
        if (ttsBtn) ttsBtn.classList.remove('playing');
        window.ttsChunks = [];
    };

    window.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
}

function handleTts(item) {
    const ttsBtn = document.getElementById('btn-tts');
    if (!window.speechSynthesis) {
        alert('이 브라우저는 음성 안내를 지원하지 않습니다.');
        return;
    }
    
    if (window.speechSynthesis.speaking || window.ttsChunks.length > 0) {
        if (window.isTtsPaused) {
            window.isTtsPaused = false;
            playNextTtsChunk();
        } else {
            window.isTtsPaused = true;
            window.speechSynthesis.cancel();
            if (window.ttsLastCharIndex > 0 && window.ttsChunks[window.ttsIndex]) {
                window.ttsChunks[window.ttsIndex] = window.ttsChunks[window.ttsIndex].substring(window.ttsLastCharIndex);
            }
            if (ttsBtn) ttsBtn.classList.remove('playing');
        }
        return;
    }

    const productName = getProductDisplayName(item, 'ko');
    const volume = getColValue(item, COL.volume);
    const functional = getColValue(item, COL.functional);
    const batchno = getColValue(item, COL.batchno);
    const expiration = getColValue(item, COL.expiration);
    const howToUse = getColValue(item, COL.howToUse).split('* 주의사항 :')[0].trim();
    const manufacturer = getColValue(item, COL.manufacturer);
    const clinical = getColValue(item, COL.clinical); // 추가
    const ingredients = currentLang === 'en' && getColValue(item, COL.ingredientsEn) 
                        ? getColValue(item, COL.ingredientsEn) 
                        : getColValue(item, COL.ingredientsKo);
    const cautions = getColValue(item, COL.cautions);
    const customer = getColValue(item, COL.customer);

    let concept = '';
    const conceptContainer = document.getElementById('val-concept-ingredients');
    if (conceptContainer) {
        concept = Array.from(conceptContainer.querySelectorAll('.ingredient-badge'))
                    .map(b => b.textContent.trim())
                    .join(', ');
    }
    const conceptTitle = currentLang === 'ko' ? "핵심 컨셉 성분" : "Key Ingredients";

    let fullText = `${productName}. ` + 
        `${uiLabels.volume[currentLang]}, ${volume}. ` + 
        `${uiLabels.functional[currentLang]}, ${functional}. ` + 
        `${uiLabels.batchno[currentLang]}, ${batchno}. ` + 
        `${uiLabels.expiration[currentLang]}, ${expiration}. ` + 
        `${uiLabels.manufacturer[currentLang]}, ${manufacturer}. ` + 
        `${conceptTitle}, ${concept}. ` + 
        (clinical ? `${uiLabels.clinicalTitle[currentLang]}, ${clinical.replace(/\n/g, '. ')}. ` : '') + 
        `${uiLabels.ingredients[currentLang]}, ${ingredients}. ` + 
        `${uiLabels.howToUse[currentLang]}, ${howToUse}. ` + 
        `${uiLabels.cautions[currentLang]}, ${cautions}. ` + 
        `${uiLabels.customer[currentLang]}, ${customer}.`;

    if (currentLang === 'en') {
        fullText = fullText
            .replace(/INTOMEDI/g, 'Intomedi')
            .replace(/CLINIX/g, 'Clinix')
            .replace(/REJUE/g, 'Rejue')
            .replace(/WHITE/g, 'White')
            .replace(/HYDRO/g, 'Hydro');
    }

    // 사파리 호환성을 위해 정규식(Lookbehind) 대신 replace 후 split 사용
    window.ttsChunks = fullText.replace(/\.\s+/g, '.|').split('|').filter(s => s.trim().length > 0);
    window.ttsIndex = 0;
    window.isTtsPaused = false;
    playNextTtsChunk();
}
