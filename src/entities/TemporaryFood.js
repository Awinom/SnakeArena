import Food from './Food.js';
import Config from '../core/Config.js';

export default class TemporaryFood extends Food {
    constructor(x, y, lifetime = 10000) {
        super([]); // Не используем стандартный спавн
        this.x = x;
        this.y = y;
        this.lifetime = lifetime;
        this.createdAt = Date.now();
        this.isExpired = false;
        // Получаем цвет тела змейки из конфига и затемняем его
        this.color = this.darkenColor(Config.COLORS.SNAKE_BODY, 0.55); // Затемняем на 45%

        // Для анимации мигания
        this.blinkInterval = 200; // Интервал мигания в мс
        this.isVisible = true; // Текущее состояние видимости
        this.lastBlinkTime = Date.now();
    }

    update() {
        const currentTime = Date.now();

        // Проверяем истекло ли время жизни
        if (currentTime - this.createdAt > this.lifetime) {
            this.isExpired = true;
            return;
        }
        
        // Анимация мигания - меняем видимость каждые 500мс
        if (currentTime - this.lastBlinkTime > this.blinkInterval) {
            this.isVisible = !this.isVisible;
            this.lastBlinkTime = currentTime;
        }
        
        // Увеличиваем частоту мигания в последние 3 секунды
        const timeLeft = this.lifetime - (currentTime - this.createdAt);
        if (timeLeft < 3000) {
            this.blinkInterval = 100; // Быстрое мигание
        }
    }

    // Метод для затемнения цвета
    darkenColor(color, factor) {
        // Убираем # из начала, если есть
        let hex = color.replace('#', '');
        
        // Преобразуем HEX в RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        // Затемняем каждый компонент
        r = Math.max(0, Math.floor(r * factor));
        g = Math.max(0, Math.floor(g * factor));
        b = Math.max(0, Math.floor(b * factor));
        
        // Преобразуем обратно в HEX
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    draw(ctx) {
        // Если невидимая фаза мигания - пропускаем отрисовку
        if (!this.isVisible) return;
        // Рисуем временную еду темнее обычной
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(
            this.x * Config.GRID_SIZE,
            this.y * Config.GRID_SIZE,
            Config.GRID_SIZE, 
            Config.GRID_SIZE, 
            8
        );	
        ctx.fill();
        
        // Динамический размер шрифта на основе размера клетки
        const fontSize = Math.max(10, Config.GRID_SIZE * 0.5);

        // Отображаем таймер исчезновения (только целые секунды)
        const timeLeft = Math.ceil((this.lifetime - (Date.now() - this.createdAt)) / 1000);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            timeLeft.toString(), 
            this.x * Config.GRID_SIZE + Config.GRID_SIZE / 2,
            this.y * Config.GRID_SIZE + Config.GRID_SIZE / 2
        );
    }
}