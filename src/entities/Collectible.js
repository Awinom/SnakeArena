// entities/Collectible.js
import Config from '../core/Config.js';

export default class Collectible {
    constructor(type) {
        this.type = type;
        this.x = 0;
        this.y = 0;
        this.isActive = false;
    }

    /**
     * Спавн объекта на свободной позиции
     */
    spawn(occupiedPositions = []) {
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!validPosition && attempts < maxAttempts) {
            this.x = Math.floor(Math.random() * Config.GRID_COUNT_X);
            this.y = Math.floor(Math.random() * Config.GRID_COUNT_Y);
            
            validPosition = !occupiedPositions.some(pos => 
                pos.x === this.x && pos.y === this.y
            );
            attempts++;
        }

        if (validPosition) {
            this.isActive = true;
            //console.log(`${this.type} spawned at (${this.x}, ${this.y})`);
        } else {
            this.isActive = false;
            console.warn(`Could not find valid position for ${this.type}`);
        }
        
        return this.isActive;
    }

    /**
     * Проверяет, собран ли объект
     */
    isCollectedBy(snakeHead) {
      //console.log(`${this.isActive} check at (${this.x}, ${this.y})`);
        return this.isActive && this.x === snakeHead.x && this.y === snakeHead.y;
    }

    /**
     * Вызывается при сборе объекта
     */
    onCollect(game) {
        this.isActive = false;
        return true;
    }

    /**
     * Базовый метод обновления
     */
    update() {
        // Базовая реализация
    }

    /**
     * Базовый метод отрисовки
     */
    draw(ctx) {
        if (!this.isActive) return;
        
        // Заглушка для отладки
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(
            this.x * Config.GRID_SIZE,
            this.y * Config.GRID_SIZE,
            Config.GRID_SIZE,
            Config.GRID_SIZE
        );
    }
}