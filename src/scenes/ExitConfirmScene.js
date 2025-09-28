// scenes/ExitConfirmScene.js
export default class ExitConfirmScene {
    constructor(game) {
        this.game = game;
        this.setupDOM();
    }

    setupDOM() {
        this.exitConfirmScreen = document.getElementById('exitConfirmScreen');
        this.exitConfirmButton = document.getElementById('exitConfirmButton');
        this.exitCancelButton = document.getElementById('exitCancelButton');

        this.exitConfirmButton.addEventListener('click', () => {
            this.confirmExit();
        });

        this.exitCancelButton.addEventListener('click', () => {
            this.cancelExit();
        });

        // Закрытие по клику вне диалога
        this.exitConfirmScreen.addEventListener('click', (e) => {
            if (e.target === this.exitConfirmScreen) {
                this.cancelExit();
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.exitConfirmScreen.classList.contains('active')) {
                this.cancelExit();
            }
        });
    }

    show() {
        this.exitConfirmScreen.classList.add('active');
    }

    hide() {
        this.exitConfirmScreen.classList.remove('active');
    }

    confirmExit() {
        this.hide();
        // Переходим в главное меню
        this.game.stateManager.showScreen('menu');
        // Сбрасываем игру
        this.game.scenes.game.reset();
    }

    cancelExit() {
        this.hide();
        this.game.stateManager.showScreen('game');
    }

    // Методы для StateManager
    activate() {
        this.show();
    }

    deactivate() {
        this.hide();
    }

    update() {}
    render() {}
}