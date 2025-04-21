const fs = require('fs');
const path = require('path');

// Read the source HTML files
const sourceDir = path.join(__dirname, '..', 'out');
const targetDir = path.join(__dirname, 'dist');

// Create the target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy the asset.php file to the target directory
fs.copyFileSync(path.join(__dirname, 'asset.php'), path.join(targetDir, 'asset.php'));

// Create a simple index.php that includes index.html
const indexPhp = `<?php
// Simply include the HTML file
include 'index.html';
?>`;
fs.writeFileSync(path.join(targetDir, 'index.php'), indexPhp);

// Create a simple critical assets loader script
const loaderJs = `// Helper for loading critical assets
function loadCriticalAsset(path, type) {
  return new Promise((resolve, reject) => {
    const url = 'asset.php?f=' + path;
    
    if (type === 'script') {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    } else if (type === 'style') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    }
  });
}

// Function to load all critical assets
function loadCriticalAssets() {
  return Promise.all([
    loadCriticalAsset('_next/static/chunks/webpack-811b139a8ca1f062.js', 'script'),
    loadCriticalAsset('_next/static/chunks/fd9d1056-f76818db8f2ee2d9.js', 'script'),
    loadCriticalAsset('_next/static/chunks/864-2bd1bb7ca1f55d6f.js', 'script'),
    loadCriticalAsset('_next/static/chunks/main-app-09ef4ec6aee82225.js', 'script'),
    loadCriticalAsset('_next/static/css/b1ce4f56c3af9c94.css', 'style')
  ]);
}
`;
fs.writeFileSync(path.join(targetDir, 'loader.js'), loaderJs);

// Process HTML files
const htmlFiles = [
  { src: path.join(sourceDir, 'index.html'), dest: path.join(targetDir, 'index.html') },
  { src: path.join(sourceDir, '404.html'), dest: path.join(targetDir, '404.html') }
];

htmlFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    console.log(`Processing: ${src}`);
    
    // Read the HTML file
    let html = fs.readFileSync(src, 'utf8');
    
    // Remove any existing scripts and fix links
    html = html.replace(/<script[^>]*>.*?<\/script>/gs, '');
    
    // Replace asset references with our asset handler
    html = html.replace(/src="(\.\/)?(_next\/[^"]+)"/g, 'src="asset.php?f=$2"');
    html = html.replace(/href="(\.\/)?(_next\/static\/css[^"]+)"/g, 'href="asset.php?f=$2"');
    
    // Remove any other scripts
    html = html.replace(/<script[^>]*>.*?<\/script>/gs, '');
    
    // Add our loader script
    html = html.replace('</head>', '<script src="loader.js"></script></head>');
    
    // Add our fix script
    const fixScript = `
<script>
// Direct fix for all asset loading
(function() {
  // Fix asset errors
  window.addEventListener('error', function(e) {
    if (e.target && (e.target.src || e.target.href)) {
      var url = e.target.src || e.target.href;
      if (url.includes('/_next/')) {
        console.log('Fixing asset URL:', url);
        var newUrl = 'asset.php?f=' + url.split('/_next/')[1];
        
        if (e.target.src) e.target.src = newUrl;
        if (e.target.href) e.target.href = newUrl;
      }
    }
  }, true);
  
  // Fix dynamic fetch calls
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('/_next/')) {
      url = 'asset.php?f=' + url.split('/_next/')[1];
    }
    return originalFetch.call(this, url, options);
  };
  
  // Try to load critical assets after a delay
  setTimeout(function() {
    if (typeof loadCriticalAssets === 'function') {
      console.log('Loading critical assets...');
      loadCriticalAssets()
        .then(() => console.log('Assets loaded successfully'))
        .catch(err => console.error('Error loading assets:', err));
    }
  }, 1000);
})();
</script>`;

    // Add the fix script at the beginning of the body
    html = html.replace('<body', fixScript + '<body');
    
    // Write the fixed HTML file
    fs.writeFileSync(dest, html);
    console.log(`Fixed HTML written to: ${dest}`);
  }
});

// Copy the _next directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy the _next directory
const nextSrcDir = path.join(sourceDir, '_next');
const nextDestDir = path.join(targetDir, '_next');
if (fs.existsSync(nextSrcDir)) {
  console.log(`Copying _next directory...`);
  copyDir(nextSrcDir, nextDestDir);
  console.log(`_next directory copied to: ${nextDestDir}`);
}

// Create a minimal .htaccess
const htaccess = `# Basic MIME types
AddType application/javascript .js
AddType text/css .css
AddType font/woff2 .woff2
AddType application/json .json
AddType image/svg+xml .svg

# Disable directory listing
Options -Indexes`;

fs.writeFileSync(path.join(targetDir, '.htaccess'), htaccess);
console.log(`.htaccess written to: ${path.join(targetDir, '.htaccess')}`);

console.log('All files processed successfully!');
console.log(`Upload the contents of the '${targetDir}' directory to your GreenGeeks hosting.`); 