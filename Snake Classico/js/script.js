// ====== CONFIGURAÇÕES GLOBAIS ======
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;
const gridSize = 20;

// ====== ESTADOS DO JOGO ======
let currentGameMode = 'classic';
let currentControlType = 'keyboard';
let gameRunning = false;
let gamePaused = false;
let gameLoopTimeout = null;

// ====== VARIÁVEIS DO JOGO ======
let snake = [];
let dx = gridSize, dy = 0;
let inputQueue = [];
let food = null;
let badFood = null;
let obstacles = [];
let score = 0;
let level = 1;
let speed = 1;
let gameSpeed = 150;

// ====== GAMEPAD SUPPORT ======
let gamepadIndex = null;
let lastGamepadInputTime = 0;
const gamepadInputDelay = 180;
let gamepadAnimationId = null;

// ====== SISTEMA DE ÁUDIO (Web Audio API) ======
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    try {
        const ctxAudio = getAudioContext();
        if (!ctxAudio) return;

        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        osc.connect(gain);
        gain.connect(ctxAudio.destination);

        const now = ctxAudio.currentTime;

        if (type === 'eat') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'badEat') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'levelUp') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.08);
            osc.frequency.setValueAtTime(659.25, now + 0.16);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'gameOver') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        }
    } catch (e) {
        // Audio desativado ou sem suporte
    }
}

/**
 * Inicializa o sistema de detecção de gamepad
 */
function initGamepadSupport() {
    window.addEventListener("gamepadconnected", (e) => {
        gamepadIndex = e.gamepad.index;
        updateGamepadStatus(true);
        startGamepadLoop();
    });

    window.addEventListener("gamepaddisconnected", (e) => {
        if (e.gamepad.index === gamepadIndex) {
            gamepadIndex = null;
            updateGamepadStatus(false);
            stopGamepadLoop();
        }
    });
}

function startGamepadLoop() {
    if (!gamepadAnimationId && gamepadIndex !== null) {
        gamepadLoop();
    }
}

function stopGamepadLoop() {
    if (gamepadAnimationId) {
        cancelAnimationFrame(gamepadAnimationId);
        gamepadAnimationId = null;
    }
}

function updateGamepadStatus(connected) {
    const status = document.getElementById('gamepadStatus');
    const indicator = document.getElementById('gamepadIndicator');
    
    if (connected) {
        indicator.textContent = '🎮 Gamepad: Conectado';
        indicator.className = 'gamepad-connected';
        status.style.display = 'block';
    } else {
        indicator.textContent = '🎮 Gamepad: Desconectado';
        indicator.className = 'gamepad-disconnected';
        status.style.display = (currentControlType === 'gamepad') ? 'block' : 'none';
    }
}

function gamepadLoop() {
    if (gamepadIndex !== null && currentControlType === 'gamepad' && gameRunning && !gamePaused) {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = gamepads[gamepadIndex];
        if (gamepad) {
            processGamepadInput(gamepad);
        }
    }
    if (gamepadIndex !== null) {
        gamepadAnimationId = requestAnimationFrame(gamepadLoop);
    }
}

function processGamepadInput(gamepad) {
    const now = Date.now();
    if (now - lastGamepadInputTime < gamepadInputDelay) return;

    const threshold = 0.5;
    let inputDetected = false;

    // D-pad
    if (gamepad.buttons[14] && gamepad.buttons[14].pressed) {
        queueDirection({ keyCode: 37 }); inputDetected = true;
    } else if (gamepad.buttons[15] && gamepad.buttons[15].pressed) {
        queueDirection({ keyCode: 39 }); inputDetected = true;
    } else if (gamepad.buttons[12] && gamepad.buttons[12].pressed) {
        queueDirection({ keyCode: 38 }); inputDetected = true;
    } else if (gamepad.buttons[13] && gamepad.buttons[13].pressed) {
        queueDirection({ keyCode: 40 }); inputDetected = true;
    }

    // Analógicos
    const leftStickX = gamepad.axes[0];
    const leftStickY = gamepad.axes[1];

    if (!inputDetected && (Math.abs(leftStickX) > threshold || Math.abs(leftStickY) > threshold)) {
        if (Math.abs(leftStickX) > Math.abs(leftStickY)) {
            if (leftStickX > threshold) { queueDirection({ keyCode: 39 }); inputDetected = true; }
            else if (leftStickX < -threshold) { queueDirection({ keyCode: 37 }); inputDetected = true; }
        } else {
            if (leftStickY > threshold) { queueDirection({ keyCode: 40 }); inputDetected = true; }
            else if (leftStickY < -threshold) { queueDirection({ keyCode: 38 }); inputDetected = true; }
        }
    }

    // Pausa (Start / Select)
    if ((gamepad.buttons[9] && gamepad.buttons[9].pressed) || 
        (gamepad.buttons[8] && gamepad.buttons[8].pressed)) {
        togglePause();
        inputDetected = true;
    }

    if (inputDetected) {
        lastGamepadInputTime = now;
    }
}

