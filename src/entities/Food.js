import Config from '../core/Config.js';

export default class Food {
    constructor(snakeSegments = []) {
        this.x = 0;
        this.y = 0;
        this.spawn(snakeSegments);
    }

    // Логика появления еды
    spawn(snakeSegments = []) {
        let validPosition = false;
        
        while (!validPosition) {
            this.x = Math.floor(Math.random() * Config.GRID_COUNT_X);
            this.y = Math.floor(Math.random() * Config.GRID_COUNT_Y);
            
            validPosition = !snakeSegments.some(segment => 
                segment.x === this.x && segment.y === this.y
            );
        }
    }

    isEatenBy(snakeHead) {
        return this.x === snakeHead.x && this.y === snakeHead.y;
    }

    // Отрисовка еды
    draw(ctx) {        
        ctx.fillStyle = Config.COLORS.FOOD;
        ctx.beginPath();
        ctx.roundRect(
            this.x * Config.GRID_SIZE,
            this.y * Config.GRID_SIZE,
            Config.GRID_SIZE, 
            Config.GRID_SIZE, 
            8
        );	
        ctx.fill();
      }




}