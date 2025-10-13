import Snake from '../entities/Snake.js';
import ProjectileManager from '../entities/ProjectileManager.js';
import TemporaryFood from '../entities/TemporaryFood.js';
import ParticleSystem from '../entities/ParticleSystem.js';
import Config from '../core/Config.js';
import Food from '../entities/Food.js'; 
import InvincibilityBooster from '../entities/InvincibilityBooster.js';

export default class GameScene {
  constructor(game) {
    this.game = game;
    this.snake = new Snake();
    this.food = new Food();
    this.score = 0;
    // Находим элемент счета (предполагая, что у него есть id="score")
    this.scoreElement = document.getElementById('score');
    this.isActive = false;

    this.projectileManager = new ProjectileManager(this);
    this.temporaryFoods = [];

    // Добавляем систему бустеров
    this.boosters = [];
    this.lastBoosterSpawnTime = 0;
    this.boosterSpawnInterval = 15000; // 15 секунд


    // Для еды используем все занятые позиции (включая старую еду)
    const occupiedPositions = [
      ...this.snake.body
    ];
    this.food.spawn(occupiedPositions);


    // Добавляем систему частиц
    this.particleSystem = new ParticleSystem();

    //Достижения 
    this.survivalTime = 0;
    this.maxCombo = 0;
    this.currentCombo = 0;
    this.canibal = 0; // счетчик каннибализма
    this.projectilesHit = 0; // Счетчик попаданий снарядами
    this.rageTime = 0; // Время в режиме ярости (3 яблока за секунду)
    this.rageTimeSum = 0; // Сумма Времени в режиме ярости
    this.HeadShoot = 0; // Суисайд
    this.isVinner = 0; // победил или нет
    this.setupDOM();
  }

  activate() {
        this.isActive = true;
  }

  // Добавляем метод для деактивации сцены
  deactivate() {
    this.isActive = false;
    // Очищаем канвас при деактивации
    //this.game.ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
  }

  setupDOM() {
    // Обработчик кнопки выхода
    this.exitGameBtn = document.getElementById('exitGameBtn');    

    if (this.exitGameBtn) {
        this.exitGameBtn.addEventListener('click', () => {
            this.game.stateManager.showScreen('exitConfirm');
        });
    }
  }

  init({ input }) {  // Передаем game только при инициализации
    this.setupInput(input);
  }

  setupInput(inputManager) {
    // Регистрируем обработчик направлений
    inputManager.register({
      setDirection: (newDirection) => {
        this.snake.setDirection(newDirection);
      }
    });

    // Регистрируем обработчик выстрелов
    inputManager.registerShootHandler(() => {
      if (this.isActive) {
        this.createProjectile();
      }
    });

  }

  destroy(inputManager) {
    inputManager.unregister(this.snake);
    // Удаляем обработчики событий
   inputManager.unregisterShootHandler(this.createProjectile);
  }

  update(deltaTime) {
    if (!this.isActive) return; // Не обновляем, если сцена не активна

    this.snake.move(deltaTime);

    // Обновляем систему частиц
    this.particleSystem.update(deltaTime);

    // Обновляем бустеры
    this.updateBoosters();
    // Спавним новые бустеры
    this.trySpawnBooster();

    // Сьели тестовую еду
    if (this.food.isCollectedBy(this.snake.getHead())) {
        this.EatenFood();
    }

    // Проверяем столкновение с временной едой
    for (let i = this.temporaryFoods.length - 1; i >= 0; i--) {
        const tempFood = this.temporaryFoods[i];
        
        // Обновляем состояние временной еды
        tempFood.update();
        
        // Удаляем просроченную еду
        if (tempFood.isExpired) {
            this.temporaryFoods.splice(i, 1);
            continue;
        }
        
        // Проверяем, съедена ли временная еда
        if (tempFood.isCollectedBy(this.snake.getHead())) {
            this.canibal++;
            this.snake.grow();
            this.game.soundManager.playSound('eat');
            this.temporaryFoods.splice(i, 1);
            this.score++;
        }

    }

    // Столкновение с собой
    if (this.snake.checkSelfCollision()) {
    this.GameOver(); // Логика конца игры
    }

    // Проверяем условие победы
    if (this.snake.body.length >= Config.GRID_COUNT_X * Config.GRID_COUNT_Y - 1) 
      { // Config.GRID_COUNT_X * Config.GRID_COUNT_Y - 1 (минус 1 т.к. яблоку нужно место)
        this.victory();
        return; // Останавливаем обновление игры
    }

    // Обновляем время выживания
    this.survivalTime += deltaTime;

    // Обновляем время ярости
    this.rageTime += deltaTime;

  }

