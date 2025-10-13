// entities/InvincibilityBooster.js
import Collectible from './Collectible.js';
import Config from '../core/Config.js';

export default class InvincibilityBooster extends Collectible {
    constructor() {
        super('invincibilityBooster');
        this.duration = 5000; // 5 секунд в миллисекундах
        this.color = '#4169E1'; // Синий королевский цвет для щита
        this.glowColor = '#1E90FF'; // Цвет свечения
        this.isActive = false;
        
        // Для анимации
        this.pulsePhase = 0;
        this.pulseSpeed = 1.5;
    }

    spawn(occupiedPositions = []) {
        const success = super.spawn(occupiedPositions);

        /*
        if (success) {
            console.log(`Invincibility booster spawned at (${this.x}, ${this.y})`);
        }
        */
        return success;
    }

    update() {
        // Анимация пульсации
        this.pulsePhase += this.pulseSpeed;
        if (this.pulsePhase > Math.PI * 2) {
            this.pulsePhase = 0;
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        const centerX = this.x * Config.GRID_SIZE + Config.GRID_SIZE / 2;
        const centerY = this.y * Config.GRID_SIZE + Config.GRID_SIZE / 2;

        // Эффект анимации
        const pulse = Math.sin(this.pulsePhase) * 0.05 + 0.9;
        const currentSize = Config.GRID_SIZE * pulse;

        ctx.save();

        // Вращаем весь щит
        ctx.translate(centerX, centerY);
        //ctx.rotate(this.rotation);

        // Создаем градиентный фон для эмодзи
        /*
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 1.2);
        gradient.addColorStop(0, 'rgba(65, 105, 225, 0.8)');
        gradient.addColorStop(0.7, 'rgba(30, 144, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(30, 144, 255, 0)');

        // Фоновый круг
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, currentSize * 1.8, 0, Math.PI * 2);
        ctx.fill();
        */

        // Внешнее свечение
        ctx.shadowColor = '#1E90FF';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Устанавливаем стиль для текста (эмодзи)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${currentSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Рисуем эмодзи
        ctx.fillText('🛡️', 0, 0);

        // Убираем тень для следующих элементов
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Дополнительное внутреннее свечение
        /*
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, currentSize * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        */

        ctx.restore();
    }

    onCollect(game) {
        this.isActive = false;
        const gameScene = game.scenes.game;
        
        // Активируем неуязвимость у змейки
        if (gameScene.snake.activateInvincibility) {
            gameScene.snake.activateInvincibility(this.duration);
        }
        
        // Воспроизводим звук и вибрацию
        game.soundManager.playSound('boost');
        game.soundManager.vibrate([100, 50, 100]);
        
        
        return true;
    }
}