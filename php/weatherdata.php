<?php
header("Access-Control-Allow-Origin: *"); // allow requests from any origin
header("Content-Type: application/json");

$apiKey = "_"; // API key goes here (hidden for security)

// balidate and sanitize input
$zip = isset($_GET['zip']) ? trim($_GET['zip']) : "";
$country = isset($_GET['country']) ? strtoupper(trim($_GET['country'])) : "";

// check if zip is exactly 5 digits
if (!preg_match("/^\d{5}$/", $zip)) {
    echo json_encode(["error" => "Invalid zip code. Must be a 5-digit number."]);
    exit;
}

// check if country is exactly 2 alphabetic characters
if (!preg_match("/^[A-Z]{2}$/", $country)) {
    echo json_encode(["error" => "Invalid country code. Must be a 2-letter country code."]);
    exit;
}

$url = "https://api.openweathermap.org/data/2.5/forecast?zip={$zip},{$country}&appid={$apiKey}";

try {
    $response = file_get_contents($url);

    if ($response === FALSE) {
        throw new Exception("Error fetching weather data.");
    }

    echo $response; // return the API response to the frontend
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>