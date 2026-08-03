const fs = require('fs');

let lines = fs.readFileSync('index.html', 'utf8').split('\n');

// 1. Inject playItemTts right before handleTts
const handleTtsIdx = lines.findIndex(l => l.includes('function handleTts(item) {'));
if (handleTtsIdx !== -1) {
    const playItemTtsCode = `
        window.playItemTts = function(itemId, e) {
            if (e) e.stopPropagation();
            
            if (!window.speechSynthesis) {
                alert('이 브라우저는 음성 안내를 지원하지 않습니다.');
                return;
            }
            
            // 기존 재생 중단
            window.speechSynthesis.cancel();
            window.ttsChunks = [];
            window.isTtsPaused = false;
            const mainTtsBtn = document.getElementById('btn-tts');
            if (mainTtsBtn) mainTtsBtn.classList.remove('playing');

            let labelText = '';
            let valText = '';
            
            const th = document.getElementById('label-' + itemId);
            if (th) {
                labelText = Array.from(th.childNodes)
                    .filter(n => n.nodeType === Node.TEXT_NODE)
                    .map(n => n.textContent)
                    .join(' ').replace(/✨/g, '').trim();
            }
            
            const td = document.getElementById('val-' + itemId);
            if (td) {
                if (itemId === 'concept-ingredients') {
                    valText = Array.from(td.querySelectorAll('.concept-badge'))
                                .map(b => b.textContent.trim())
                                .join(', ');
                } else if (itemId === 'clinical') {
                    valText = Array.from(td.querySelectorAll('div'))
                                .map(d => d.textContent.replace('🔍', '').trim())
                                .filter(t => t)
                                .join('. ');
                } else {
                    valText = td.textContent;
                }
            }
            
            if (!valText || valText.trim() === '') return;

            let textToRead = \`\${labelText}. \${valText}.\`;
            
            if (currentLang === 'en') {
                textToRead = textToRead
                    .replace(/INTOMEDI/g, 'Intomedi')
                    .replace(/CLINIX/g, 'Clinix')
                    .replace(/REJUE/g, 'Rejue')
                    .replace(/WHITE/g, 'White')
                    .replace(/HYDRO/g, 'Hydro')
                    .replace(/\\bsh\\b/gi, 'S H');
            } else {
                textToRead = textToRead.replace(/\\bsh\\b/gi, '에스에이치');
            }
            textToRead = textToRead.replace(/-/g, ' ');

            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = currentLang === 'ko' ? 'ko-KR' : 'en-US';
            
            const voices = window.speechSynthesis.getVoices();
            if (currentLang === 'en') {
                const googleVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en'));
                if (googleVoice) utterance.voice = googleVoice;
            }
            utterance.rate = 0.9;
            
            const btnIcon = th.querySelector('.item-tts-btn span');
            utterance.onstart = () => { if (btnIcon) btnIcon.style.color = '#3e332c'; };
            utterance.onend = () => { if (btnIcon) btnIcon.style.color = '#c4b3a6'; };
            utterance.onerror = () => { if (btnIcon) btnIcon.style.color = '#c4b3a6'; };

            window.speechSynthesis.speak(utterance);
        };
`;
    lines.splice(handleTtsIdx, 0, playItemTtsCode);
} else {
    console.error('handleTts not found');
    process.exit(1);
}

// 2. Inject button creation inside renderLabel
const renderLabelInjectIdx = lines.findIndex(l => l.includes("document.getElementById('btn-home').textContent = uiLabels.homeBtn[lang];"));
if (renderLabelInjectIdx !== -1) {
    const btnInjectCode = `
            const ttsItems = ['volume', 'functional', 'batchno', 'expiration', 'manufacturer', 'concept-ingredients', 'clinical', 'ingredients', 'how-to-use', 'cautions', 'customer'];
            ttsItems.forEach(itemId => {
                const th = document.getElementById('label-' + itemId);
                if (th) {
                    const btn = document.createElement('button');
                    btn.className = 'item-tts-btn';
                    btn.style.marginLeft = '6px';
                    btn.style.background = 'none';
                    btn.style.border = 'none';
                    btn.style.padding = '0';
                    btn.style.cursor = 'pointer';
                    btn.title = '이 항목 듣기';
                    btn.innerHTML = '<span class="material-icons" style="font-size:18px; color:#c4b3a6; vertical-align:-3px; transition: color 0.2s;">volume_up</span>';
                    btn.onclick = (e) => window.playItemTts(itemId, e);
                    
                    if (itemId === 'concept-ingredients') {
                        const br = th.querySelector('br');
                        if (br) th.insertBefore(btn, br);
                        else th.appendChild(btn);
                    } else {
                        th.appendChild(btn);
                    }
                }
            });
`;
    lines.splice(renderLabelInjectIdx + 1, 0, btnInjectCode);
} else {
    console.error('renderLabel injection point not found');
    process.exit(1);
}

fs.writeFileSync('index.html', lines.join('\n'), 'utf8');
console.log('Successfully patched index.html');
