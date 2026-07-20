const db = {
  product_info: {
    product_name: {
      ko: "인투메디 클리닉스 리쥬",
      en: "INTOMEDI CLINICS REJU"
    },
    volume_functional: {
      ko: "5ml x 5ea / 주름개선 기능성 화장품\n※ 본 제품은 질병의 예방 및 치료를 위한 의약품이 아닙니다.",
      en: "5ml x 5ea / Anti-wrinkle Functional Cosmetics\n※ This product is not a medicine for the prevention or treatment of diseases."
    },
    how_to_use: {
      ko: "적당량을 덜어 피부에 골고루 펴 바른 후 흡수시켜 줍니다.\n\n[바이알 오픈 방법]\n바이알의 캡을 화살표 방향으로 힘을 주어 연 다음 테두리의 알루미늄을 제거 후 고무마개를 열어줍니다. 이후 드로퍼를 끼워 사용해 주세요.\n* 주의사항 : 바이알 개봉 시 오픈 부분이 날카로울 수 있으니 사용에 주의하시기 바랍니다.",
      en: "Take an appropriate amount, spread it evenly over the skin, and let it absorb.\n\n[How to open the vial]\nPull up the vial cap firmly in the direction of the arrow, remove the aluminum rim, and open the rubber stopper. Then, attach the dropper before use.\n* Caution: Be careful when opening the vial as the opened edge can be sharp."
    },
    manufacturer_distributor: {
      ko: "(주)제니트리",
      en: "ZENITREE Co., Ltd."
    },
    ingredients: {
      ko: "정제수, 펜틸렌글라이콜, 트라넥사믹애씨드, 락토바실러스/하이드롤라이즈드완두콩추출발효여과물, 부틸렌글라이콜, 다이메틸설폰, 덱스판테놀, 하이드록시프로필사이클로덱스트린, 병풀추출물, 페퍼민트추출물, 알란토인, 하이드롤라이즈드콜라겐, 소듐하이알루로네이트, 아데노신, 호장근뿌리추출물, 황금추출물, 알지닌, 1,2-헥산다이올, 녹차추출물, 스페인감초뿌리추출물, 소듐하이알루로네이트크로스폴리머, 마트리카리아꽃추출물, 로즈마리잎추출물, 아세틸헥사펩타이드-8, 카퍼트라이펩타이드-1, 소듐디엔에이, 에스에이치-올리고펩타이드-1",
      en: "Water, Pentylene Glycol, Tranexamic Acid, Lactobacillus/Hydrolyzed Pea Extract Ferment Filtrate, Butylene Glycol, Dimethyl Sulfone, Dexpanthenol, Hydroxypropyl Cyclodextrin, Centella Asiatica Extract, Peppermint Extract, Allantoin, Hydrolyzed Collagen, Sodium Hyaluronate, Adenosine, Polygonum Cuspidatum Root Extract, Scutellaria Baicalensis Root Extract, Arginine, 1,2-Hexanediol, Green Tea Extract, Glycyrrhiza Glabra (Licorice) Root Extract, Sodium Hyaluronate Crosspolymer, Matricaria Flower Extract, Rosemary Leaf Extract, Acetyl Hexapeptide-8, Copper Tripeptide-1, Sodium DNA, sh-Oligopeptide-1"
    },
    cautions: {
      ko: "1) 화장품 사용 시 또는 사용 후 직사광선에 의하여 사용부위가 붉은 반점, 부어오름 또는 가려움증 등의 이상 증상이나 부작용이 있는 경우에는 전문의 등과 상담할 것\n2) 상처가 있는 부위 등에는 사용을 자제할 것\n3) 보관 및 취급 시 주의사항\n  가) 어린이의 손이 닿지 않는 곳에 보관할 것\n  나) 직사광선을 피해서 보관할 것",
      en: "1) If there are any abnormal symptoms or side effects such as red spots, swelling, or itching on the area of use due to direct sunlight during or after using cosmetics, consult a specialist.\n2) Refrain from using on wounded areas.\n3) Cautions for storage and handling\n  A) Keep out of reach of children.\n  B) Store away from direct sunlight."
    },
    customer_service: {
      ko: "1661-2383, 02-868-1921",
      en: "+82-1661-2383, +82-2-868-1921"
    }
  }
};

const labels = {
  volume: { ko: "용량 및 기능성", en: "Volume & Functional" },
  howToUse: { ko: "사용방법", en: "How to Use" },
  manufacturer: { ko: "제조업자 및 책임판매업자", en: "Manufacturer & Distributor" },
  ingredients: { ko: "전성분", en: "Ingredients" },
  cautions: { ko: "사용 시 주의사항", en: "Cautions" },
  customer: { ko: "소비자상담실", en: "Customer Service" },
  buyBtn: { ko: "구매하기", en: "Buy Now" }
};

const storeLinks = {
  ko: "https://intomedipro.com/",
  en: "https://intomedipro.com/"
};

let currentLang = 'ko';

