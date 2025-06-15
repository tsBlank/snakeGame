<?php

require_once 'db_config.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT playerName, score FROM scores ORDER BY score DESC LIMIT 10";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($scores);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Impossible de récupérer les scores.']);
}
?>