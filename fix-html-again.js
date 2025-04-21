const fs = require('fs');
const path = require('path');

// HTML files to process
const htmlFiles = [
  path.join(__dirname, 'out', 'index.html'),
  path.join(__dirname, 'out', '404.html'),
  path.join(__dirname, 'out', '404', 'index.html')
];

// Process each file
htmlFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Processing: ${filePath}`);
    
    // Read the file
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Add our helper script reference to the head
    const headEndIndex = html.indexOf('</head>');
    if (headEndIndex !== -1) {
      const helperScript = '<script src="load-assets.js"></script>';
      html = html.slice(0, headEndIndex) + helperScript + html.slice(headEndIndex);
    }
    
    // Add a script to trigger manual loading after 3 seconds if the site isn't loaded yet
    const bodyEndIndex = html.indexOf('</body>');
    if (bodyEndIndex !== -1) {
      const autoloadScript = `
      <script>
        // Auto-load critical assets after timeout if needed
        setTimeout(function() {
          // Check if the site is loaded properly
          if (!window.siteLoaded && typeof loadCriticalAssets === 'function') {
            console.log('Site not loaded after timeout, trying manual asset loading...');
            loadCriticalAssets()
              .then(() => console.log('Manual loading complete!'))
              .catch(err => console.error('Manual loading failed:', err));
          }
        }, 3000);
        
        // Mark the site as loaded when it's ready
        window.addEventListener('load', function() {
          window.siteLoaded = true;
        });
      </script>
      `;
      
      html = html.slice(0, bodyEndIndex) + autoloadScript + html.slice(bodyEndIndex);
    }
    
    // Write the modified file
    fs.writeFileSync(filePath, html);
    console.log(`Fixed: ${filePath}`);
  }
});

console.log('All HTML files updated with helper script references!'); 