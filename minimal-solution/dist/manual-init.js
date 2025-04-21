// Manual initialization for Three.js components
(function() {
  // Wait for all critical modules to load
  window.addEventListener('load', function() {
    setTimeout(function() {
      console.log('Attempting to manually initialize 3D scene...');
      
      try {
        // Check if Three.js was loaded
        if (typeof THREE === 'undefined') {
          console.error('THREE.js not found! Loading failed.');
          return;
        }
        
        console.log('THREE.js found! Version:', THREE.REVISION);
        
        // Try to get canvas element
        const canvas = document.querySelector('canvas');
        if (!canvas) {
          console.error('Canvas element not found!');
          return;
        }
        
        // Create a basic scene if one doesn't exist
        if (!window.__sceneInitialized) {
          console.log('Initializing fallback 3D scene...');
          
          // Create a basic scene
          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0x0a0a0a);
          
          // Create a camera
          const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.z = 15;
          
          // Create a renderer
          const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
          renderer.setSize(window.innerWidth, window.innerHeight);
          
          // Create a grid of cubes instead of using instancedMesh
          const cubes = [];
          const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
          const material = new THREE.MeshBasicMaterial({ color: 0x1e88e5 });
          
          // Create cubes in a grid formation
          const count = Math.min(500, window.innerWidth > 768 ? 500 : 200); // Fewer on mobile
          const size = 20;
          
          for (let i = 0; i < count; i++) {
            const cube = new THREE.Mesh(geometry, material);
            
            // Position in a sphere-like formation
            const radius = 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            cube.position.x = radius * Math.sin(phi) * Math.cos(theta);
            cube.position.y = radius * Math.sin(phi) * Math.sin(theta);
            cube.position.z = radius * Math.cos(phi);
            
            // Random scale for variety
            const scale = Math.random() * 0.5 + 0.5;
            cube.scale.set(scale, scale, scale);
            
            scene.add(cube);
            cubes.push(cube);
          }
          
          // Animation function
          function animate() {
            requestAnimationFrame(animate);
            
            // Rotate each cube
            cubes.forEach((cube, i) => {
              cube.rotation.x += 0.01;
              cube.rotation.y += 0.005;
              
              // Add slight movement
              cube.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
            });
            
            // Handle camera movement on mouse move
            document.addEventListener('mousemove', function(event) {
              camera.position.x = (event.clientX - window.innerWidth / 2) * 0.01;
              camera.position.y = (event.clientY - window.innerHeight / 2) * -0.01;
              camera.lookAt(scene.position);
            });
            
            renderer.render(scene, camera);
          }
          
          // Handle window resize
          window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          });
          
          // Start animation loop
          animate();
          
          window.__sceneInitialized = true;
        }
      } catch (err) {
        console.error('Error initializing 3D scene:', err);
      }
    }, 1000); // Wait 1 second after load
  });
})(); 