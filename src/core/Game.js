import GameScene from '../scenes/GameScene.js';
import GameOverScene from '../scenes/GameOverScene.js';
import SettingsScene from '../scenes/SettingsScene.js';
import MenuScene from '../scenes/MenuScene.js';
import StateManager from './StateManager.js';
import SoundManager from './SoundManager.js';
import Config from './Config.js';
import InputManager from '../Systems/InputManager.js';
import AchievementManager from './AchievementManager.js';
import AchievementScene from '../scenes/AchievementScene.js';
import ExitConfirmScene from '../scenes/ExitConfirmScene.js';
import VictoryScene from '../scenes/VictoryScene.js';
import GridManager from '../entities/GridManager.js';

export default class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    // Игровое поле
    //this.grid = new GridManager(this.canvas);
    // Управление
    this.input = new InputManager();
    this.achievementManager = new AchievementManager(this);
    this.gameLoopId = null; // Добавляем переменную для хранения ID игрового цикла
    // Инициализация сцен
    this.scenes = {
      menu: new MenuScene(this),
      game: new GameScene(this),
      settings: new SettingsScene(this),
      gameOver: new GameOverScene(this),
      achievements: new AchievementScene(this),
      exitConfirm: new ExitConfirmScene(this),
      victory: new VictoryScene(this)
    };
    // Инициализация настроек
    this.settings = {
        controlMode: 'swipe',
        soundEnabled: true,
        vibrationEnabled: true
    };
    this.stateManager = new StateManager(this.scenes);
    this.soundManager = new SoundManager();

    this.init();
    this.accumulatedTime = 0;
  }

  async init() {
      // Canvas setup
      this.initGameSize();
      
      // 2. Инициализация сцены
      this.scenes.game.init({
      input: this.input
      });

      // Загружаем звуки
      try {
          await this.soundManager.loadSound('eat', './assets/sounds/eat.mp3');
          await this.soundManager.loadSound('gameover', './assets/sounds/gameover.mp3');
          //await this.soundManager.loadSound('shoot', './assets/sounds/shoot.mp3');
          //await this.soundManager.loadSound('cut', './assets/sounds/cut.mp3');
          //await this.soundManager.loadSound('projectileCollision', './assets/sounds/projectile_collision.mp3');
          //await this.soundManager.loadSound('victory', './assets/sounds/victory.mp3');
          console.log('Sounds loaded successfully');
      } catch (e) {
          console.error('Failed to load sounds:', e);
      }
      // Инициализируем менеджер достижений
      this.achievementManager.loadAchievements();
      // применяем настройки
      this.applySettings();

      // Start with menu
      this.stateManager.showScreen('menu');        
      
      // Start game loop
      this.lastTime = 0;
      this.startGameLoop(); // Используем новый метод для запуска цикла
  }

  // Добавляем метод для обновления статистики
  updateAchievements() {
      // Будем вызывать этот метод когда игрок сбивает яблоко
      const applesShot = this.scenes.game.projectileManager.applesShot || 0;
      this.achievementManager.updateAchievement('apple_shooter', applesShot);
  }

  applySettings(settings) {
      this.settings = {...this.settings, ...settings};
      
      // Применяем настройки управления
      const controlsElement = document.querySelector('.controls');
      switch (this.settings.controlMode) {
        case 'buttons':
            controlsElement.style.display = 'flex';
            break;
        case 'keyboard':
        case 'swipe':
            controlsElement.style.display = 'none';
            break;
    }


       // Убеждаемся, что soundVolume - валидное число
      const soundVolume = typeof this.settings.soundVolume === 'number' && !isNaN(this.settings.soundVolume)
        ? this.settings.soundVolume
        : 0.7;

      // Применяем настройки звука
      this.soundManager.setVolume(this.settings.soundVolume);
      
      // Здесь можно добавить логику для звука и вибрации
      console.log('Settings applied:', this.settings);
  }

  // Добавляем метод для запуска игрового цикла
  startGameLoop() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
    }
    this.gameLoopId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  // Добавляем метод для остановки игрового цикла
  stopGameLoop() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    
    // Вычисляем deltaTime в секундах
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Всегда обновляем снаряды с текущим deltaTime
    if (this.stateManager.currentScene.projectileManager) {
        this.stateManager.currentScene.projectileManager.update(deltaTime);
    }

    // Обновляем визуальное движение змейки
    if (this.stateManager.currentScene.snake) {
      this.stateManager.currentScene.snake.updateRender(deltaTime);
    }
    
    // Обновляем игровые объекты с учетом FPS
    const updateInterval = 1 / Config.FPS;
    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= updateInterval) {
        this.stateManager.currentScene.update(updateInterval);
        this.accumulatedTime -= updateInterval;
    }

    // Отрисовываем сцену
    this.stateManager.currentScene.render(this.ctx);

    // Проверка достижений
    this.achievementManager.checkAchievements();
    
    // Запуск следующего кадра
    this.gameLoopId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  updateScoreContainerWidth() {
      const scoreContainer = document.querySelector('.score-container');
      const canvas = this.canvas;
      
      if (scoreContainer && canvas) {
          scoreContainer.style.width = `${canvas.width}px`;
      }
  }

  initGameSize() {        
  // Вычисляем доступное пространство с учетом минимальных размеров
  const availableWidth = Math.max(window.innerWidth, Config.MIN_SCREEN_WIDTH);
  const availableHeight = Math.max(window.innerHeight, Config.MIN_SCREEN_HEIGHT);

  // Ограничиваем максимальный размер (если нужно)
  const maxWidth = Math.min(availableWidth, availableWidth);
  const maxHeight = Math.min(availableHeight, availableHeight);

  // Вычисляем размер клетки так, чтобы всё поле влезло
  const cellSizeX = Math.floor(maxWidth / Config.GRID_COUNT_X);
  const cellSizeY = Math.floor(maxHeight / Config.GRID_COUNT_Y);
  console.log('Canvas size:', Config.GRID_SIZE, cellSizeX, cellSizeY); 
  Config.GRID_SIZE = Math.min(cellSizeX, cellSizeY);
  Config.MIN_SCREEN_WIDTH = Config.GRID_COUNT_X * Config.GRID_SIZE;
  Config.MIN_SCREEN_HEIGHT = Config.GRID_COUNT_Y * Config.GRID_SIZE;

  console.log('Canvas size:', Config.GRID_SIZE, cellSizeX, cellSizeY); 

  // Устанавливаем размер canvas с учетом масштаба
  this.canvas.width = Config.GRID_SIZE * Config.GRID_COUNT_X;
  this.canvas.height = Config.GRID_SIZE * Config.GRID_COUNT_Y;

  // Обновляем ширину контейнера счета
  this.updateScoreContainerWidth();
  }

  // Добавляем метод для показа экрана окончания игры
  showGameOver(score) {
    this.stateManager.showScreen('gameOver', score);
  }

  // Добавим метод для показа экрана победы
  showVictory(score) {
      this.stateManager.showScreen('victory', score);
  }

}