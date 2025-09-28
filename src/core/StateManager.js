export default class StateManager {
  constructor(scenes) {
    this.screens = scenes;
    this.currentScene = null;
  }

 showScreen(name, data) {
    if (!this.screens[name]) {
      console.error(`Scene ${name} not found!`);
      return;
    }

    // Скрываем игровой контейнер перед переключением сцен 
    // (если это не окончание и пауза и победа)
    if (name != 'gameOver'||name != 'exitConfirm'||name != 'victory') {
      this.hideGameContainer();
    }

    // Вызываем deactivate у текущей сцены, если она есть
    if (this.currentScene && this.currentScene.deactivate) {
      this.currentScene.deactivate();
    }

    this.currentScene = this.screens[name];


    // Вызываем activate у новой сцены, если он есть
    if (this.currentScene.activate) {
      this.currentScene.activate(data);
    }

    // Показываем игровой контейнер 
    // для игровой сцены, паузы и конца игры и победы
    if (name === 'game'||name === 'gameOver'||name === 'exitConfirm'
                       ||name === 'victory') {
      this.showGameContainer();
    }
  }

  hideGameContainer() { // Скрываем игровой контейнер
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.classList.add('hidden');
    }
  }

  showGameContainer() { // Показываем игровой контейнер 
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.classList.remove('hidden');
    }
  }

}