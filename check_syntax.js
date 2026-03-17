const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\kiuy2\\Documents\\Parts Order site\\doll-parts-system\\index.html', 'utf8');
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    const script = scriptMatch[1];
    try {
        new Function(script);
        console.log('Script is syntactically correct.');
    } catch (e) {
        console.error('Syntax Error found:', e.message);
        const lines = script.split('\n');
        // Try to find the line
        console.error('Context:', e.stack);
    }
} else {
    console.error('No script block found.');
}
