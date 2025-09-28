import Config from '../core/Config.js';

export default class ProjectileManager {
    constructor(gameScene) {
        this.projectiles = [];
        this.gameScene = gameScene; // Сохраняем ссылку на игровую сцену
    }

    createProjectile(x, y, direction) {
        // Конвертируем клеточные координаты в пиксельные
        const pixelX = x * Config.GRID_SIZE + Config.GRID_SIZE / 2;
        const pixelY = y * Config.GRID_SIZE + Config.GRID_SIZE / 2;
        const projectileSize = Config.GRID_SIZE * Config.PROJECTILE.SIZE_RATIO;
        
        this.projectiles.push({
            x: pixelX,
            y: pixelY,
            originX: pixelX, // Сохраняем точку выстрела
            originY: pixelY,
            direction: direction,
            speed: Config.PROJECTILE.SPEED * Config.GRID_SIZE * Config.FPS, 
            lifetime: Config.PROJECTILE.LIFETIME, // Время жизни в миллисекундах 
            size: projectileSize,
            createdAt: Date.now(), // Время создания
        });
    }

    update(deltaTime) {
        const currentTime = Date.now();

        // Сначала проверяем столкновения между снарядами
        const projectileCollisions = this.checkProjectileCollisions();
        const projectilesToRemove = new Set();

        // Собираем координаты столкновений для эффектов
        const collisionPoints = [];

        // Помечаем снаряды для удаления
        projectileCollisions.forEach(collision => {
            projectilesToRemove.add(collision.index1);
            projectilesToRemove.add(collision.index2);
            
            // Сохраняем координаты для эффекта взрыва
            const proj1 = this.projectiles[collision.index1];
            const proj2 = this.projectiles[collision.index2];
            const collisionX = (proj1.x + proj2.x) / 2;
            const collisionY = (proj1.y + proj2.y) / 2;
            collisionPoints.push({ x: collisionX, y: collisionY });
        });

        // Обновляем позиции всех снарядов и удаляем старые
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            // Если снаряд помечен для удаления из-за столкновения
            if (projectilesToRemove.has(i)) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Проверяем время жизни снаряда
            if (currentTime - projectile.createdAt > projectile.lifetime) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Перемещаем снаряд с учетом deltaTime для плавного движения
            const movement = projectile.speed * deltaTime; 

            //console.log('movement: ',movement,'projectile.y = ',projectile.y,'projectile.x = ',projectile.x);
            switch (projectile.direction) {
                case 'up': 
                    projectile.y = (projectile.y - movement+Config.GRID_SIZE*Config.GRID_COUNT_Y)%(Config.GRID_SIZE*Config.GRID_COUNT_Y);
                    break;
                case 'down': 
                    projectile.y = (projectile.y + movement)%(Config.GRID_SIZE*Config.GRID_COUNT_Y);
                    break;
                case 'left': 
                    projectile.x = (projectile.x - movement+Config.GRID_SIZE*Config.GRID_COUNT_X)%(Config.GRID_SIZE*Config.GRID_COUNT_X);
                    break;
                case 'right': 
                    projectile.x = (projectile.x + movement)%(Config.GRID_SIZE*Config.GRID_COUNT_X);
                    break;
            }

            // Проверяем столкновение с едой
            if (this.checkFoodCollision(projectile)) {
                this.gameScene.handleFoodHit();
                this.projectiles.splice(i, 1);
            }

            // Проверяем столкновение с временной едой
            const tempFoodCollision = this.checkTemporaryFoodCollision(projectile, this.gameScene.temporaryFoods);
            if (tempFoodCollision) {
                this.gameScene.handleTemporaryFoodHit(tempFoodCollision.index);
                this.projectiles.splice(i, 1);
                continue;
            }

            // Проверяем столкновение со змейкой
            const snakeCollision = this.checkSnakeCollision(projectile, this.gameScene.snake);
            if (snakeCollision) {
                if (snakeCollision.type === 'head') {
                    this.gameScene.GameOverShoot();
                } else {
                    this.gameScene.handleSnakeCut(snakeCollision.segmentIndex);
                }
                this.projectiles.splice(i, 1);
                continue;
            }
        }

