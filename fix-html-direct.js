const fs = require('fs');
const path = require('path');

// Process all HTML files and modify them directly
function processHtmlFiles() {
  const htmlFiles = [
    path.join(__dirname, 'out', 'index.html'),
    path.join(__dirname, 'out', '404.html'),
    path.join(__dirname, 'out', '404', 'index.html')
  ];

  htmlFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`Processing HTML file: ${filePath}`);
      
      // Read the file
      let html = fs.readFileSync(filePath, 'utf8');
      
      // Modify script sources directly to use assets.php handler
      html = html.replace(/(src="[^"]*\/_next\/)/g, 'src="./assets.php?file=_next/');
      html = html.replace(/(src="[^"]*_next\/)/g, 'src="./assets.php?file=_next/');
      
      // Modify CSS href attributes 
      html = html.replace(/(href="[^"]*\/_next\/static\/css)/g, 'href="./assets.php?file=_next/static/css');
      
      // Add a special failsafe script at the top of the body
      const bodyStartIndex = html.indexOf('<body');
      if (bodyStartIndex !== -1) {
        const bodyTagEndIndex = html.indexOf('>', bodyStartIndex);
        if (bodyTagEndIndex !== -1) {
          const failsafeScript = `
          <script>
            // This script runs immediately when the body starts loading
            (function() {
              // Utility function to generate a PHP asset URL
              function toAssetUrl(url) {
                if (url.includes('/_next/')) {
                  return url.replace('/_next/', './assets.php?file=_next/');
                }
                if (url.includes('_next/')) {
                  return url.replace('_next/', './assets.php?file=_next/');
                }
                return url;
              }
              
              // Override the native fetch to handle _next file URLs
              const originalFetch = window.fetch;
              window.fetch = function(url, options) {
                if (typeof url === 'string' && url.includes('_next/')) {
                  url = toAssetUrl(url);
                }
                return originalFetch.call(this, url, options);
              };
              
              // Override XMLHttpRequest.open to intercept _next file URLs
              const originalOpen = XMLHttpRequest.prototype.open;
              XMLHttpRequest.prototype.open = function(method, url, ...args) {
                if (typeof url === 'string' && url.includes('_next/')) {
                  url = toAssetUrl(url);
                }
                return originalOpen.call(this, method, url, ...args);
              };
              
              // Create a special loadScript helper
              window.loadScript = function(src) {
                return new Promise((resolve, reject) => {
                  const script = document.createElement('script');
                  script.src = toAssetUrl(src);
                  script.onload = resolve;
                  script.onerror = () => {
                    console.error('Failed to load script:', src);
                    reject(new Error('Script load error'));
                  };
                  document.head.appendChild(script);
                });
              };
            })();
          </script>
          `;
          
          html = html.slice(0, bodyTagEndIndex + 1) + failsafeScript + html.slice(bodyTagEndIndex + 1);
        }
      }
      
      // Write the modified file
      fs.writeFileSync(filePath, html);
      console.log(`  Modified: ${filePath}`);
    }
  });

  console.log('All HTML files processed successfully!');
}

// Run the processor
processHtmlFiles(); 