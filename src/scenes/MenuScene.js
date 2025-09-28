// MenuScene.js
export default class MenuScene {
    constructor(game) {
        this.game = game;
        this.setupDOM();
    }

    setupDOM() {
        this.mainMenu = document.getElementById('mainMenu');
        this.playButton = document.getElementById('playButton');
        this.settingsButton = document.getElementById('settingsButton');
        this.achievementsButton = document.getElementById('achievementsButton');

        this.playButton.addEventListener('click', () => {
            this.hide();            
            this.game.scenes.game.reset();
            this.game.stateManager.showScreen('game');
        });

        this.settingsButton.addEventListener('click', () => {
            this.hide();
            this.game.stateManager.showScreen('settings');
        });
        
        this.achievementsButton.addEventListener('click', () => {
            this.hide();
            this.game.stateManager.showScreen('achievements');
        });

    }

    show() {
        this.mainMenu.style.display = 'flex';
        setTimeout(() => {
            this.mainMenu.style.opacity = '1';
        }, 10);
    }

    hide() {
        this.mainMenu.style.opacity = '0';
        setTimeout(() => {
            this.mainMenu.style.display = 'none';
        }, 300);
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