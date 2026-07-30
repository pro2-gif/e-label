const fs = require('fs');

let lines = fs.readFileSync('index.html', 'utf8').split('\n');

// 1. Add COL.clinicalEn
const colClinicalIndex = lines.findIndex(l => l.includes('clinical: 8,'));
if (colClinicalIndex !== -1) {
    lines.splice(colClinicalIndex + 1, 0, '            clinicalEn: 15,');
} else {
    console.error("clinical: 8, not found");
    process.exit(1);
}

// 2. Add clinicalEn mapping in initColumns
const initClinicalIdx = lines.findIndex(l => l.includes("h.includes('인체적용시험') || h.includes('인증')"));
if (initClinicalIdx !== -1) {
    lines.splice(initClinicalIdx, 0, "                else if (h.includes('인체적용시험(영문)')) COL.clinicalEn = idx;");
    // Also, we need to update the original line to strip "(국문)"
    lines[initClinicalIdx + 1] = lines[initClinicalIdx + 1].replace(
        "uiLabels.clinicalTitle.ko = rawHeader;",
        "uiLabels.clinicalTitle.ko = rawHeader.replace('(국문)', '').trim();"
    );
} else {
    console.error("initColumns clinical logic not found");
    process.exit(1);
}

// 3. Replace the renderLabel clinical handling block
const startRenderIdx = lines.findIndex(l => l.includes('// 인체적용시험 결과 행 렌더링'));
const endRenderIdx = lines.findIndex((l, idx) => idx > startRenderIdx && l.includes("clinicalRow.style.display = 'none';"));

if (startRenderIdx !== -1 && endRenderIdx !== -1) {
    const newRenderLogic = `            // 인체적용시험 결과 행 렌더링
            const clinicalKoText = getColValue(item, COL.clinical);
            const clinicalEnText = getColValue(item, COL.clinicalEn);
            let clinicalText = '';
            let isTranslatedEn = false;
            
            if (lang === 'en') {
                if (clinicalEnText) {
                    clinicalText = clinicalEnText;
                    isTranslatedEn = true;
                } else {
                    clinicalText = clinicalKoText;
                }
            } else {
                clinicalText = clinicalKoText;
            }

            const clinicalRow = document.getElementById('row-clinical');
            if (clinicalText) {
                clinicalRow.style.display = 'table-row';
                const valClinical = document.getElementById('val-clinical');
                valClinical.innerHTML = '';
                valClinical.style.cursor = 'default';
                valClinical.style.color = '';
                valClinical.style.textDecoration = 'none';
                valClinical.title = '';
                valClinical.onclick = null;

                const clinicalLines = clinicalText.split('\\n').map(l => l.trim()).filter(l => l);
                
                Promise.all(clinicalLines.map(async (line) => {
                    const urlMatches = line.match(/https?:\\/\\/[^\\s|]+/g);
                    let imageUrl = null;
                    if (urlMatches && urlMatches.length > 0) {
                        imageUrl = urlMatches[0];
                    }
                    const textOnly = line.replace(/\\|?\\s*https?:\\/\\/[^\\s|]+/g, '').trim();
                    let finalText = textOnly;
                    if (lang === 'en' && !isTranslatedEn) {
                        finalText = await translateText(textOnly);
                    }
                    return { text: finalText, imageUrl };
                })).then(results => {
                    results.forEach((res, idx) => {
                        const div = document.createElement('div');
                        if (res.imageUrl) {
                            div.style.cursor = 'pointer';
                            div.style.color = '#866d5b';
                            div.style.textDecoration = 'underline';
                            div.title = lang === 'ko' ? '클릭하여 결과 이미지 보기' : 'Click to view results image';
                            div.innerHTML = res.text + ' 🔍';
                            div.onclick = () => {
                                document.getElementById('clinical-modal-title').textContent = uiLabels.clinicalTitle[lang];
                                document.getElementById('btn-clinical-close').textContent = uiLabels.clinicalClose[lang];
                                const descElem = document.getElementById('clinical-modal-desc');
                                descElem.innerHTML = \`<div class="mb-4 font-semibold text-gray-800">\${res.text}</div><img src="\${res.imageUrl}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; display: block; margin-top: 15px;" alt="인체적용시험 결과 이미지" onerror="this.onerror=null; this.parentElement.innerHTML+='<br><span class=\\'text-sm text-red-500\\'>이미지를 불러올 수 없습니다. 링크를 확인해주세요.</span>'; this.style.display='none';">\`;
                                document.getElementById('clinical-modal').classList.add('show');
                            };
                        } else {
                            div.innerHTML = res.text;
                            div.style.color = '#4b5563';
                        }
                        if (idx > 0) div.style.marginTop = '6px';
                        valClinical.appendChild(div);
                    });
                });
            } else {
                clinicalRow.style.display = 'none';`;
                
    // Remove old lines (startRenderIdx to endRenderIdx inclusive)
    lines.splice(startRenderIdx, endRenderIdx - startRenderIdx + 1, newRenderLogic);
} else {
    console.error("renderLabel clinical logic not found");
    process.exit(1);
}

// 4. Update TTS
const ttsStartIdx = lines.findIndex(l => l.includes('// 인체적용시험 텍스트 추출'));
const ttsEndIdx = lines.findIndex((l, idx) => idx > ttsStartIdx && l.includes('// 음성 발화용 문장 조립'));
if (ttsStartIdx !== -1 && ttsEndIdx !== -1) {
    const newTtsLogic = `            // 인체적용시험 텍스트 추출
            let clinical = '';
            const valClinical = document.getElementById('val-clinical');
            const clinicalRow = document.getElementById('row-clinical');
            if (valClinical && clinicalRow && clinicalRow.style.display !== 'none') {
                clinical = Array.from(valClinical.querySelectorAll('div'))
                            .map(d => d.textContent.replace('🔍', '').trim())
                            .filter(t => t)
                            .join('. ');
            }
`;
    lines.splice(ttsStartIdx, ttsEndIdx - ttsStartIdx, newTtsLogic);
} else {
    console.error("TTS clinical logic not found");
    process.exit(1);
}

fs.writeFileSync('index.html', lines.join('\n'), 'utf8');
console.log("Successfully patched index.html");
