import Config from '../core/Config.js';

export default class Snake {
  constructor() {
    this.body = [{ x: Math.floor(Config.GRID_COUNT_X/2)+ Config.GRID_COUNT_X%2, y: Math.floor(Config.GRID_COUNT_Y/2) +Config.GRID_COUNT_Y%2 }];
    this.direction = null;//'right';
    this.nextDirection = null;//'right';
    this.growthCounter = 0;

    // Добавляем флаг активности
    this.isActive = false;

    // Для плавного движения
    this.renderPositions = this.body.map(segment => ({
      x: segment.x,
      y: segment.y,
      targetX: segment.x,
      targetY: segment.y
    }));

    this.segmentStates = new Map(); // Для отслеживания состояния сегментов
  }

  getHead() {
    return {...this.body[0]};
  }

  // Движение змейки
  move() {
    // Если змейка не активна, не двигаемся
    if (!this.isActive) return;

    this.direction = this.nextDirection;    
    
    // Перемещение головы
    const head = {...this.body[0]};
    
    // Обновляем позицию головы с учётом телепортации
    switch (this.direction) {
      case 'up': 
        head.y = (head.y - 1 + Config.GRID_COUNT_Y) % Config.GRID_COUNT_Y;
        break;
      case 'down': 
        head.y = (head.y + 1) % Config.GRID_COUNT_Y;
        break;
      case 'left': 
        head.x = (head.x - 1 + Config.GRID_COUNT_X) % Config.GRID_COUNT_X;
        break;
      case 'right': 
        head.x = (head.x + 1) % Config.GRID_COUNT_X;
        break;
    }

    // Добавляем новую голову 
    this.body.unshift(head);
    
    // Удаляем хвост если не нужно расти
    if (this.growthCounter <= 0) {
      this.body.pop();
    } else {
      this.growthCounter--;
    }
    
    // Обновляем целевые позиции для плавного движения
    this.updateRenderTargets();
  }

  // Добавляем метод активации
  activate() {
      this.isActive = true;
  }

  // Модифицируем метод для установки направления
  setDirection(newDirection) {
      const opposite = {up: 'down', down: 'up', left: 'right', right: 'left'};
      if (this.direction !== opposite[newDirection]) {
          this.nextDirection = newDirection;
          // Активируем змейку при первом управлении
          if (!this.isActive) {
              this.activate();
          }
      }
  }

  // Визуальное обновление (вызывается на каждом кадре)
  updateRender(deltaTime) {
    const speed = Config.GRID_SIZE * Config.FPS; // Скорость движения в пикселях в секунду
    
    for (let i = 0; i < this.renderPositions.length; i++) {
      const renderPos = this.renderPositions[i];
      const targetPos = this.body[i];
      
      // Если змейка неактивна, просто синхронизируем позиции
        if (!this.isActive) {
            renderPos.x = targetPos.x;
            renderPos.y = targetPos.y;
            continue;
        }

      // Плавное перемещение к целевой позиции
      const dx = targetPos.x - renderPos.x;
      const dy = targetPos.y - renderPos.y;
      
      // Корректируем разницу для телепортации через границы
      const correctedDx = Math.abs(dx) > Config.GRID_COUNT_X / 2 ? 
        (dx > 0 ? dx - Config.GRID_COUNT_X : dx + Config.GRID_COUNT_X) : dx;
      const correctedDy = Math.abs(dy) > Config.GRID_COUNT_Y / 2 ? 
        (dy > 0 ? dy - Config.GRID_COUNT_Y : dy + Config.GRID_COUNT_Y) : dy;
      
      // Вычисляем расстояние перемещения
      const distance = speed * deltaTime / Config.GRID_SIZE;
      
      // Перемещаемся к целевой позиции
      if (Math.abs(correctedDx) > 0.01 || Math.abs(correctedDy) > 0.01) {
        const angle = Math.atan2(correctedDy, correctedDx);
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;
        //const moveX = Math.sign(correctedDx) * distance;
        //const moveY = Math.sign(correctedDy) * distance;
        
        renderPos.x += moveX;
        renderPos.y += moveY;
        
        // Корректируем позицию для телепортации через границы
        renderPos.x = (renderPos.x + Config.GRID_COUNT_X) % Config.GRID_COUNT_X;
        renderPos.y = (renderPos.y + Config.GRID_COUNT_Y) % Config.GRID_COUNT_Y;
        
      } else {
        // Если очень близко к целевой позиции, просто устанавливаем её
        renderPos.x = targetPos.x;
        renderPos.y = targetPos.y;
      }

      // Нормализуем координаты для предотвращения накопления ошибок
      renderPos.x = this.normalizeCoordinate(renderPos.x, Config.GRID_COUNT_X);
      renderPos.y = this.normalizeCoordinate(renderPos.y, Config.GRID_COUNT_Y);

    }
  }
  
  // Вспомогательный метод для нормализации координат
  normalizeCoordinate(coord, max) {
      while (coord < 0) coord += max;
      while (coord >= max) coord -= max;
      return coord;
  }

  setSegmentState(index, state) {
    this.segmentStates.set(index, state);
  }

