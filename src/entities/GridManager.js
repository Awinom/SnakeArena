import Config from '../core/Config.js';

export default class GridManager {
    constructor(canvas) {
        this.cellSize = Config.GRID_SIZE;
        this.cols = Config.GRID_COUNT_X;
        this.rows = Config.GRID_COUNT_Y;
        this.initGameSize(canvas);
    }
    

    // Изменение параметров поля
initGameSize() {        
    
    this.orientation = { x: 1, y: 0 }; // горизонтальная ориентация
    if (window.innerHeight >= window.innerWidth) {
    this.orientation = { x: 0, y: 1 }; // вертикальная ориентация
    }

    console.log('orientation:', this.orientation.x, this.orientation.y); 

    // Вычисляем доступное пространство с учетом минимальных размеров кнопок
    const availableWidth = Math.max(window.innerWidth, Config.MIN_SCREEN_WIDTH) - Config.MIN_BTH_SIZE*3* this.orientation.x;
    const availableHeight = Math.max(window.innerHeight, Config.MIN_SCREEN_HEIGHT) - Config.MIN_BTH_SIZE*3*this.orientation.y;

    // Обновляем доступное пространство если оно очень большое (на кнопки оставляем максимальное значение)
    if (Config.MAX_BTH_SIZE * 3 <  0.27 * Math.min(window.innerWidth,window.innerHeight)){
      availableWidth = window.innerWidth - Config.MAX_BTH_SIZE*3*this.orientation.x
      availableHeight = window.innerHeight - Config.MAX_BTH_SIZE*3*this.orientation.y
    }

    // Ограничиваем максимальный размер (если нужно)
    const maxWidth = Math.min(availableWidth, Math.floor((1 - this.orientation.x * 0.27) * window.innerWidth));
    const maxHeight = Math.min(availableHeight, Math.floor((1 - this.orientation.y * 0.27)  * window.innerHeight));

console.log('orientation:', maxWidth, maxHeight); 

    // Вычисляем размер клетки так, чтобы всё поле влезло
    const cellSizeX = Math.floor(maxWidth / Config.GRID_COUNT_X);
    const cellSizeY = Math.floor(maxHeight / Config.GRID_COUNT_Y);
    Config.GRID_SIZE = Math.min(cellSizeX, cellSizeY);

    // Устанавливаем размер canvas с учетом масштаба
    this.canvas.width = Config.GRID_SIZE * Config.GRID_COUNT_X;
    this.canvas.height = Config.GRID_SIZE * Config.GRID_COUNT_Y;

  }


}