// ====== SELEÇÃO DE CONTROLES ======
function selectControl(type) {
    playSound('click');
    currentControlType = type;
    
    document.getElementById('keyboardBtn').classList.toggle('active', type === 'keyboard');
    document.getElementById('gamepadBtn').classList.toggle('active', type === 'gamepad');
    
    if (type === 'gamepad') {
        document.getElementById('gamepadStatus').style.display = 'block';
        startGamepadLoop();
    } else {
        document.getElementById('gamepadStatus').style.display = 'none';
    }
}

// ====== MODOS DE JOGO ======
const gameModes = {
    classic: {
        name: 'Modo Clássico',
        description: 'Snake tradicional',
        hasObstacles: false,
        hasBadFood: false,
        hasPortal: false,
        speedIncrease: false,
        colorfulFood: false
    },
    speed: {
        name: 'Modo Velocidade',
        description: 'Acelera com o tempo',
        hasObstacles: false,
        hasBadFood: false,
        hasPortal: false,
        speedIncrease: true,
        colorfulFood: false
    },
    obstacles: {
        name: 'Modo Obstáculos',
        description: 'Paredes no mapa',
        hasObstacles: true,
        hasBadFood: false,
        hasPortal: false,
        speedIncrease: false,
        colorfulFood: false
    },
    portal: {
        name: 'Modo Portal',
        description: 'Atravesse as paredes',
        hasObstacles: false,
        hasBadFood: false,
        hasPortal: true,
        speedIncrease: false,
        colorfulFood: false
    },
    survival: {
        name: 'Modo Sobrevivência',
        description: 'Comida ruim aparece',
        hasObstacles: false,
        hasBadFood: true,
        hasPortal: false,
        speedIncrease: false,
        colorfulFood: false
    },
    rainbow: {
        name: 'Modo Arco-íris',
        description: 'Comidas coloridas',
        hasObstacles: false,
        hasBadFood: false,
        hasPortal: false,
        speedIncrease: false,
        colorfulFood: true
    }
};

// ====== INICIALIZAÇÃO DO JOGO ======
function startGame(mode) {
    playSound('click');
    currentGameMode = mode;
    const modeConfig = gameModes[mode];
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('modeDisplay').textContent = modeConfig.name;
    
    updateControlsInfo();
    initializeGame();
    
    clearTimeout(gameLoopTimeout);
    gameRunning = true;
    gamePaused = false;
    gameLoop();
}

function updateControlsInfo() {
    const controlsInfo = document.getElementById('controlsInfo');
    if (currentControlType === 'keyboard') {
        controlsInfo.innerHTML = `
            <strong>Teclado:</strong><br>
            Setas ou WASD para mover<br>
            ESC para pausar
        `;
    } else {
        controlsInfo.innerHTML = `
            <strong>Gamepad:</strong><br>
            D-pad ou Analógico para mover<br>
            Start/Select para pausar
        `;
    }
}

function initializeGame() {
    // Cobra centralizada inicialmente
    snake = [
        { x: 300, y: 300 },
        { x: 280, y: 300 },
        { x: 260, y: 300 }
    ];
    dx = gridSize;
    dy = 0;
    inputQueue = [];
    score = 0;
    level = 1;
    speed = 1;
    gameSpeed = 150;
    obstacles = [];
    badFood = null;

    const mode = gameModes[currentGameMode];
    
    if (mode.hasObstacles) {
        generateObstacles();
    }
    
    food = generateFood();
    
    if (mode.hasBadFood) {
        badFood = generateBadFood();
    }
    
    updateGameUI();
}

// ====== GERAÇÃO DE ELEMENTOS ======
function getRandomFoodColor() {
    const colors = ['#FF5722', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getColorPoints(color) {
    const pointsMap = {
        '#FF5722': 10,
        '#2196F3': 15,
        '#4CAF50': 20,
        '#FF9800': 25,
        '#9C27B0': 30,
        '#F44336': 35,
        '#00BCD4': 40
    };
    return pointsMap[color] || 10;
}

function generateFood() {
    const mode = gameModes[currentGameMode];
    let newFood;
    
    do {
        const color = mode.colorfulFood ? getRandomFoodColor() : '#FF5722';
        const points = mode.colorfulFood ? getColorPoints(color) : 10;
        
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
            color: color,
            points: points
        };
    } while (isPositionOccupied(newFood));
    
    return newFood;
}

function generateBadFood() {
    let newBadFood;
    let attempts = 0;
    
    do {
        newBadFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
            color: '#8B0000',
            points: -15
        };
        attempts++;
        if (attempts > 500) break;
    } while (isPositionOccupied(newBadFood));
    
    return newBadFood;
}

