// Initialization script for Next.js application
(function() {
  // Wait for DOM content to be loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Load all critical assets
    loadCriticalAssets()
      .then(function() {
        console.log('All assets loaded successfully, hydrating React...');
        
        // If normal hydration doesn't happen, manually trigger it
        setTimeout(function() {
          // Check if React has hydrated the page
          if (!window.__NEXT_HYDRATED) {
            console.log('Manual hydration triggered...');
            
            // Try to access Next.js runtime
            if (window.__NEXT_DATA__ && window.__next) {
              try {
                // Force hydration
                window.__next.router.reload();
                console.log('Next.js router reloaded');
              } catch (e) {
                console.error('Failed to manually hydrate React:', e);
              }
            }
          }
        }, 2000);
      })
      .catch(function(err) {
        console.error('Failed to load assets:', err);
      });
  });
  
  // Set up global error handler
  window.addEventListener('error', function(e) {
    console.error('Global error:', e.error || e.message);
  });
  
  // Flag to track hydration status
  window.__NEXT_HYDRATED = false;
  
  // Create the Next data object if it doesn't exist
  if (!window.__NEXT_DATA__) {
    window.__NEXT_DATA__ = {
      props: { pageProps: {} },
      page: "/",
      query: {},
      buildId: document.querySelector('meta[name="next-build-id"]')?.content || "unknown"
    };
  }
})(); 