const fs = require('fs');

let lines = fs.readFileSync('index.html', 'utf8').split('\n');

const startRenderIdx = lines.findIndex(l => l.includes('// 인체적용시험 결과 행 렌더링'));
const endRenderIdx = lines.findIndex((l, idx) => idx > startRenderIdx && l.includes("clinicalRow.style.display = 'none';"));

if (startRenderIdx !== -1 && endRenderIdx !== -1) {
    const newRenderLogic = `            // 인체적용시험 결과 행 렌더링
            const clinicalKoText = getColValue(item, COL.clinical);
            const clinicalEnText = getColValue(item, COL.clinicalEn);
            let clinicalText = '';
            
            // 영문 모드일 경우: 영문 셀 데이터가 있으면 그것을, 없으면 국문 셀 데이터를 사용
            if (lang === 'en') {
                clinicalText = clinicalEnText ? clinicalEnText : clinicalKoText;
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

                // 텍스트를 줄바꿈 기준으로 나누되, URL만 있는 줄은 이전 줄과 병합
                let rawLines = clinicalText.split('\\n').map(l => l.trim()).filter(l => l);
                let clinicalLines = [];
                for (let i = 0; i < rawLines.length; i++) {
                    if (clinicalLines.length > 0 && rawLines[i].match(/^https?:\\/\\//)) {
                        // URL로 시작하는 줄이면 이전 줄에 병합
                        clinicalLines[clinicalLines.length - 1] += ' ' + rawLines[i];
                    } else {
                        clinicalLines.push(rawLines[i]);
                    }
                }
                
                Promise.all(clinicalLines.map(async (line) => {
                    const urlMatches = line.match(/https?:\\/\\/[^\\s|]+/g);
                    let imageUrl = null;
                    if (urlMatches && urlMatches.length > 0) {
                        imageUrl = urlMatches[0];
                    }
                    // 파이프 기호와 URL 제거
                    const textOnly = line.replace(/\\|?\\s*https?:\\/\\/[^\\s|]+/g, '').replace(/\\|\\s*$/, '').trim();
                    let finalText = textOnly;
                    
                    // 영문 모드에서는 원본 출처(국문/영문 셀)와 무관하게 항상 구글 번역을 수행하여 영어 출력을 보장
                    if (lang === 'en') {
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
    
    fs.writeFileSync('index.html', lines.join('\n'), 'utf8');
    console.log("Successfully patched index.html");
} else {
    console.error("renderLabel clinical logic not found");
    process.exit(1);
}