function generateObstacles() {
    // Mantém os obstáculos existentes e adiciona novos de forma não-bloqueante
    const numObstaclesNeeded = 6 + (level * 2);
    let attempts = 0;
    
    while (obstacles.length < numObstaclesNeeded && attempts < 1000) {
        attempts++;
        const obstacle = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
        
        // Não gerar perto da cabeça atual da cobra (distância de 5 blocos)
        const head = snake[0] || { x: 300, y: 300 };
        const distHead = Math.abs(obstacle.x - head.x) + Math.abs(obstacle.y - head.y);
        
        if (!isPositionOccupied(obstacle) && distHead > 100) {
            obstacles.push(obstacle);
        }
    }
}

function isPositionOccupied(pos) {
    if (snake.some(segment => segment.x === pos.x && segment.y === pos.y)) {
        return true;
    }
    if (food && food.x === pos.x && food.y === pos.y) {
        return true;
    }
    if (badFood && badFood.x === pos.x && badFood.y === pos.y) {
        return true;
    }
    if (obstacles.some(obstacle => obstacle.x === pos.x && obstacle.y === pos.y)) {
        return true;
    }
    return false;
}

// ====== LÓGICA DE MOVIMENTO ======
function processInputQueue() {
    if (inputQueue.length === 0) return;
    
    const nextDir = inputQueue.shift();
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if ((nextDir === 'LEFT' || nextDir === 'A') && !goingRight) {
        dx = -gridSize; dy = 0;
    } else if ((nextDir === 'RIGHT' || nextDir === 'D') && !goingLeft) {
        dx = gridSize; dy = 0;
    } else if ((nextDir === 'UP' || nextDir === 'W') && !goingDown) {
        dx = 0; dy = -gridSize;
    } else if ((nextDir === 'DOWN' || nextDir === 'S') && !goingUp) {
        dx = 0; dy = gridSize;
    }
}

function moveSnake() {
    processInputQueue();

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Modo portal (atravessa paredes)
    if (gameModes[currentGameMode].hasPortal) {
        if (head.x < 0) head.x = canvas.width - gridSize;
        if (head.x >= canvas.width) head.x = 0;
        if (head.y < 0) head.y = canvas.height - gridSize;
        if (head.y >= canvas.height) head.y = 0;
    }
    
    snake.unshift(head);
    
    // Comeu comida boa
    if (food && head.x === food.x && head.y === food.y) {
        playSound('eat');
        score += food.points || 10;
        food = generateFood();
        
        // Progressão de Nível
        const newLevel = Math.floor(score / 100) + 1;
        if (newLevel > level) {
            level = newLevel;
            playSound('levelUp');
            if (gameModes[currentGameMode].speedIncrease) {
                gameSpeed = Math.max(50, 150 - (level - 1) * 15);
                speed = level;
            } else {
                speed = level;
            }
            if (gameModes[currentGameMode].hasObstacles) {
                generateObstacles();
            }
        }
    }
    // Comeu comida ruim
    else if (badFood && head.x === badFood.x && head.y === badFood.y) {
        playSound('badEat');
        score = Math.max(0, score + badFood.points);
        
        // Remove 2 segmentos para encolher a cobra de fato (unshift adicionou 1, então remove 2 para reduzir 1 líquido)
        snake.pop(); 
        if (snake.length > 1) {
            snake.pop();
        }
        
        badFood = generateBadFood();
    }
    // Movimento normal: remove cauda
    else {
        snake.pop();
    }
    
    // Spawn ocasional de comida ruim no modo Sobrevivência
    if (gameModes[currentGameMode].hasBadFood && Math.random() < 0.02) {
        badFood = generateBadFood();
    }
    
    updateGameUI();
}

function checkCollisions() {
    if (snake.length <= 1) {
        return true; // Se a cobra encolheu a ponto de sumir
    }

    const head = snake[0];
    
    // Paredes no modo sem portal
    if (!gameModes[currentGameMode].hasPortal) {
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            return true;
        }
    }
    
    // Próprio corpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    // Obstáculos
    if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        return true;
    }
    
    return false;
}

function queueDirection(event) {
    if (gamePaused) return;
    
    const key = event.keyCode;
    let dir = null;

    if (key === 37 || key === 65) dir = 'LEFT';
    else if (key === 38 || key === 87) dir = 'UP';
    else if (key === 39 || key === 68) dir = 'RIGHT';
    else if (key === 40 || key === 83) dir = 'DOWN';
    else if (key === 27) { togglePause(); return; }

    if (dir && inputQueue.length < 2) {
        inputQueue.push(dir);
    }
}

