<?php
header('Content-Type: application/json');

$dataFile = __DIR__ . '/qr-data.json';
$redirects = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];

$action = $_REQUEST['action'] ?? '';

try {
    switch ($action) {
        case 'get':
            echo json_encode($redirects);
            break;
            
        case 'save':
            $id = $_POST['id'] ?? '';
            $lang = $_POST['lang'] ?? '';
            $url = $_POST['url'] ?? '';
            
            if (empty($id) || empty($lang) || empty($url)) {
                throw new Exception('All fields are required');
            }
            
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                throw new Exception('Invalid URL format');
            }
            
            if (!isset($redirects[$id])) {
                $redirects[$id] = [];
            }
            
            $redirects[$id][$lang] = $url;
            file_put_contents($dataFile, json_encode($redirects, JSON_PRETTY_PRINT));
            
            echo json_encode(['success' => true]);
            break;
            
        case 'delete':
            $id = $_POST['id'] ?? '';
            $lang = $_POST['lang'] ?? '';
            
            if (empty($id) || empty($lang)) {
                throw new Exception('ID and language are required');
            }
            
            if (isset($redirects[$id][$lang])) {
                unset($redirects[$id][$lang]);
                
                // Remove the ID completely if no languages left
                if (empty($redirects[$id])) {
                    unset($redirects[$id]);
                }
                
                file_put_contents($dataFile, json_encode($redirects, JSON_PRETTY_PRINT));
            }
            
            echo json_encode(['success' => true]);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>