         // Воспроизводим звук и создаем эффекты для каждого столкновения
        if (collisionPoints.length > 0) {
        collisionPoints.forEach(point => {
            this.gameScene.handleProjectileCollision(point.x, point.y);
        });
    }
    }

    checkFoodCollision(projectile) {
        // Получаем позицию еды в пикселях
        const foodX = this.gameScene.food.x * Config.GRID_SIZE + Config.GRID_SIZE / 2;
        const foodY = this.gameScene.food.y * Config.GRID_SIZE + Config.GRID_SIZE / 2;
        const foodSize = Config.GRID_SIZE / 2;
        
        // Вычисляем расстояние между центром снаряда и центром еды
        const dx = projectile.x - foodX;
        const dy = projectile.y - foodY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Проверяем столкновение (расстояние меньше суммы радиусов)
        return distance < (projectile.size + foodSize);
    }

    // Добавляем метод проверки столкновения с временной едой
    checkTemporaryFoodCollision(projectile, temporaryFoods) {
        for (let i = temporaryFoods.length - 1; i >= 0; i--) {
            const tempFood = temporaryFoods[i];
            const foodX = tempFood.x * Config.GRID_SIZE+Config.GRID_SIZE/2;
            const foodY = tempFood.y * Config.GRID_SIZE+Config.GRID_SIZE/2;
            const foodSize = Config.GRID_SIZE;
            
            const dx = projectile.x - foodX;
            const dy = projectile.y - foodY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (projectile.size + foodSize)/ 2) {
                return { index: i, food: tempFood };
            }
        }
        return null;
    }

    // Добавляем метод проверки столкновения со змейкой
    checkSnakeCollision(projectile, snake) {
        const head = snake.getHead();
        const headX = head.x * Config.GRID_SIZE+Config.GRID_SIZE/2;
        const headY = head.y * Config.GRID_SIZE+Config.GRID_SIZE/2;
        const headSize = Config.GRID_SIZE;
        
        // Проверяем столкновение с головой (игнорируем если снаряд только что выпущен)
        const dxToHead = projectile.x - headX;
        const dyToHead = projectile.y - headY;
        const distanceToHead = Math.sqrt(dxToHead * dxToHead + dyToHead * dyToHead);

        if (distanceToHead < (projectile.size + headSize)/2 &&
            Date.now() - projectile.createdAt > 300) { // Игнорируем первые 200мс
            //console.log('headX: ',headX,' headY = ',headY,' headSize ',headSize,' projectile.x = ',projectile.x, ' projectile.y = ',projectile.y, ' projectile.size = ', projectile.size);
            return { type: 'head', segmentIndex: 0 };
        }
        
        // Проверяем столкновение с телом
        for (let i = 1; i < snake.body.length; i++) {
            const segment = snake.body[i];
            const segmentX = segment.x * Config.GRID_SIZE+Config.GRID_SIZE/2;
            const segmentY = segment.y * Config.GRID_SIZE+Config.GRID_SIZE/2;
            const segmentSize = Config.GRID_SIZE*0.8;
            
            const dx = projectile.x - segmentX;
            const dy = projectile.y - segmentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (projectile.size + segmentSize)/2 && 
                Date.now() - projectile.createdAt > 50)
             {
                return { type: 'body', segmentIndex: i };
            }
        }
        
        return null;
    }

    // Добавляем метод проверки столкновений между снарядами
    checkProjectileCollisions() {
        const collisions = [];
        
        // Проверяем все пары снарядов
        for (let i = 0; i < this.projectiles.length; i++) {
            for (let j = i + 1; j < this.projectiles.length; j++) {
                const proj1 = this.projectiles[i];
                const proj2 = this.projectiles[j];
                
                // Вычисляем расстояние между снарядами
                const dx = proj1.x - proj2.x;
                const dy = proj1.y - proj2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Если расстояние меньше суммы радиусов - столкновение
                if (distance < (proj1.size + proj2.size)) {
                    collisions.push({ index1: i, index2: j });
                }
            }
        }
        
        return collisions;
    }
    
    draw(ctx) {
        ctx.fillStyle = Config.COLORS.PROJECTILE;
        
        this.projectiles.forEach(projectile => {
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    clear() {
        this.projectiles = [];
    }
}