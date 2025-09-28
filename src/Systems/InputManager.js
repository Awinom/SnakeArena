import Config from '../core/Config.js';

export default class InputManager {
  constructor() {
  this.touchStartX = 0;
  this.touchStartY = 0;  
  this.controllers = new Set();
  this.shootHandlers = new Set(); // Обработчики выстрелов
  this.setupControls();
  }

  // Регистрация контроллера (например, змейки)
  register(controller) {
      this.controllers.add(controller);
  }

   registerShootHandler(handler) {
    this.shootHandlers.add(handler);
  }

  // Отмена регистрации
  unregister(controller) {
      this.controllers.delete(controller);
  }

  unregisterShootHandler(handler) {
    this.shootHandlers.delete(handler);
  }

  setupControls() {
    // Клавиатура
    document.addEventListener('keydown', (e) => {
    const direction = this.getDirectionFromKey(e.code);
    if (direction) this.updateControllers(direction);
    });

    // Сенсорные кнопки
    this.setupButton('upBtn', 'up');
    this.setupButton('downBtn', 'down');
    this.setupButton('leftBtn', 'left');
    this.setupButton('rightBtn', 'right');

    // Свайп
    this.setupTouchControls();
  }

  setupTouchControls() {
    const gameArea = document.getElementById('gameCanvas');

    gameArea.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) { // Обрабатываем только одиночные касания
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    gameArea.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) { // Обрабатываем только одиночные касания
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe(touchEndX, touchEndY);
        }
    }, { passive: true });  

/*
    gameArea.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    gameArea.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        this.handleSwipe(touchEndX, touchEndY);
    }, { passive: true });

*/

  }

  handleSwipe(touchEndX, touchEndY) {
      const dx = touchEndX - this.touchStartX;
      const dy = touchEndY - this.touchStartY;
      const minSwipeDistance = 30; // Минимальное расстояние для определения свайпа
      // Проверяем, достаточно ли длинный свайп
      if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
        this.handleShoot();
        return; // Свайп слишком короткий
      }
      // Определяем направление свайпа
      if (Math.abs(dx) > Math.abs(dy)) {
          // Горизонтальный свайп
          if (dx > 0) {
              this.updateControllers('right');
          } else {
              this.updateControllers('left');
          }
      } else {
          // Вертикальный свайп
          if (dy > 0) {
              this.updateControllers('down');
          } else {
              this.updateControllers('up');
          }
      }
  }

  handleShoot() {
    // Вызываем все зарегистрированные обработчики выстрелов
    this.shootHandlers.forEach(handler => {
      if (typeof handler === 'function') {
        handler();
      }
    });
  }

  setupButton(id, direction) {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', () => {
      this.updateControllers(direction)

      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 50);
    });
  }
  }

  updateControllers(direction) {
  this.controllers.forEach(controller => {
    if (controller.setDirection) {
      controller.setDirection(direction);
    }
  });
  }

  getDirectionFromKey(keyCode) {
  const { UP, DOWN, LEFT, RIGHT, SHOOT} = Config.CONTROLS;
  if (UP.includes(keyCode)) return 'up';
  if (DOWN.includes(keyCode)) return 'down';
  if (LEFT.includes(keyCode)) return 'left';
  if (RIGHT.includes(keyCode)) return 'right';
  if (SHOOT.includes(keyCode)) this.handleShoot(); 
  return null;
  }

}