// 문서 요소 선택
const els = {
  btnKo: document.getElementById('btn-ko'),
  btnEn: document.getElementById('btn-en'),
  productName: document.getElementById('product-name'),
  lblVolume: document.getElementById('label-volume'),
  valVolume: document.getElementById('val-volume'),
  lblHowToUse: document.getElementById('label-how-to-use'),
  valHowToUse: document.getElementById('val-how-to-use'),
  lblManufacturer: document.getElementById('label-manufacturer'),
  valManufacturer: document.getElementById('val-manufacturer'),
  lblIngredients: document.getElementById('label-ingredients'),
  valIngredients: document.getElementById('val-ingredients'),
  lblCautions: document.getElementById('label-cautions'),
  valCautions: document.getElementById('val-cautions'),
  lblCustomer: document.getElementById('label-customer'),
  valCustomer: document.getElementById('val-customer'),
  btnBuy: document.getElementById('btn-buy'),
  btnTts: document.getElementById('btn-tts')
};

// UI 업데이트 함수
function updateUI(lang) {
  currentLang = lang;
  
  // 버튼 스타일 업데이트
  if (lang === 'ko') {
    els.btnKo.classList.add('active');
    els.btnEn.classList.remove('active');
  } else {
    els.btnEn.classList.add('active');
    els.btnKo.classList.remove('active');
  }

  // 제품명
  els.productName.textContent = db.product_info.product_name[lang];
  
  // 라벨 업데이트
  els.lblVolume.textContent = labels.volume[lang];
  els.lblHowToUse.textContent = labels.howToUse[lang];
  els.lblManufacturer.textContent = labels.manufacturer[lang];
  els.lblIngredients.textContent = labels.ingredients[lang];
  els.lblCautions.textContent = labels.cautions[lang];
  els.lblCustomer.textContent = labels.customer[lang];
  
  // 값 업데이트
  els.valVolume.textContent = db.product_info.volume_functional[lang];
  els.valManufacturer.textContent = db.product_info.manufacturer_distributor[lang];
  els.valIngredients.textContent = db.product_info.ingredients[lang];
  els.valCautions.textContent = db.product_info.cautions[lang];
  els.valCustomer.textContent = db.product_info.customer_service[lang];
  
  // 구매버튼 업데이트
  els.btnBuy.textContent = labels.buyBtn[lang];

  // 사용방법 (경고 하이라이트 박스 처리)
  const howToUseText = db.product_info.how_to_use[lang];
  
  // 주의사항 텍스트가 포함되어 있으면 분리하여 강조 처리
  let formattedHowToUse = "";
  const warningSplitKo = "* 주의사항 :";
  const warningSplitEn = "* Caution:";
  const splitKeyword = lang === 'ko' ? warningSplitKo : warningSplitEn;
  
  if (howToUseText.includes(splitKeyword)) {
    const parts = howToUseText.split(splitKeyword);
    const mainText = parts[0].trim();
    const warningText = splitKeyword + parts[1];
    
    // 이스케이프 처리를 위해 textContent로 생성
    const mainDiv = document.createElement('div');
    mainDiv.textContent = mainText;
    
    const warningBox = document.createElement('div');
    warningBox.className = 'warning-box';
    warningBox.innerHTML = `<span class="material-icons">warning</span> <span>${warningText}</span>`;
    
    els.valHowToUse.innerHTML = '';
    els.valHowToUse.appendChild(mainDiv);
    els.valHowToUse.appendChild(warningBox);
  } else {
    els.valHowToUse.textContent = howToUseText;
  }
}

// 이벤트 리스너 등록
els.btnKo.addEventListener('click', () => updateUI('ko'));
els.btnEn.addEventListener('click', () => updateUI('en'));

els.btnBuy.addEventListener('click', () => {
  window.open(storeLinks[currentLang], '_blank');
});

// 음성 안내(TTS) 기능 구현 (토글: 재생/중지)
els.btnTts.addEventListener('click', () => {
  if (!window.speechSynthesis) {
    alert(currentLang === 'ko' ? "이 브라우저는 음성 안내를 지원하지 않습니다." : "This browser does not support text-to-speech.");
    return;
  }
  
  // 현재 음성이 재생 중이라면 중지하고 함수 종료
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    return; // 중지 후 다시 읽지 않도록 리턴
  }
  
  // 메인 콘텐츠 영역의 텍스트를 수집
  const textToRead = `
    ${db.product_info.product_name[currentLang]}.
    ${labels.volume[currentLang]}, ${db.product_info.volume_functional[currentLang]}.
    ${labels.howToUse[currentLang]}, ${db.product_info.how_to_use[currentLang]}.
    ${labels.manufacturer[currentLang]}, ${db.product_info.manufacturer_distributor[currentLang]}.
    ${labels.cautions[currentLang]}, ${db.product_info.cautions[currentLang]}.
  `;
  
  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.lang = currentLang === 'ko' ? 'ko-KR' : 'en-US';
  utterance.rate = 0.9; // 약간 천천히 읽어주어 이해를 돕습니다
  
  window.speechSynthesis.speak(utterance);
});

// 초기화
updateUI('ko');
