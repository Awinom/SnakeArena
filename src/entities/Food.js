// entities/Food.js
import Collectible from './Collectible.js';
import Config from '../core/Config.js';

export default class TestFood extends Collectible {
    constructor() {
        super('food');
    }

    //Спавн еды - переопределяем родительский метод
    spawn(occupiedPositions = []) {
        const success = super.spawn(occupiedPositions);
        
        // Для отладки
        /*
        if (success) {
            console.log(`Food spawned at (${this.x}, ${this.y})`);
        }
        */
        
        return success;
    }

    
    //Совместимость со старым кодом - оставляем метод isEatenBy    
    isEatenBy(snakeHead) {
        return this.isCollectedBy(snakeHead);
    }

    //Отрисовка еды - переопределяем родительский метод
    draw(ctx) {
        if (!this.isActive) return;
        
        ctx.fillStyle = Config.COLORS.FOOD;
        ctx.beginPath();
        ctx.roundRect(
                    this.x * Config.GRID_SIZE,
                    this.y * Config.GRID_SIZE,
                    Config.GRID_SIZE, 
                    Config.GRID_SIZE, 
                    8
                );	
        ctx.closePath();
        ctx.fill();
    }

    //Дополнительный метод для удобства
    spawnWithOccupied(occupiedPositions = []) {
        return super.spawn(occupiedPositions);
    }
}