  // Добавляем метод для обновления бустеров
  updateBoosters() {
    // Обновляем существующие бустеры
    this.boosters.forEach(booster => booster.update());

    // Проверяем сбор бустеров змейкой
    for (let i = this.boosters.length - 1; i >= 0; i--) {
      const booster = this.boosters[i];
      if (booster.isCollectedBy(this.snake.getHead())) {
        booster.onCollect(this.game);
        this.boosters.splice(i, 1);
      }
    }
  }

  // Добавляем метод для спавна бустеров
  trySpawnBooster() {
    const currentTime = Date.now();

    // Проверяем, не достигли ли лимита бустеров
    if (this.boosters.length >= 2) {
        return;
    }
    
    if (currentTime - this.lastBoosterSpawnTime >= this.boosterSpawnInterval) {
      const occupiedPositions = this.getOccupiedPositions();
      const booster = new InvincibilityBooster();
      
      if (booster.spawn(occupiedPositions)) {
        this.boosters.push(booster);
        this.lastBoosterSpawnTime = currentTime;
        //console.log("New invincibility booster spawned");
      } else {
        // Если не удалось заспавнить, пробуем через 5 секунд
        this.lastBoosterSpawnTime = currentTime - this.boosterSpawnInterval + 5000;
      }
    }
  }

  render(ctx) {
    if (!this.isActive) return; // Не отрисовываем, если сцена не активна
    // Очистка
    ctx.fillStyle = Config.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, Config.MIN_SCREEN_WIDTH, Config.MIN_SCREEN_HEIGHT);

    
    this.temporaryFoods.forEach(food => food.draw(ctx)); // Рисуем временную еду
    this.food.draw(ctx); // Рисуем еду
    this.boosters.forEach(booster => booster.draw(ctx)); // Бустеры поверх еды
    this.projectileManager.draw(ctx); // Отрисовываем снаряды
    this.snake.draw(ctx);
    // Рисуем частицы (поверх всего)
    this.particleSystem.draw(ctx);
    
