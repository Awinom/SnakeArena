import Config from '../core/Config.js';

export default class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createExplosion(x, y, color = Config.COLORS.PROJECTILE, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.4,
                maxLife: 0.4,
                color: color,
                size: Math.random() * 2 + Config.GRID_SIZE*0.06
            });
        }
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx *deltaTime*40;
            p.y += p.vy *deltaTime*40;
            p.life -= deltaTime;

            // Добавляем замедление со временем
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;

            // Преобразуем HEX в RGB и используем RGBA
            const hex = Config.COLORS.PROJECTILE.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);


            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    
    clear() {
        this.particles = [];
    }
}