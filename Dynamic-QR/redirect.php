<?php
header('Content-Type: text/plain');

// Load redirect mappings
$redirectsFile = __DIR__ . '/qr-data.json';
$redirects = json_decode(file_get_contents($redirectsFile), true) ?? [];

// Parse request (format: /redirect.php/{redirectId}-{language})
$requestUri = trim($_SERVER['REQUEST_URI'], '/');
$parts = explode('/', $requestUri);
$idWithLang = end($parts);

// Split into ID and language
$dashPos = strrpos($idWithLang, '-');
if ($dashPos === false) {
    header("HTTP/1.0 404 Not Found");
    die("Invalid QR code format");
}

$redirectId = substr($idWithLang, 0, $dashPos);
$language = substr($idWithLang, $dashPos + 1);

// Find and redirect to the current destination
if (isset($redirects[$redirectId][$language])) {
    header("Location: " . $redirects[$redirectId][$language]);
    exit();
} else {
    header("HTTP/1.0 404 Not Found");
    echo "QR code destination not found for ID: $redirectId and language: $language";
    exit();
}
?>