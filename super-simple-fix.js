const fs = require('fs');
const path = require('path');

// Process HTML files in the out directory
const htmlFiles = [
  path.join(__dirname, 'out', 'index.html'),
  path.join(__dirname, 'out', '404.html'),
  path.join(__dirname, 'out', '404', 'index.html')
];

// Process each HTML file
htmlFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Processing: ${filePath}`);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // 1. Replace all Next.js asset URLs with our PHP handler
    html = html.replace(/src="(\.\/)?_next\//g, 'src="static-asset.php?f=_next/');
    html = html.replace(/href="(\.\/)?_next\/static\/css/g, 'href="static-asset.php?f=_next/static/css');
    
    // 2. Add a minimal script to handle dynamic loading issues
    const fixScript = `
    <script>
      // Intercept asset loading errors
      window.addEventListener('error', function(e) {
        if (e.target && (e.target.src || e.target.href)) {
          var url = e.target.src || e.target.href;
          
          // Check if it's a Next.js asset and not already using our handler
          if (url.includes('/_next/') && !url.includes('static-asset.php')) {
            var newUrl = url.replace(/\/_next\//, '/static-asset.php?f=_next/');
            console.log('Fixing asset URL:', url, '->', newUrl);
            
            if (e.target.src) e.target.src = newUrl;
            if (e.target.href) e.target.href = newUrl;
          }
        }
      }, true);
      
      // Override fetch for chunks
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (typeof url === 'string' && url.includes('/_next/') && !url.includes('static-asset.php')) {
          url = url.replace(/\/_next\//, '/static-asset.php?f=_next/');
        }
        return originalFetch.call(this, url, options);
      };
    </script>
    `;
    
    // Insert fix script right after <body> tag
    const bodyPos = html.indexOf('<body');
    if (bodyPos !== -1) {
      const bodyEndPos = html.indexOf('>', bodyPos);
      if (bodyEndPos !== -1) {
        html = html.slice(0, bodyEndPos + 1) + fixScript + html.slice(bodyEndPos + 1);
      }
    }
    
    // 3. Save the fixed HTML
    fs.writeFileSync(filePath, html);
    console.log(`Fixed: ${filePath}`);
  }
});

// Now modify the main JS chunk files to use the PHP handler
const jsChunksDir = path.join(__dirname, 'out', '_next', 'static', 'chunks');
if (fs.existsSync(jsChunksDir)) {
  processJsDirectory(jsChunksDir);
}

function processJsDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      processJsDirectory(fullPath);
    } else if (item.name.endsWith('.js')) {
      fixJsFile(fullPath);
    }
  });
}

function fixJsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Look for references to Next.js chunks
  if (content.includes('/_next/') || content.includes('"_next/')) {
    console.log(`Fixing JS file: ${filePath}`);
    
    // Replace chunk loading paths
    let fixed = content
      .replace(/"\/_next\//g, '"/static-asset.php?f=_next/')
      .replace(/"_next\//g, '"static-asset.php?f=_next/');
    
    fs.writeFileSync(filePath, fixed);
  }
}

console.log('All files processed with simplified fixes!'); 