  clearSegmentState(index) {
    this.segmentStates.delete(index);
  }

  getSegmentState(index) {
    return this.segmentStates.get(index) || 'normal';
  }

  // Добавляем метод для разрезания змейки
  cutAt(index) {
    if (index <= 0 || index >= this.body.length) return null;
    
    // Сохраняем отрезанную часть
    const cutSegments = this.body.slice(index);
    
    // Укорачиваем змейку
    this.body = this.body.slice(0, index);
    this.renderPositions = this.renderPositions.slice(0, index);
    
    return cutSegments;
}

  // Обновляем целевые позиции для рендеринга
  updateRenderTargets() {
    // Убедимся, что у нас достаточно элементов в renderPositions
    while (this.renderPositions.length < this.body.length) {
      this.renderPositions.push({
        x: this.body[this.renderPositions.length].x,
        y: this.body[this.renderPositions.length].y,
        targetX: this.body[this.renderPositions.length].x,
        targetY: this.body[this.renderPositions.length].y
      });
    }
    
    // Удаляем лишние элементы
    if (this.renderPositions.length > this.body.length) {
      this.renderPositions = this.renderPositions.slice(0, this.body.length);
    }
    
    // Обновляем целевые позиции
    for (let i = 0; i < this.body.length; i++) {
      this.renderPositions[i].targetX = this.body[i].x;
      this.renderPositions[i].targetY = this.body[i].y;
    }
  }
  

  // Возможность выстрела
  canShoot() {
      // Можно стрелять только если длина змейки больше 1 (есть хотя бы один сегмент тела)
      return this.body.length > 1;
  }

  // Добавляем метод уменьшения длины змейки
  decreaseLength() {
      if (this.body.length > 1) {
          // Удаляем последний сегмент
          this.body.pop();
          this.renderPositions.pop();
          
          // Обновляем целевые позиции для плавного движения
          this.updateRenderTargets();
          
          //console.log("Длина змейки уменьшена до: " + this.body.length);
      }
  }

  // Помощник в проверке сьедания еды
  grow(amount = 1) {
        this.growthCounter += amount;
    }

  // Проверка столкновений
  checkSelfCollision() {    
    const head = this.getHead();
    
    // столкновение с собой
    return this.body.slice(1).some(segment => 
    segment.x === head.x && segment.y === head.y
  );
  }

  // Новый метод для отрисовки сегментов при телепортации
  drawTeleportSegments(ctx, x, y, size, isHead, canvasWidth, canvasHeight) {
      // Проверяем, пересекает ли сегмент границы экрана
      const segments = [];
      
      // Проверка левой границы
      if (x < 0) {
          segments.push({ x: x + canvasWidth, y: y });
      }
      // Проверка правой границы
      else if (x + size > canvasWidth) {
          segments.push({ x: x - canvasWidth, y: y });
      }
      
      // Проверка верхней границы
      if (y < 0) {
          segments.push({ x: x, y: y + canvasHeight });
      }
      // Проверка нижней границы
      else if (y + size > canvasHeight) {
          segments.push({ x: x, y: y - canvasHeight });
      }
      
      // Проверка углов (пересечение двух границ)
      if (x < 0 && y < 0) {
          segments.push({ x: x + canvasWidth, y: y + canvasHeight });
      }
      else if (x < 0 && y + size > canvasHeight) {
          segments.push({ x: x + canvasWidth, y: y - canvasHeight });
      }
      else if (x + size > canvasWidth && y < 0) {
          segments.push({ x: x - canvasWidth, y: y + canvasHeight });
      }
      else if (x + size > canvasWidth && y + size > canvasHeight) {
          segments.push({ x: x - canvasWidth, y: y - canvasHeight });
      }
      
      // Отрисовываем все дополнительные сегменты
      segments.forEach(segment => {
          this.drawSegment(ctx, segment.x, segment.y, size, isHead);
      });
  }

  // Вспомогательный метод для отрисовки одного сегмента
  drawSegment(ctx, x, y, size, isHead) {
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, isHead ? 6 : 4);
      ctx.fill();
  }


  // Отрисовка змейки
  draw(ctx) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Рисуем все сегменты
    for (let i = 0; i < this.renderPositions.length; i++) {
      const pos = this.renderPositions[i];
      const isHead = i === 0;
      const size = isHead ? Config.GRID_SIZE : Config.GRID_SIZE * 0.8;
      const offset = (Config.GRID_SIZE - size) / 2;
      
      const x = pos.x * Config.GRID_SIZE + offset;
      const y = pos.y * Config.GRID_SIZE + offset;
      
      // Определяем цвет в зависимости от состояния сегмента
      if (i === 0) {
          ctx.fillStyle = Config.COLORS.SNAKE_HEAD; // Голова
      } else {
          ctx.fillStyle = Config.COLORS.SNAKE_BODY; // Тело
      }

      // Отрисовываем основной сегмент
      this.drawSegment(ctx, x, y, size, isHead);

      // Отрисовываем дополнительные сегменты при телепортации через границы
      this.drawTeleportSegments(ctx, x, y, size, isHead, canvasWidth, canvasHeight);
    }
  }
}