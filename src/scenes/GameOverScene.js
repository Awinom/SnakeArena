// GameOverScene.js
export default class GameOverScene {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.setupDOM();
    }

    setupDOM() {
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartButton = document.getElementById('restartButton');
        this.exitButton = document.getElementById('exitButton');

        this.restartButton.addEventListener('click', () => {
            this.hide();
            this.game.stateManager.showScreen('game');
            this.game.scenes.game.reset();
        });

        this.exitButton.addEventListener('click', () => {
            this.hide();
            this.game.stateManager.showScreen('menu');
        });
    }

    show(score) {
        this.score = score;
        this.finalScoreElement.textContent = score;
        this.gameOverScreen.classList.add('active');
    }

    hide() {
        this.gameOverScreen.classList.remove('active');
    }

    // Эти методы нужны для совместимости со StateManager
    activate(score) {
        this.show(score);
    }

    deactivate() {
        this.hide();
    }

    update() {}
    render() {}
}