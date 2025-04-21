<?php
// Super simple asset handler for Next.js static files
// Usage: asset.php?f=_next/static/chunks/file.js

// Allow cross-origin requests (important for fonts and some dynamic imports)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

// Get the file path from the query parameter
$file = isset($_GET['f']) ? $_GET['f'] : '';

if (empty($file)) {
    header("HTTP/1.0 400 Bad Request");
    echo "Missing file parameter";
    exit;
}

// Security check - only allow access to _next directory
if (strpos($file, '_next/') !== 0) {
    header("HTTP/1.0 403 Forbidden");
    echo "Access denied";
    exit;
}

// Get the file path on the server
$filePath = __DIR__ . '/' . $file;

// Check if the file exists
if (!file_exists($filePath)) {
    header("HTTP/1.0 404 Not Found");
    echo "File not found: " . htmlspecialchars($file);
    exit;
}

// Get the file extension
$ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

// Set the content type based on the file extension
$contentTypes = [
    'js'    => 'application/javascript',
    'mjs'   => 'application/javascript',
    'css'   => 'text/css',
    'json'  => 'application/json',
    'woff'  => 'font/woff',
    'woff2' => 'font/woff2',
    'ttf'   => 'font/ttf',
    'svg'   => 'image/svg+xml',
    'png'   => 'image/png',
    'jpg'   => 'image/jpeg',
    'jpeg'  => 'image/jpeg',
    'gif'   => 'image/gif',
];

// Set the appropriate content type
if (isset($contentTypes[$ext])) {
    header('Content-Type: ' . $contentTypes[$ext]);
} else {
    header('Content-Type: application/octet-stream');
}

// Set caching headers
header('Cache-Control: public, max-age=31536000');

// Output the file
readfile($filePath);
exit;
?> 