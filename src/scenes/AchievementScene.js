
// scenes/AchievementScene.js
export default class AchievementScene {
    constructor(game) {
        this.game = game;
        this.achievementManager = game.achievementManager;
        this.setupDOM();
    }

    setupDOM() {
        // Создаем элемент экрана достижений
        this.achievementsScreen = document.createElement('div');
        this.achievementsScreen.id = 'achievementsScreen';
        this.achievementsScreen.className = 'achievements-screen';
        this.achievementsScreen.innerHTML = `
            <div class="achievements-content">
                <h2 class="achievements-title">ДОСТИЖЕНИЯ</h2>
                <div class="achievements-grid" id="achievementsGrid"></div>
                <button id="achievementsBackButton" class="achievements-back-btn">Назад</button>
            </div>
        `;

        document.body.appendChild(this.achievementsScreen);

        this.achievementsGrid = document.getElementById('achievementsGrid');
        this.backButton = document.getElementById('achievementsBackButton');

        this.backButton.addEventListener('click', () => {
            this.hide();
            this.game.stateManager.showScreen('menu');
        });

        this.setupStyles();
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .achievements-screen {
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

            .achievements-screen.active {
                opacity: 1;
                display: flex;
            }

            .achievements-content {
                background: #161616;
                padding: 4vmin;
                border-radius: 12px;
                width: 85%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
            }

            .achievements-title {
                color: #4CAF50;
                font-size: 5vmin;
                margin-bottom: 4vmin;
                text-align: center;
                text-shadow: 0 0 1vmin rgba(76, 175, 80, 0.3);
            }

            .achievements-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 3vmin;
                margin-bottom: 4vmin;
            }

            .achievement-item {
                background: #222;
                border-radius: 8px;
                padding: 3vmin;
                text-align: center;
                transition: transform 0.2s ease;
                border: 2px solid #333;
            }

            .achievement-item.unlocked {
                border-color: #4CAF50;
                background: #1a2a1a;
            }

            .achievement-item.locked {
                opacity: 0.6;
                filter: grayscale(1);
            }

            .achievement-item:hover {
                transform: scale(1.05);
            }

            .achievement-icon {
                font-size: 8vmin;
                margin-bottom: 2vmin;
            }

            .achievement-info {
                color: #d6d6d6;
            }

            .achievement-name {
                font-size: 2.5vmin;
                font-weight: bold;
                margin-bottom: 1vmin;
            }

            .achievement-desc {
                font-size: 2vmin;
                opacity: 0.8;
            }

            .achievement-locked {
                font-size: 2vmin;
                color: #888;
                font-style: italic;
            }

            .achievements-back-btn {
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

            .achievements-back-btn:hover {
                background: #3e8e41;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    updateAchievementsList() {
        if (!this.achievementsGrid || !this.achievementManager) {
        console.error('Achievements grid or manager not available');
        return;
        }

        this.achievementsGrid.innerHTML = '';
        
        try {
            const unlocked = this.achievementManager.getUnlockedAchievements();
            const locked = this.achievementManager.getLockedAchievements();
            
            const allAchievements = [...unlocked, ...locked];

            allAchievements.forEach(achievement => {
                const item = document.createElement('div');
                item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
                
                item.innerHTML = `
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-desc">${achievement.description}</div>
                        ${!achievement.unlocked ? '<div class="achievement-locked">Не разблокировано</div>' : ''}
                    </div>
                `;

                this.achievementsGrid.appendChild(item);
            });

            // Добавим отладочную информацию
            /*
            console.log('Всего достижений:', allAchievements.length);
            console.log('Разблокировано:', unlocked.length);
            console.log('Заблокировано:', locked.length);
            */
        
        } catch (error) {
            console.error('Error updating achievements list:', error);
            this.achievementsGrid.innerHTML = '<div style="color: white; text-align: center; padding: 20px;">Ошибка загрузки достижений</div>';
        }

    }

    show() {
        this.updateAchievementsList();
        this.achievementsScreen.classList.add('active');
    }

    hide() {
        this.achievementsScreen.classList.remove('active');
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