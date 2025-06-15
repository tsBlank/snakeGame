<?php


require_once 'db_config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Méthode non autorisée.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'));

if (!isset($data->playerName) || empty(trim($data->playerName)) || !isset($data->score)) {
    http_response_code(400);
    echo json_encode(['message' => 'Données manquantes ou invalides.']);
    exit();
}

$playerName = htmlspecialchars(strip_tags($data->playerName));
$score = (int)$data->score;

try {
    $sql = "INSERT INTO scores (playerName, score) VALUES (:playerName, :score)";
    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(':playerName', $playerName);
    $stmt->bindParam(':score', $score);
    $stmt->execute();

    http_response_code(201); // Created
    echo json_encode(['message' => 'Score sauvegardé avec succès !']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erreur lors de la sauvegarde du score.']);
}
?>