import Game from './core/Game.js';

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new Game();        
        // Для отладки через консоль
        window.game = game;
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Game initialization failed:', error);
        alert('Произошла ошибка при запуске игры. Пожалуйста, обновите страницу.');
    }
});