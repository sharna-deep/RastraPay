<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection parameters
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "signup_info";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get form data
$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$card_id = $_POST['card_id'];
$user_type = $_POST['user_type'];

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO signup_details (name, email, phone, card_id, user_type) VALUES (?, ?, ?, ?, ?)");
if (!$stmt) {
    die("Error preparing statement: " . $conn->error);
}
$stmt->bind_param("sssss", $name, $email, $phone, $card_id, $user_type);

// Execute the statement
if ($stmt->execute()) {
    echo "Registration successful!";
    // Redirect to success page
    header("Location: success.php");
    exit();
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
