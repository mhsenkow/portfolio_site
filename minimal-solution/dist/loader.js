// Simple asset loader for Three.js
function loadAsset(src, type = 'script') {
  return new Promise((resolve, reject) => {
    if (type === 'script') {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        console.log('Loaded script:', src);
        resolve(script);
      };
      script.onerror = (err) => {
        console.error('Failed to load script:', src, err);
        reject(err);
      };
      document.head.appendChild(script);
    } else if (type === 'style') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = src;
      link.onload = () => {
        console.log('Loaded style:', src);
        resolve(link);
      };
      link.onerror = (err) => {
        console.error('Failed to load style:', src, err);
        reject(err);
      };
      document.head.appendChild(link);
    }
  });
}

// Fix common path issues
function fixUrl(url) {
  // If it's a root-relative URL, make it relative to current directory
  if (url.startsWith('/') && !url.startsWith('//')) {
    return '.' + url;
  }
  
  // If it's an absolute URL to our domain, make it relative
  const currentDomain = window.location.origin;
  if (url.startsWith(currentDomain)) {
    return '.' + url.substring(currentDomain.length);
  }
  
  return url;
}

// Patch fetch to fix paths
function patchFetch() {
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string') {
      url = fixUrl(url);
    }
    return originalFetch.call(this, url, options);
  };
}

// Patch XMLHttpRequest to fix paths
function patchXHR() {
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string') {
      url = fixUrl(url);
    }
    return originalOpen.call(this, method, url, ...args);
  };
}

// Initialize path fixing
patchFetch();
patchXHR();

// Export functions
window.loadAsset = loadAsset;
window.fixUrl = fixUrl;
