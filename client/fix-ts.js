const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Fix Typography fontWeight
      content = content.replace(/<Typography([^>]+)fontWeight="bold"(.*?)>/g, (match, p1, p2) => {
        if (p1.includes('sx={{') || p2.includes('sx={{')) {
          return match.replace(/fontWeight="bold"/, '').replace(/sx=\{\{/, "sx={{ fontWeight: 'bold', ");
        } else {
          return `<Typography${p1}sx={{ fontWeight: 'bold' }}${p2}>`;
        }
      });
      
      // Fix Grid item -> size
      content = content.replace(/<Grid item xs=\{([^\}]+)\}(.*?)>/g, '<Grid size={{ xs: $1 }}$2>');
      content = content.replace(/<Grid item(.*?)>/g, '<Grid$1>');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
