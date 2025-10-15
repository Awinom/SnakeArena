// scenes/SkinScene.js - обновляем для работы с изображениями
export default class SkinScene {
    constructor(game) {
        this.game = game;
        this.skinManager = game.skinManager;
        this.setupDOM();
    }

    setupDOM() {
        // Создаем элемент экрана скинов
        this.skinsScreen = document.createElement('div');
        this.skinsScreen.id = 'skinsScreen';
        this.skinsScreen.className = 'skins-screen';
        this.skinsScreen.innerHTML = `
            <div class="skins-content">
                <h2 class="skins-title">СКИНЫ</h2>
                <div class="skins-grid" id="skinsGrid"></div>
                <button id="skinsBackButton" class="skins-back-btn">Назад</button>
            </div>
        `;

        document.body.appendChild(this.skinsScreen);

        this.skinsGrid = document.getElementById('skinsGrid');
        this.backButton = document.getElementById('skinsBackButton');

        this.backButton.addEventListener('click', () => {
            this.hide();
            this.game.stateManager.showScreen('menu');
        });

        this.setupStyles();
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .skins-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .skins-screen.active {
                opacity: 1;
                display: flex;
            }

            .skins-content {
                background: #161616;
                padding: 4vmin;
                border-radius: 12px;
                width: 85%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
            }

            .skins-title {
                color: #4CAF50;
                font-size: 5vmin;
                margin-bottom: 4vmin;
                text-align: center;
                text-shadow: 0 0 1vmin rgba(76, 175, 80, 0.3);
            }

            .skins-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 3vmin;
                margin-bottom: 4vmin;
            }

            .skin-item {
                background: #222;
                border-radius: 8px;
                padding: 3vmin;
                text-align: center;
                transition: all 0.3s ease;
                border: 2px solid #333;
                cursor: pointer;
            }

            .skin-item.selected {
                border-color: #4CAF50;
                box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
                background: #1a2a1a;
            }

            .skin-item.unlocked {
                border-color: #4CAF50;
                background: #1a2a1a;
            }

            .skin-item.locked {
                opacity: 0.6;
                filter: grayscale(1);
                background: #1a1a1a;
            }

            .skin-item:hover:not(.locked) {
                transform: scale(1.05);
                border-color: #4CAF50;
            }

            .skin-preview {
                width: 80px;
                height: 80px;
                margin: 0 auto 2vmin;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .skin-snake-preview {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0px;
                transform: scale(1.5);
            }

            /* НОВЫЕ СТИЛИ ДЛЯ КОНТЕЙНЕРОВ ИЗОБРАЖЕНИЙ */
            .skin-segment-container {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .skin-segment-img {
            max-width: 110%; /* Чтобы близко друг к другу были и небыло видно пробелов */
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain; /* Сохраняем пропорции */
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }

            .skin-info {
                color: #d6d6d6;
            }

            .skin-name {
                font-size: 2.5vmin;
                font-weight: bold;
                margin-bottom: 1vmin;
            }

            .skin-status {
                font-size: 2vmin;
                color: #4CAF50;
            }

            .skin-price {
                font-size: 2vmin;
                color: #FFD700;
            }

            .skin-locked {
                font-size: 2vmin;
                color: #888;
                font-style: italic;
            }

            .skins-back-btn {
                width: 100%;
                padding: 2.5vmin;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 3.5vmin;
                cursor: pointer;
                transition: all 0.2s;
            }

            .skins-back-btn:hover {
                background: #3e8e41;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    updateSkinsList() {
        if (!this.skinsGrid) return;

        this.skinsGrid.innerHTML = '';
        
        const unlockedSkins = this.skinManager.getUnlockedSkins();
        const lockedSkins = this.skinManager.getLockedSkins();
        const currentSkinId = this.skinManager.currentSkin;

        const allSkins = [...unlockedSkins, ...lockedSkins];

        allSkins.forEach(skin => {
            const item = document.createElement('div');
            const isSelected = skin.id === currentSkinId;
            const isUnlocked = skin.isUnlocked;
            
            item.className = `skin-item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`;
            
            // Создаем превью змейки с изображениями
            const previewHTML = this.createSkinPreview(skin);
            
            item.innerHTML = `
                <div class="skin-preview">
                    ${previewHTML}
                </div>
                <div class="skin-info">
                    <div class="skin-name">${skin.name}</div>
                    ${isUnlocked ? 
                        `<div class="skin-status">${isSelected ? 'Выбран' : 'Разблокирован'}</div>` :
                        `<div class="skin-price">Цена: ${skin.price}</div>`
                    }
                </div>
            `;

            if (isUnlocked) {
                item.addEventListener('click', () => {
                    this.selectSkin(skin.id);
                });
            } else {
                item.addEventListener('click', () => {
                    this.tryUnlockSkin(skin);
                });
            }

            this.skinsGrid.appendChild(item);
        });
    }

    createSkinPreview(skin) {
        // Если изображения загружены, используем их для превью
        if (skin.images) {
            return `
                <div class="skin-snake-preview">
                    <div class="skin-segment-container">
                        <img src="${skin.head}" class="skin-segment-img" alt="Голова" data-type="head">
                    </div>
                    <div class="skin-segment-container">
                        <img src="${skin.body}" class="skin-segment-img" alt="Тело" data-type="body">
                    </div>
                    <div class="skin-segment-container">
                        <img src="${skin.tail}" class="skin-segment-img" alt="Хвост" data-type="tail">
                    </div>
                </div>
            `;
        } else {
            // Fallback на цветные квадраты
            return `
                <div class="skin-snake-preview">
                    <div class="skin-segment" style="background-color: ${skin.headColor}; width: 12px; height: 12px; border-radius: 2px;"></div>
                    <div class="skin-segment" style="background-color: ${skin.bodyColor}; width: 12px; height: 12px; border-radius: 2px;"></div>
                    <div class="skin-segment" style="background-color: ${skin.tailColor}; width: 12px; height: 12px; border-radius: 2px;"></div>
                </div>
            `;
        }
    }

    selectSkin(skinId) {
        if (this.skinManager.setCurrentSkin(skinId)) {
            this.updateSkinsList();
            // Применяем скин к текущей змейке
            if (this.game.scenes.game && this.game.scenes.game.snake) {
                // Скин автоматически применится при следующей отрисовке
                console.log(`Skin changed to: ${skinId}`);
            }
        }
    }

    tryUnlockSkin(skin) {
        // Здесь можно добавить логику покупки скинов за внутриигровую валюту
        if (confirm(`Разблокировать скин "${skin.name}" за ${skin.price} очков?`)) {
            this.skinManager.unlockSkin(skin.id);
            this.updateSkinsList();
        }
    }

    show() {
        this.updateSkinsList();
        this.skinsScreen.classList.add('active');
    }

    hide() {
        this.skinsScreen.classList.remove('active');
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