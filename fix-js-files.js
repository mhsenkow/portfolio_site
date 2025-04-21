const fs = require('fs');
const path = require('path');

// Find all JavaScript files in the _next directory and modify them
function processJsFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processJsFiles(fullPath);
    } else if (file.name.endsWith('.js')) {
      modifyJsFile(fullPath);
    }
  }
}

// Modify JavaScript files to use our assets.php handler
function modifyJsFile(filePath) {
  console.log(`Processing JS file: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Look for dynamic imports or chunk loading
    if (content.includes('/_next/') || content.includes('"_next/')) {
      // Replace dynamic imports to use our assets.php handler
      content = content.replace(/"\/_next\//g, '"/assets.php?file=_next/');
      content = content.replace(/"_next\//g, '"assets.php?file=_next/');
      
      // Write the modified file
      fs.writeFileSync(filePath, content);
      console.log(`  Modified: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Start processing from the out/_next directory
const nextDir = path.join(__dirname, 'out', '_next');
if (fs.existsSync(nextDir)) {
  processJsFiles(nextDir);
  console.log('All JavaScript files processed successfully!');
} else {
  console.error('_next directory not found!');
} 