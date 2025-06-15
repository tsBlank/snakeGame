// --- Initialisation des éléments du DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const submitScoreButton = document.getElementById('submitScoreButton');
const playerNameInput = document.getElementById('playerName');
const highScoreList = document.getElementById('highScoreList');

// --- Constantes du jeu ---
const GRID_SIZE = 20;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// --- Variables d'état du jeu ---
let snake = [ { x: 10 * GRID_SIZE, y: 10 * GRID_SIZE } ];
let food = {};
let dx = GRID_SIZE;
let dy = 0;
let score = 0;
let changingDirection = false;
let gameRunning = true;
let gameSpeed = 100;


// --- Fonctions de communication avec le serveur ---

async function saveScore() {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Veuillez entrer un nom !");
        return;
    }

    try {
        const response = await fetch('db/save_score.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName, score }),
        });

        if (!response.ok) throw new Error('La sauvegarde a échoué.');

        alert('Score sauvegardé !');
        submitScoreButton.disabled = true;
        playerNameInput.disabled = true;
        

        displayHighScores();

    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Impossible de sauvegarder le score.');
    }
}

async function displayHighScores() {
    try {
        const response = await fetch('db/get_scores.php');
        const scores = await response.json();

        highScoreList.innerHTML = '';

        if (scores.length === 0) {
            highScoreList.innerHTML = '<li>Aucun score pour le moment.</li>';
        } else {
            scores.forEach(score => {
                const li = document.createElement('li');
                li.textContent = `${score.playerName} - ${score.score}`;
                highScoreList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Erreur de récupération des scores:', error);
        highScoreList.innerHTML = '<li>Impossible de charger les scores.</li>';
    }
}


// --- Fonctions de logique du jeu ---

function main() {
    if (!gameRunning) {
        showGameOverScreen();
        return;
    }
    changingDirection = false;
    setTimeout(function onTick() {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        main();
    }, gameSpeed); 
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawSnake() {
    snake.forEach(part => {
        ctx.fillStyle = 'lightgreen';
        ctx.strokeStyle = 'darkgreen';
        ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        updateSpeed();
        generateFood();
    } else {
        snake.pop();
    }
    checkGameOver();
}

function updateSpeed() {
    if (score < 100) { gameSpeed = 100; } 
    else if (score < 200) { gameSpeed = 90; } 
    else if (score < 300) { gameSpeed = 80; } 
    else if (score < 400) { gameSpeed = 70; } 
    else { gameSpeed = 60; }
}

function checkGameOver() {
    if (snake[0].x < 0 || snake[0].x >= CANVAS_WIDTH || snake[0].y < 0 || snake[0].y >= CANVAS_HEIGHT) {
        gameRunning = false;
    }
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            gameRunning = false;
        }
    }
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'darkred';
    ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
    ctx.strokeRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
}

function generateFood() {
    food.x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE;
    food.y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE;
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) generateFood();
    });
}

function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;
    const key = event.key;
    if ((key === "ArrowLeft" || key.toLowerCase() === "q") && dx === 0) { dx = -GRID_SIZE; dy = 0; }
    if ((key === "ArrowUp" || key.toLowerCase() === "z") && dy === 0) { dx = 0; dy = -GRID_SIZE; }
    if ((key === "ArrowRight" || key.toLowerCase() === "d") && dx === 0) { dx = GRID_SIZE; dy = 0; }
    if ((key === "ArrowDown" || key.toLowerCase() === "s") && dy === 0) { dx = 0; dy = GRID_SIZE; }
}

function showGameOverScreen() {
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
    playerNameInput.value = '';
    submitScoreButton.disabled = false;
    playerNameInput.disabled = false;
}

function restartGame() {
    snake = [ { x: 10 * GRID_SIZE, y: 10 * GRID_SIZE } ];
    dx = GRID_SIZE;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameRunning = true;
    gameSpeed = 100;
    gameOverScreen.classList.add('hidden');
    generateFood();
    main();
}

// --- Démarrage ---
document.addEventListener("keydown", changeDirection);
restartButton.addEventListener('click', restartGame);
submitScoreButton.addEventListener('click', saveScore);

displayHighScores();
generateFood();
main();