// Simple Three.js loader for /dist/ subfolder
(function() {
  // Define CDN fallbacks for Three.js in case local files don't work
  const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.min.js';
  
  // Try to load Three.js from CDN as a backup
  function loadThreeFromCDN() {
    console.log('Attempting to load Three.js from CDN...');
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = THREE_CDN;
      script.async = true;
      script.onload = () => {
        console.log('Successfully loaded Three.js from CDN');
        resolve();
      };
      script.onerror = (err) => {
        console.error('Failed to load Three.js from CDN', err);
        reject(err);
      };
      document.head.appendChild(script);
    });
  }
  
  // Check if Three.js loads successfully from our local files
  window.addEventListener('load', function() {
    setTimeout(function() {
      // If THREE is not defined after all local scripts have loaded, try CDN
      if (typeof THREE === 'undefined') {
        console.log('THREE not found, trying CDN backup...');
        loadThreeFromCDN()
          .then(() => {
            console.log('THREE loaded from CDN');
            // Check if we have the global init function from the main HTML
            if (typeof initScene === 'function') {
              initScene();
            }
          })
          .catch(err => {
            console.error('Failed to load THREE from all sources', err);
          });
      } else {
        console.log('THREE already loaded successfully');
      }
    }, 2000);
  });
})(); 