const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `concept = Array.from(conceptContainer.querySelectorAll('.ingredient-badge'))`;
const replacementStr = `concept = Array.from(conceptContainer.querySelectorAll('.concept-badge'))`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('index.html', content, 'utf8');
    console.log("Successfully patched index.html");
} else {
    console.error("Target string not found in index.html");
    process.exit(1);
}
