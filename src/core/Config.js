export default {
   
    // Фиксированные настройки игрового поля (можно менять)
    MIN_BTH_SIZE: 45, // Минимальный размер кнопки управления квадратной в пикселях
    MAX_BTH_SIZE: 500, // Максимальныйй размер кнопки управления квадратной в пикселях
    GRID_SIZE: 20, // Базовый размер клетки (будет масштабироваться)
    GRID_COUNT_X: 1, //18  30 Количество клеток по ширине
    GRID_COUNT_Y: 5, //32  50 Количество клеток по высоте    
    MIN_SCREEN_WIDTH: 240, // Минимальная ширина в пикселях
    MIN_SCREEN_HEIGHT: 500, // Минимальная высота в пикселях
    FPS: 6, //6 Чем меньше, тем медленнее скорость змейки
    renderSmoothness: 100, // Коэффициент плавности обновления змейки от 0.1 до 1.0

//offsetX: (canvas.width - GRID_COUNT_X * GRID_SIZE) / 2,
//offsetY: (canvas.height - GRID_COUNT_Y * GRID_SIZE) / 2,
    
    // Рассчитываемые значения
    /*
    get GRID_SIZE() {
        return Math.min(
            Math.floor(window.innerWidth * 0.9 / this.GRID_COLS),
            Math.floor(window.innerHeight * 0.7 / this.GRID_ROWS)
        );
    },
    get CANVAS_WIDTH() {
        return this.GRID_SIZE * this.GRID_COLS;
    },
    get CANVAS_HEIGHT() {
        return this.GRID_SIZE * this.GRID_ROWS;
    },
    */
    
    // Colors
    COLORS: {
        BACKGROUND: '#121212',
        SNAKE_HEAD: '#51c056ff',
        SNAKE_BODY: '#4CAF50',
        PROJECTILE: '#efed41ff', // Снаряд
        FOOD: '#FF5252',
        TEXT: '#FFFFFF'
    },
    
    // Controls
    CONTROLS: {
        UP: ['ArrowUp', 'KeyW'],
        DOWN: ['ArrowDown', 'KeyS'],
        LEFT: ['ArrowLeft', 'KeyA'],
        RIGHT: ['ArrowRight', 'KeyD'],
        SHOOT: ['Space'],
        MENU: ['KeyM']
    },

    // Настройки снарядов
    PROJECTILE: {
        SPEED: 2.7,       // Скорость в клетках за обновление
        LIFETIME: 5000, // Время жизни в миллисекундах
        SIZE_RATIO: 0.3,     // Размер снаряда относительно клетки
        UPDATE_RATE: 4     // Частота обновления снарядов (FPS)
    },
    
    // Storage keys
    STORAGE_KEYS: {
        HIGH_SCORE: 'snake_high_score',
        SETTINGS: 'game_settings'
    }
};