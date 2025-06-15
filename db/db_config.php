<?php

$host = 'mysql-tsblank.alwaysdata.net';
$db_name = 'tsblank_snakegame';
$username = 'tsblank';
$password = 'Root_95*';

// ------------------------------------------

try {
    
    $pdo = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    
  
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Erreur de connexion à la base de données.',
        'erreur_details' => $e->getMessage()
    ]);
    exit();
}
?>