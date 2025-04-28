const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Настройки игры
const FPS = 5; // Чем меньше, тем медленнее
const GRID_SIZE = 20;
const GRID_COUNT = canvas.width / GRID_SIZE;
let score = 0;
let lastTime = 0;
let isPaused = false;
let touchStartX = 0;


// Игровые объекты
let snake = [
    {x: 10, y: 10}
];
let food = generateFood();
let direction = 'right';
let nextDirection = 'right';

// Генерация едыыыыыыыыыыыыыыыы
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
}


// Основной игровой цикл
function gameLoop(timestamp) {
	
	if (isPaused) return; // Не обновляем игру на паузе
	
    // Обновление позиции змейки
    if (timestamp - lastTime > 1000 / FPS) {
        updateSnake();
        draw();
        lastTime = timestamp;
    }
    
    // Проверка столкновений
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Отрисовка
    draw();
    
    // Запуск следующего кадра
    requestAnimationFrame(gameLoop);
}

function updateSnake() {
    direction = nextDirection;
    
    // Перемещение головы
    const head = {...snake[0]};
    
    switch (direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }
    
    snake.unshift(head);
    
    // Проверка съедения еды
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        food = generateFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    
	
	// Телепортация при выходе за границы
    if (head.x < 0) head.x = GRID_COUNT - 1;
    if (head.x >= GRID_COUNT) head.x = 0;
    if (head.y < 0) head.y = GRID_COUNT - 1;
    if (head.y >= GRID_COUNT) head.y = 0;
    
    // Сама в себя
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function draw() {
    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка змейки
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        const size = index === 0 ? GRID_SIZE : GRID_SIZE * 0.8;
        const offset = (GRID_SIZE - size) / 2;
        ctx.beginPath();
        ctx.roundRect(
            segment.x * GRID_SIZE + offset,
            segment.y * GRID_SIZE + offset,
            size, size, 4
        );
        ctx.fill();
    });
    
    // Отрисовка еды
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.roundRect(
        food.x * GRID_SIZE + 2,
        food.y * GRID_SIZE + 2,
        GRID_SIZE - 4, GRID_SIZE - 4, 8
    );
    ctx.fill();
}

function gameOver() {
    alert(`Игра окончена! Ваш счёт: ${score}`);
    resetGame();
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    food = generateFood();
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
}

// Функция обновления индикатора паузы
function updatePauseIndicator() {
    const indicator = document.getElementById('pauseIndicator');
    indicator.style.display = isPaused ? 'block' : 'none';
}

// Управление
document.addEventListener('keydown', e => {	
    switch (e.key) {
        case 'ArrowUp': if (direction !== 'down') nextDirection = 'up'; break;
        case 'ArrowDown': if (direction !== 'up') nextDirection = 'down'; break;
        case 'ArrowLeft': if (direction !== 'right') nextDirection = 'left'; break;
        case 'ArrowRight': if (direction !== 'left') nextDirection = 'right'; break;
    }
});

// Обработка паузы
canvas.addEventListener('click', () => {
    isPaused = !isPaused; // Переключаем состояние
	canvas.classList.toggle('paused', isPaused);
	updatePauseIndicator();
    if (!isPaused) gameLoop(); // Возобновляем игру
    
});

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
}, {passive: true});

canvas.addEventListener('touchend', (e) => {
    if (Math.abs(e.changedTouches[0].clientX - touchStartX) < 10) {
        isPaused = !isPaused;
        updatePauseIndicator();
    }
}, {passive: true});

// Для мобильных устройств

// Обработчики кнопок управления
document.getElementById('upBtn').addEventListener('click', () => {
    if (direction !== 'down') nextDirection = 'up';
});

document.getElementById('downBtn').addEventListener('click', () => {
    if (direction !== 'up') nextDirection = 'down';
});

document.getElementById('leftBtn').addEventListener('click', () => {
    if (direction !== 'right') nextDirection = 'left';
});

document.getElementById('rightBtn').addEventListener('click', () => {
    if (direction !== 'left') nextDirection = 'right';
});


// Старт игры
resetGame();
gameLoop();