    // Обновляем текст существующего элемента счета
    if (this.scoreElement) {
      //this.scoreElement.textContent = `${this.score}`; // Выводим количество набранных очков
      this.scoreElement.textContent = `${this.snake.body.length-1}`; // Выводим длинну змейки
    }
  }

  //Получает все занятые позиции на поле
  getOccupiedPositions() {
    return [
      ...this.snake.body,
      ...this.temporaryFoods.map(food => ({ x: food.x, y: food.y })),
      ...this.boosters.map(booster => ({ x: booster.x, y: booster.y })),
      { x: this.food.x, y: this.food.y }
    ];
  }

  handleBoosterHit(boosterIndex) {
    if (boosterIndex >= 0 && boosterIndex < this.boosters.length) {
        const booster = this.boosters[boosterIndex];
        
        // Активируем бустер
        booster.onCollect(this.game);
        
        // Удаляем бустер
        this.boosters.splice(boosterIndex, 1);
        
        //console.log("Снаряд попал в бустер неуязвимости!");
    }
  }

  handleFoodHit() {
    // Вызываем тот же метод, что и при съедании еды змейкой
    this.EatenFood();
    this.snake.grow();
    this.score++; // при попадании выстрелом +2 очка
    this.projectilesHit++;
  } 
  //Обработка сбора тестовой еды
  EatenFood() {
    this.snake.grow();
    this.game.soundManager.playSound('eat');
    this.game.soundManager.vibrate(50);
    this.score++;
    
    // Спавним еду с учетом всех занятых позиций
    const occupiedPositions = this.getOccupiedPositions();
    this.food.spawn(occupiedPositions);
    
    this.rageTimeSum = this.rageTime + this.rageTimeSum;
    this.rageTime = 0;

    // Логика для режима ярости
    if (this.rageTimeSum < 1) { // 1 секунда
        this.currentCombo++;
        this.maxCombo = Math.max(this.maxCombo, this.currentCombo);
    } else {
        this.currentCombo = 1;
        this.rageTimeSum = 0;
    }
  }

  handleSnakeCut(segmentIndex) {
    if (this.snake.isInvincible) {
      // Добавляем очки и воспроизводим звук
        this.snake.grow();
        this.score++;
        this.game.soundManager.playSound('eat');
    }
    else {
      // Разрезаем змейку
      const cutSegments = this.snake.cutAt(segmentIndex);
      
      if (cutSegments && cutSegments.length > 0) {
          // Создаем временную еду для каждого отрезанного сегмента
          cutSegments.forEach(segment => {
              this.temporaryFoods.push(new TemporaryFood(segment.x, segment.y));
          });
          
          this.game.soundManager.playSound('cut');
          this.game.soundManager.vibrate([50, 50, 50]);
      }
    }
  }

  handleTemporaryFoodHit(foodIndex) {
    if (foodIndex >= 0 && foodIndex < this.temporaryFoods.length) {
        // Удаляем временную еду
        this.temporaryFoods.splice(foodIndex, 1);
        
        // Добавляем очки и воспроизводим звук
        this.snake.grow();
        this.score++;
        this.canibal++;
        this.game.soundManager.playSound('eat');
        this.game.soundManager.vibrate(50);
        
        //console.log("Снаряд попал во временную еду!");
    }
  }

  // Добавляем метод обработки столкновения снарядов
  handleProjectileCollision(x,y) {
      // Воспроизводим звук столкновения
      this.game.soundManager.playSound('projectileCollision');
      this.game.soundManager.vibrate([30, 30, 30]);
      
      // Создаем эффект взрыва в указанных координатах
    if (x !== undefined && y !== undefined) {
        this.particleSystem.createExplosion(x, y, Config.COLORS.PROJECTILE, 10);
    }
    
    //console.log("Снаряды столкнулись и уничтожились!");
  }

  // Выстрел в себя
  GameOverShoot() {
    if (this.snake.isInvincible) {
      // Добавляем очки и воспроизводим звук
        this.snake.grow();
        this.score++;
        this.game.soundManager.playSound('eat');
    }
    else {
    this.HeadShoot++;
    this.GameOver(); // Логика конца игры
    }
  }

  GameOver() {
      this.game.soundManager.playSound('gameover');
      this.game.soundManager.vibrate([100, 50, 100]);
      this.game.showGameOver(this.score);
  }

  // Добавляем метод победы
  victory() {
      this.isVinner++;
      this.game.soundManager.playSound('victory'); // Можно добавить звук победы
      this.game.soundManager.vibrate([100, 50, 100, 50, 100]);
      this.game.showVictory(this.score);
  }

  createProjectile() {
    // Проверяем, может ли змейка стрелять
    if (!this.snake.canShoot()) {
        // Воспроизводим звук ошибки или вибрацию
        this.game.soundManager.vibrate([100, 50, 100]);
        //console.log("Нельзя стрелять: змейка слишком короткая");
        return;
    }
    // Укорачиваем змейку на 1 сегмент
    this.snake.decreaseLength();

    const head = this.snake.getHead();
    this.projectileManager.createProjectile(head.x, head.y, this.snake.direction);
    this.game.soundManager.playSound('shoot');
  }

  reset() {
    this.snake = new Snake();
   // this.food = new Food();

    // Инициализируем 
    const occupiedPositions = [
      ...this.snake.body
    ];
    this.food.spawn(occupiedPositions);



    this.projectileManager.clear(); // Очищаем снаряды
    this.particleSystem.clear(); // Очищаем частицы
    this.temporaryFoods = [];
    this.score = 0;
    if (this.scoreElement) {
      this.scoreElement.textContent = '0';
    }
    this.isActive = true;

    // Сбрасываем бустеры
    this.boosters = [];
    this.lastBoosterSpawnTime = 0;

    //Достижения 
    this.survivalTime = 0;
    this.maxCombo = 0;
    this.currentCombo = 0;
    this.projectilesHit = 0; // Счетчик попаданий снарядами
    this.rageTime = 0; // Время в режиме ярости (3 яблока за секунду)
    this.rageTimeSum = 0; // Сумма Времени в режиме ярости
    this.canibal = 0; // счетчик каннибализма
    this.isVinner = 0;
  }
    

}