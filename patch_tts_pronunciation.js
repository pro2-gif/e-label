const fs = require('fs');

let lines = fs.readFileSync('index.html', 'utf8').split('\n');

const ttsStartIdx = lines.findIndex(l => l.includes('// 문장 단위로 쪼개기 (사파리 호환성을 위해 Lookbehind 정규식 제거)'));
const nextCommentIdx = ttsStartIdx; // Since we are inserting right before it

if (ttsStartIdx !== -1 && nextCommentIdx !== -1) {
    const newFixes = `
            // 발음 교정 (TTS 전용)
            // 1. "sh" 독립 단어를 스펠링(에스에이치 / S H)으로 읽도록 교정
            if (currentLang === 'en') {
                fullText = fullText.replace(/\\bsh\\b/gi, 'S H');
            } else {
                fullText = fullText.replace(/\\bsh\\b/gi, '에스에이치');
            }
            
            // 2. 모든 '-' 기호를 띄어쓰기로 변경하여 "마이너스"로 읽는 현상 방지
            fullText = fullText.replace(/-/g, ' ');
`;
    // Insert new fixes right before the `if (currentLang === 'en') { ... replace INTOMEDI ... }` block
    lines.splice(ttsStartIdx, 0, newFixes);
    
    fs.writeFileSync('index.html', lines.join('\n'), 'utf8');
    console.log("Successfully patched index.html");
} else {
    console.error("Target block not found");
    process.exit(1);
}
