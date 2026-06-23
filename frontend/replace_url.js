const fs = require('fs');
const path = require('path');

const directory = 'src';
const searchRegex = /"http:\/\/localhost:8000(\/[^"]*)"/g;
const backtickRegex = /`http:\/\/localhost:8000(\/[^`]*)`/g;

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(directory);
const API_URL_EXPR = "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}";

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // Replace "http://localhost:8000/..."
    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, (match, pathGroup) => {
            return `\`${API_URL_EXPR}${pathGroup}\``;
        });
        changed = true;
    }
    
    // Replace `http://localhost:8000/...`
    if (backtickRegex.test(content)) {
        content = content.replace(backtickRegex, (match, pathGroup) => {
            return `\`${API_URL_EXPR}${pathGroup}\``;
        });
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
console.log('Done.');
