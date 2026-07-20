// =====================================================
// 인투메디 전자라벨 공용 스크립트 (script.js)
// =====================================================

// ▼ QR 코드에 사용할 기본 주소 (나중에 실제 서버 주소로 변경 가능)
// ▼ QR 코드 스캔 시 연결될 실제 인터넷 주소 (GitHub Pages)
const E_LABEL_BASE_URL = "https://pro2-gif.github.io/e-label/index.html";

// 구글 시트 ID
const SHEET_ID = "1dQOhtidzJfK3NXzzrzzPeAC10pv8wvbqnWRU-WjM3wQ";

// 앱 상태 변수
let currentLang = 'ko';
let productsData = []; // 시트에서 파싱된 제품 배열
let qrInstance = null;

// 다국어 UI 라벨
const uiLabels = {
    volume:       { ko: "용량 및 기능성",         en: "Volume & Functional" },
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
    // JSONP 콜백 함수를 전역으로 등록
    window._sheetCallback = function(json) {
        try {
            const rows = json.table.rows;
            if (!rows || rows.length < 2) throw new Error("데이터가 없습니다.");

            // 첫 번째 행: 헤더 (컬럼명)
            const headers = rows[0].c.map(cell => (cell && cell.v) ? String(cell.v).trim() : '');

            // 두 번째 행부터: 실제 데이터
            productsData = [];
            for (let i = 1; i < rows.length; i++) {
                const rowCells = rows[i].c;
                const item = {};
                for (let j = 0; j < headers.length; j++) {
                    // 값이 있으면 문자열로 변환, 없으면 빈 문자열
                    item[headers[j]] = (rowCells && rowCells[j] && rowCells[j].v != null)
                        ? String(rowCells[j].v).trim()
                        : '';
                }
                // 제품명이 비어있는 행은 건너뜀
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

    // JSONP 스크립트 태그 삽입
    const script = document.createElement('script');
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:_sheetCallback`;
    script.onerror = () => callback(new Error("네트워크 연결 오류"), null);
    document.head.appendChild(script);
}

// 제품명(첫 번째 컬럼)의 국문 이름만 추출 (영문 포함된 경우 첫 줄만)
function getProductDisplayName(item) {
    const headers = Object.keys(item);
    const rawName = item[headers[0]] || '';
    // 개행이 있으면 첫 줄만
    return rawName.split('\n')[0].trim();
}

// 컬럼명 키를 순서로 가져오는 헬퍼
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

    // URL 파라미터에서 제품명 추출
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');

    loadSheetData(function(err, data) {
        if (err || !data || data.length === 0) {
            loadingEl.style.display = 'none';
            document.getElementById('error-msg').textContent = '시트 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
            errorEl.style.display = 'flex';
            return;
        }

        // 파라미터로 제품 찾기 (이름의 일부만 포함돼도 매칭)
        let targetIndex = 0;
        if (productParam) {
            const found = data.findIndex(item => {
                const name = getProductDisplayName(item).toLowerCase();
                return name.includes(productParam.toLowerCase());
            });
            if (found !== -1) targetIndex = found;
        }

        loadingEl.style.display = 'none';
        mainEl.style.display = 'block';
        footerEl.style.display = 'flex';

        renderLabel(data[targetIndex], 'ko');

        // 언어 버튼
        document.getElementById('btn-ko').addEventListener('click', () => {
            currentLang = 'ko';
            document.getElementById('btn-ko').classList.add('active');
            document.getElementById('btn-en').classList.remove('active');
            renderLabel(data[targetIndex], 'ko');
        });
        document.getElementById('btn-en').addEventListener('click', () => {
            currentLang = 'en';
            document.getElementById('btn-en').classList.add('active');
            document.getElementById('btn-ko').classList.remove('active');
            renderLabel(data[targetIndex], 'en');
        });

        // 구매하기 버튼
        document.getElementById('btn-buy').addEventListener('click', () => {
            window.open('https://intomedipro.com/', '_blank');
        });

        // TTS 버튼
        document.getElementById('btn-tts').addEventListener('click', () => {
            handleTts(data[targetIndex]);
        });
    });
}

// =====================================================
// ■ 라벨 데이터 화면 렌더링
// =====================================================
function renderLabel(item, lang) {
    const headers = Object.keys(item);
    // 열 순서: 0=제품명, 1=용량/기능성, 2=사용방법, 3=제조업자, 4=전성분, 5=주의사항, 6=소비자상담

    // 제품명 (첫 번째 열, 첫 줄만 사용)
    document.getElementById('product-name').textContent = getProductDisplayName(item);

    // UI 라벨 (테이블 왼쪽 항목명)
    document.getElementById('label-volume').textContent       = uiLabels.volume[lang];
    document.getElementById('label-how-to-use').textContent  = uiLabels.howToUse[lang];
    document.getElementById('label-manufacturer').textContent = uiLabels.manufacturer[lang];
    document.getElementById('label-ingredients').textContent  = uiLabels.ingredients[lang];
    document.getElementById('label-cautions').textContent    = uiLabels.cautions[lang];
    document.getElementById('label-customer').textContent    = uiLabels.customer[lang];
    document.getElementById('btn-buy').textContent           = uiLabels.buyBtn[lang];

    // 데이터 값 채우기 (열 순서 기반)
    document.getElementById('val-volume').textContent       = getColValue(item, 1);
    document.getElementById('val-manufacturer').textContent = getColValue(item, 3);
    document.getElementById('val-ingredients').textContent  = getColValue(item, 4);
    document.getElementById('val-cautions').textContent     = getColValue(item, 5);
    document.getElementById('val-customer').textContent     = getColValue(item, 6);

    // 사용방법: 주의사항 경고 박스 분리 렌더링
    const howToUseRaw = getColValue(item, 2);
    const warnKeyword = "* 주의사항 :";
    const valHowToUseEl = document.getElementById('val-how-to-use');
    valHowToUseEl.innerHTML = '';

    if (howToUseRaw.includes(warnKeyword)) {
        const parts = howToUseRaw.split(warnKeyword);
        const mainDiv = document.createElement('div');
        mainDiv.style.whiteSpace = 'pre-line';
        mainDiv.textContent = parts[0].trim();

        const warnDiv = document.createElement('div');
        warnDiv.className = 'warning-box';
        warnDiv.innerHTML = `<span class="material-icons" style="font-size:18px;margin-top:2px;">warning</span><span>* 주의사항 : ${parts[1].trim()}</span>`;

        valHowToUseEl.appendChild(mainDiv);
        valHowToUseEl.appendChild(warnDiv);
    } else {
        valHowToUseEl.style.whiteSpace = 'pre-line';
        valHowToUseEl.textContent = howToUseRaw;
    }
}

// =====================================================
// ■ QR 메이커 모드 (qr_maker.html) - 관리자용
// =====================================================
function initQrMaker() {
    const selectEl      = document.getElementById('product-select-maker');
    const titleDisplay  = document.getElementById('qr-product-title-display');
    const urlPreview    = document.getElementById('qr-url-preview');
    const downloadBtn   = document.getElementById('btn-download');

    // QRious 인스턴스 초기화
    qrInstance = new QRious({
        element: document.getElementById('qr-canvas'),
        size: 260,
        level: 'H',
        value: E_LABEL_BASE_URL
    });

    // 시트 데이터 로딩
    loadSheetData(function(err, data) {
        if (err || !data || data.length === 0) {
            selectEl.innerHTML = '<option value="">데이터 로딩 실패 - 인터넷 연결 확인</option>';
            return;
        }

        // 드롭다운 채우기
        selectEl.innerHTML = '';
        data.forEach((item, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = getProductDisplayName(item);
            selectEl.appendChild(option);
        });

        // 첫 번째 제품으로 초기 QR 렌더링
        updateQrDisplay(data[0]);

        // 제품 변경 시 QR 갱신
        selectEl.addEventListener('change', () => {
            const idx = parseInt(selectEl.value);
            updateQrDisplay(data[idx]);
        });
    });

    // QR 이미지 다운로드 (제품명 + QR 합성)
    downloadBtn.addEventListener('click', () => {
        const idx = parseInt(selectEl.value) || 0;
        const productName = selectEl.options[selectEl.selectedIndex]?.textContent || '제품';
        const qrCanvas = document.getElementById('qr-canvas');

        // 합성 캔버스 생성 (제품명 텍스트 + QR 이미지)
        const compositeCanvas = document.createElement('canvas');
        const ctx = compositeCanvas.getContext('2d');
        const padding = 30;
        const textHeight = 50;
        compositeCanvas.width  = qrCanvas.width + padding * 2;
        compositeCanvas.height = qrCanvas.height + padding * 2 + textHeight;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

        ctx.fillStyle = '#111827';
        ctx.font = 'bold 20px Pretendard, sans-serif';
        ctx.textAlign = 'center';
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
    const titleDisplay  = document.getElementById('qr-product-title-display');
    const urlPreview    = document.getElementById('qr-url-preview');
    const name          = getProductDisplayName(item);
    const qrUrl         = `${E_LABEL_BASE_URL}?product=${encodeURIComponent(name)}`;

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

    const productName = getProductDisplayName(item);
    const volume      = getColValue(item, 1);
    const howToUse    = getColValue(item, 2).split('* 주의사항 :')[0].trim();
    const cautions    = getColValue(item, 5);

    const text = `${productName}. ${uiLabels.volume[currentLang]}, ${volume}. ${uiLabels.howToUse[currentLang]}, ${howToUse}. ${uiLabels.cautions[currentLang]}, ${cautions}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'ko' ? 'ko-KR' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}
