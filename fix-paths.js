const fs = require('fs');
const path = require('path');

// Directory with HTML files
const outDir = path.join(__dirname, 'out');

// Process all HTML files
function processHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      processHtmlFiles(filePath); // Recursively process subdirectories
    } else if (file.endsWith('.html')) {
      fixHtmlFile(filePath);
    }
  });
}

// Fix paths in HTML file
function fixHtmlFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Remove any domain references in URLs to make them relative
  html = html.replace(/https?:\/\/[^\/]+\//g, '/');
  
  // Convert all absolute paths to relative paths
  html = html.replace(/="\/(_next\/[^"]+)"/g, '="./_next/$1"');
  html = html.replace(/="\/_next\//g, '="./_next/');
  
  // Fix other asset paths that are absolute but should be relative
  html = html.replace(/="\/([^"/_][^"]+)"/g, '="./$1"');
  
  // Fix any double dots that may have been introduced
  html = html.replace(/="\.\.\/\.\.\//g, '="./');
  
  // Fix any malformed paths from fixes
  html = html.replace(/="\.\/\//g, '="./');
  
  // Add inline script to handle path issues
  const bodyEndIndex = html.indexOf('</body>');
  if (bodyEndIndex !== -1) {
    const fixScript = `
    <script>
      // Detect and fix 404 errors for script and stylesheet loading
      window.addEventListener('error', function(e) {
        if (e.target && (e.target.src || e.target.href)) {
          var resource = e.target.src || e.target.href;
          console.log('Resource failed to load:', resource);
          
          // Try to fix common path issues
          if (resource.includes('/_next/')) {
            var newResource = resource.replace('/_next/', './_next/');
            console.log('Attempting to fix path:', resource, '->', newResource);
            
            if (e.target.src) e.target.src = newResource;
            if (e.target.href) e.target.href = newResource;
          }
          else if (resource.includes('mhsenkow.org/_next/')) {
            var newResource = resource.replace('mhsenkow.org/_next/', 'mhsenkow.org/./_next/');
            console.log('Attempting to fix path:', resource, '->', newResource);
            
            if (e.target.src) e.target.src = newResource;
            if (e.target.href) e.target.href = newResource;
          }
        }
      }, true);
      
      // After DOM content loaded, proactively check and fix resource paths
      document.addEventListener('DOMContentLoaded', function() {
        // Fix script tags
        document.querySelectorAll('script[src]').forEach(function(script) {
          if (script.src.includes('/_next/')) {
            script.src = script.src.replace('/_next/', './_next/');
          }
        });
        
        // Fix link tags (CSS, etc)
        document.querySelectorAll('link[href]').forEach(function(link) {
          if (link.href.includes('/_next/')) {
            link.href = link.href.replace('/_next/', './_next/');
          }
        });
      });
    </script>
    `;
    
    html = html.slice(0, bodyEndIndex) + fixScript + html.slice(bodyEndIndex);
  }
  
  fs.writeFileSync(filePath, html);
  console.log(`Fixed: ${filePath}`);
}

// Start processing
processHtmlFiles(outDir);
console.log('All HTML files processed successfully!'); 