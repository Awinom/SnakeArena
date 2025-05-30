const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const exitButton = document.getElementById('exitButton');

const mainMenu = document.getElementById('mainMenu');
const playButton = document.getElementById('playButton');
const settingsButton = document.getElementById('settingsButton');

// Минимальный размер стандартного поля
const MIN_FIELD_WIDTH = 600;  // Минимальная ширина в пикселях
const MIN_FIELD_HEIGHT = 600; // Минимальная высота в пикселях

// Фиксированные настройки поля (можно менять)
const GRID_COUNT_X = 15; // Количество клеток по ширине
const GRID_COUNT_Y = 15; // Количество клеток по высоте
let GRID_SIZE = 10; // Базовый размер клетки (будет масштабироваться)

// Настройки игры
const FPS = 4; // Чем меньше, тем медленнее скорость змейки
let score = 0;
let lastTime = 0;
let isPaused = false;
let touchStartX = 0;

// Игровые объекты
let snake = [{x: GRID_COUNT_X/2, y: GRID_COUNT_Y/2}];
let food = generateFood();
let direction = 'right';
let nextDirection = 'right';

function initGame() {
    hideMainMenu();
    resetGame();
    gameLoop();
}

// Показ главного меню
function showMainMenu() {
    mainMenu.style.display = 'flex';
    setTimeout(() => {
        mainMenu.style.opacity = '1';
    }, 10);
    canvas.classList.add('paused');
}

// Обработчик кнопки старта
//playButton.addEventListener('click', initGame);
// Обработчик кнопки "Играть"
playButton.addEventListener('click', () => {
    hideMainMenu();
    canvas.classList.remove('paused');
    resetGame();
    isPaused = false;
    lastTime = 0;
    if (!isPaused) {
        requestAnimationFrame(gameLoop);
    }
});

// Обработчик кнопки "Настройки" (заглушка)
settingsButton.addEventListener('click', () => {
    console.log('Открыть настройки');
    // Реализуйте по необходимости
});

// Скрытие главного меню
function hideMainMenu() {
    mainMenu.style.opacity = '0';
    setTimeout(() => {
        mainMenu.style.display = 'none';
    }, 300);
}

// Масштабирование под экран
function initGameSize() {
	// Вычисляем доступное пространство с учетом минимальных размеров
	const availableWidth = Math.max(window.innerWidth - 40, MIN_FIELD_WIDTH);
	const availableHeight = Math.max(window.innerHeight - 200, MIN_FIELD_HEIGHT);

	// Ограничиваем максимальный размер (если нужно)
	const maxWidth = Math.min(6000, availableWidth);
	const maxHeight = Math.min(6000, availableHeight);

	// Вычисляем размер клетки так, чтобы всё поле влезло
	const cellSizeX = Math.floor(maxWidth / GRID_COUNT_X);
	const cellSizeY = Math.floor(maxHeight / GRID_COUNT_Y);
	GRID_SIZE = Math.min(cellSizeX, cellSizeY);

	// Устанавливаем размер canvas с учетом масштаба
	canvas.width = GRID_SIZE * GRID_COUNT_X;
	canvas.height = GRID_SIZE * GRID_COUNT_Y;

}

initGameSize();

// Обработчик изменения размера
window.addEventListener('resize', () => {
  initGameSize();
  if (isPaused) {updatePauseIndicator(); };// Пересчитываем позицию при изменении размера    
  draw(); // Перерисовываем без сброса игры
});

// Генерация еды
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_COUNT_X),
            y: Math.floor(Math.random() * GRID_COUNT_Y)
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
    
	// Обновляем позицию головы с учётом телепортации
    switch (direction) {
        case 'up': 
			head.y = (head.y - 1 + GRID_COUNT_Y) % GRID_COUNT_Y;; 
			break;
        case 'down': 
			head.y = (head.y + 1) % GRID_COUNT_Y; 
			break;
        case 'left': 
			head.x = (head.x - 1 + GRID_COUNT_X) % GRID_COUNT_X; 
			break;
        case 'right': 
			head.x = (head.x + 1) % GRID_COUNT_X; 
			break;
    }
    
	// Проверяем еду ДО добавления новой головы
    const willEatFood = head.x === food.x && head.y === food.y;
	
    snake.unshift(head);
    
    // Проверка съедения еды
    if (willEatFood) {
        score += 1;
        scoreElement.textContent = score;
        food = generateFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];    
    
    // столкновение с собой
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
   
	// Адаптивная отрисовка
	const offsetX = (canvas.width - GRID_COUNT_X * GRID_SIZE) / 2;
	const offsetY = (canvas.height - GRID_COUNT_Y * GRID_SIZE) / 2;
   
    // Отрисовка змейки
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
		const isHead = index === 0;
		const size = isHead ? GRID_SIZE : GRID_SIZE * 0.8;
		const offset = (GRID_SIZE - size) / 2;
		const x = offsetX + segment.x * GRID_SIZE + offset;
		const y = offsetY + segment.y * GRID_SIZE + offset;
        
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, isHead ? 6 : 4);
        ctx.fill();
    });
    
    // Отрисовка еды
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.roundRect(
        offsetX + food.x * GRID_SIZE + 2,
        offsetY + food.y * GRID_SIZE + 2,
        GRID_SIZE - 4, GRID_SIZE - 4, 8
    );
    ctx.fill();
}

// функция gameOver
function gameOver() {
    finalScoreElement.textContent = score;
    
    // Показываем экран окончания игры
    gameOverScreen.classList.add('active');
    canvas.classList.add('paused');
    
    // Останавливаем игровой цикл
    cancelAnimationFrame(gameLoop);
}

// Обработчики кнопок проигрыша
restartButton.addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    canvas.classList.remove('paused');
    resetGame();
    isPaused = false;
    lastTime = 0; // Сбрасываем таймер
    gameLoop(); // Запускаем игру заново
});

exitButton.addEventListener('click', () => {
	gameOverScreen.classList.remove('active');
    showMainMenu();
});

function resetGame() {
    snake = [
		{
		 x: Math.floor(GRID_COUNT_X / 2), 
		 y: Math.floor(GRID_COUNT_Y / 2)
		}
	];
    food = generateFood();
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
}

// Функция обновления индикатора паузы
function updatePauseIndicator() {
    const indicator = document.getElementById('pauseIndicator');
	if (isPaused) {
        // Позиционируем индикатор относительно canvas
        const canvasRect = canvas.getBoundingClientRect();
        indicator.style.display = 'block';
        indicator.style.position = 'absolute';
        indicator.style.left = `${canvasRect.left + canvasRect.width / 2}px`;
        indicator.style.top = `${canvasRect.top + canvasRect.height / 2}px`;
        indicator.style.transform = 'translate(-50%, -50%)';
    } else {
        indicator.style.display = 'none';
    }
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
	document.querySelector('.game-container').classList.toggle('paused', isPaused);
    canvas.classList.toggle('paused', isPaused);
    updatePauseIndicator();
    if (!isPaused){
        requestAnimationFrame(gameLoop); // Возобновляем игру
    }
});


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
showMainMenu();
//mainMenu.style.display = 'flex';
 //resetGame();
//gameLoop();