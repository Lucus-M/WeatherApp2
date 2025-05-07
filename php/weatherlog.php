

<?php
/*
    File: weatherlog.php
    Author: Lucus Mulhorn
    Created: 1/28/2025
    Last Updated: 5/6/2025
    Purpose: Accepts zip code and location from a client and logs it into the database. 
    (this is not the actual version used in the application, passwords and keys are hidden for public viewing.)
*/
// Set header to allow cross-origin requests and return JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
    exit;
}

// Read the raw input
$input = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($input['zip']) || !isset($input['location'])) {
    echo json_encode(["status" => "error", "message" => "Missing zip or location."]);
    exit;
}

// retrieve zip and location from input
$zip = trim($input['zip']);
$location = trim($input['location']);

// zip code hashing using SHA-256
$hashedZip = hash('sha256', $zip);

// location encryption using AES-256-CBC
$secretKey = "_";  // encryption key hidden for github
$iv = openssl_random_pseudo_bytes(16);  // initialization vector (16 bytes)
$encryptedLocation = openssl_encrypt($location, 'AES-256-CBC', $secretKey, 0, $iv);

// Database connection settings
$host = 'localhost';
$db = 'weather_logs';
$user = 'admin';
$pass = '_'; // real password hidden for github

try {
    // Create a new PDO instance
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Prepare the insert statement (store hashed zip and encrypted location)
    $stmt = $pdo->prepare("INSERT INTO logs (zip, location, date_time) VALUES (:zip, :location, NOW())");
    $stmt->execute([
        ':zip' => $hashedZip,
        ':location' => base64_encode($encryptedLocation)  // Storing base64-encoded encrypted location for safe storage
    ]);

    echo json_encode(["status" => "success", "message" => "Data logged successfully."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    exit;
}
?>