// ====== RENDERIZAÇÃO ======
function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            const gradient = ctx.createLinearGradient(
                segment.x, segment.y, 
                segment.x + gridSize, segment.y + gridSize
            );
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#2E7D32');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = `rgba(46, 125, 50, ${Math.max(0.3, 1 - (index * 0.03))})`;
        }
        
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
        
        // Olhos
        if (index === 0) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(segment.x + 4, segment.y + 4, 3, 3);
            ctx.fillRect(segment.x + 13, segment.y + 4, 3, 3);
            ctx.fillStyle = '#000';
            ctx.fillRect(segment.x + 5, segment.y + 5, 1, 1);
            ctx.fillRect(segment.x + 14, segment.y + 5, 1, 1);
        }
    });
}

function drawFood() {
    if (!food) return;
    
    const pulse = Math.sin(Date.now() * 0.01) * 2;
    const size = Math.max(10, gridSize - 2 + pulse);
    
    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.arc(
        food.x + gridSize / 2,
        food.y + gridSize / 2,
        size / 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
    
    const glowGradient = ctx.createRadialGradient(
        food.x + gridSize / 2, food.y + gridSize / 2, 0,
        food.x + gridSize / 2, food.y + gridSize / 2, size / 2
    );
    glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.fill();
    
    if (gameModes[currentGameMode].colorfulFood && food.points > 10) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(food.points.toString(), food.x + gridSize / 2, food.y + gridSize / 2 + 3);
    }
}

function drawBadFood() {
    if (!badFood) return;
    
    const shake = Math.sin(Date.now() * 0.02) * 1;
    
    ctx.fillStyle = badFood.color;
    ctx.fillRect(badFood.x + shake, badFood.y + shake, gridSize, gridSize);
    
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(badFood.x + 4, badFood.y + 4);
    ctx.lineTo(badFood.x + gridSize - 4, badFood.y + gridSize - 4);
    ctx.moveTo(badFood.x + gridSize - 4, badFood.y + 4);
    ctx.lineTo(badFood.x + 4, badFood.y + gridSize - 4);
    ctx.stroke();
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        const gradient = ctx.createLinearGradient(
            obstacle.x, obstacle.y,
            obstacle.x + gridSize, obstacle.y + gridSize
        );
        gradient.addColorStop(0, '#757575');
        gradient.addColorStop(1, '#424242');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(obstacle.x, obstacle.y, gridSize, gridSize);
        
        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 1;
        ctx.strokeRect(obstacle.x, obstacle.y, gridSize, gridSize);
    });
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    drawObstacles();
    drawFood();
    drawBadFood();
    drawSnake();
    
    if (gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSADO', canvas.width / 2, canvas.height / 2 - 10);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText('Pressione ESC ou Start para continuar', canvas.width / 2, canvas.height / 2 + 30);
    }
}

// ====== CONTROLES E CICLO DE JOGO ======
function togglePause() {
    if (!gameRunning) return;
    playSound('click');
    
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (gamePaused) {
        pauseBtn.innerHTML = '▶️ Continuar';
        clearTimeout(gameLoopTimeout);
    } else {
        pauseBtn.innerHTML = '⏸️ Pausar';
        clearTimeout(gameLoopTimeout);
        gameLoop();
    }
    
    draw();
}

function backToMenu() {
    playSound('click');
    gameRunning = false;
    gamePaused = false;
    clearTimeout(gameLoopTimeout);
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

function restartGame() {
    playSound('click');
    document.getElementById('gameOver').style.display = 'none';
    clearTimeout(gameLoopTimeout);
    initializeGame();
    gameRunning = true;
    gamePaused = false;
    gameLoop();
}

function showGameOver() {
    playSound('gameOver');
    const mode = gameModes[currentGameMode];
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalMode').textContent = mode.name;
    document.getElementById('gameOver').style.display = 'block';
    
    canvas.classList.add('shake');
    setTimeout(() => canvas.classList.remove('shake'), 500);
}

function updateGameUI() {
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('levelValue').textContent = level;
    document.getElementById('speedValue').textContent = speed;
}

// ====== LOOP PRINCIPAL ======
function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    if (checkCollisions()) {
        gameRunning = false;
        showGameOver();
        return;
    }
    
    moveSnake();
    draw();
    
    clearTimeout(gameLoopTimeout);
    gameLoopTimeout = setTimeout(gameLoop, gameSpeed);
}

// ====== EVENTOS ======
document.addEventListener('keydown', (event) => {
    if (gameRunning) {
        queueDirection(event);
    } else if (event.keyCode === 27) {
        if (gameRunning) togglePause();
    }
});

// ====== INICIALIZAÇÃO ======
initGamepadSupport();

// Tela Inicial Canvas
ctx.fillStyle = '#0a0a0a';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#666';
ctx.font = '18px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Selecione um modo de jogo para começar', canvas.width / 2, canvas.height / 2);
