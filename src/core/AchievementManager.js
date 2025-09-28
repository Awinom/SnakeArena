// core/AchievementManager.js
export default class AchievementManager {
    constructor(game) {
        this.game = game;
        this.achievements = new Map();
        this.unlockedAchievements = new Set();
        this.loadAchievements();
        this.setupAchievements();
    }

    setupAchievements() {

        // Очищаем предыдущие достижения
        this.achievements.clear();

        // Базовые достижения (только 5 уникальных)
        const achievementDefinitions = [
            {
                id: 'first_blood',
                name: 'Первый сок',
                description: 'Съесть первую еду',
                icon: '🍎',
                condition: (game) => game.scenes.game.score > 0
            },
            {
                id: 'snake_growth',
                name: 'Длиннющий',
                description: 'Достичь длины змейки в 50 сегментов',
                icon: '🐍',
                condition: (game) => game.scenes.game.snake.body.length >= 50
            },
            {
                id: 'sharpshooter',
                name: 'В яблочко',
                description: 'Попасть снарядом в еду 10 раз',
                icon: '🎯',
                condition: (game) => {
                    // Добавим счетчик попаданий в GameScene
                    return game.scenes.game.projectilesHit >= 10;
                }
            },
            {
                id: 'survivor',
                name: 'Выживший',
                description: 'Прожить 100 секунд без столкновений',
                icon: '⏱️',
                condition: (game) => game.scenes.game.survivalTime >= 100
            },
            {
                id: 'combo_master',
                name: 'Ярость Богов',
                description: 'Съесть 3 яблока за 1 секунду',
                icon: '🔥',
                condition: (game) => game.scenes.game.maxCombo >= 3
            },
            {
                id: 'canibal',
                name: 'Ганнибал',
                description: 'Съесть 10 сегментов себя',
                icon: '🍴',
                condition: (game) => game.scenes.game.canibal >= 10
            },
            {
                id: 'vinner',
                name: 'Ювелир',
                description: 'Заполни своим змеем все клетки',
                icon: '🧒',
                condition: (game) => game.scenes.game.isVinner >= 1
            },
            {
                id: 'samurai',
                name: 'Самурай',
                description: 'Убей себя выстрелом 10 раз',
                icon: '👺',
                condition: (game) => game.scenes.game.HeadShoot >= 10
            }
        ];

        // Добавляем достижения в Map
        achievementDefinitions.forEach(achievement => {
            this.addAchievement(achievement);
        });
    }

    addAchievement(achievement) {
        this.achievements.set(achievement.id, {
            ...achievement,
            unlocked: false,
            unlockedAt: null
        });
    }

    loadAchievements() {
        try {
            const saved = localStorage.getItem('snake_achievements');
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedAchievements = new Set(data.unlocked || []);

                // Обновляем состояние разблокировки в achievements
                this.achievements.forEach((achievement, id) => {
                    if (this.unlockedAchievements.has(id)) {
                        achievement.unlocked = true;
                        achievement.unlockedAt = data.unlockedAt?.[id] || null;
                    }
                });
            }
        } catch (e) {
            console.error('Error loading achievements:', e);
        }
    }

    saveAchievements() {
        try {
            const unlockedAt = {};
            this.achievements.forEach((achievement, id) => {
                if (achievement.unlocked) {
                    unlockedAt[id] = achievement.unlockedAt;
                }
            });

            const data = {
                unlocked: Array.from(this.unlockedAchievements),
                unlockedAt: unlockedAt,
                timestamp: Date.now()
            };
            localStorage.setItem('snake_achievements', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving achievements:', e);
        }
    }

    checkAchievements() {
        let unlockedCount = 0;
        
        this.achievements.forEach((achievement, id) => {
            if (!achievement.unlocked) {
                try {
                    if (achievement.condition(this.game)) {
                        this.unlockAchievement(id);
                        unlockedCount++;
                    }
                } catch (error) {
                    console.error(`Error checking achievement ${id}:`, error);
                }
            }
        });

        return unlockedCount;
    }

    unlockAchievement(id) {
        if (this.unlockedAchievements.has(id)) return;

        const achievement = this.achievements.get(id);
        if (achievement) {
            achievement.unlocked = true;
            achievement.unlockedAt = Date.now();
            this.unlockedAchievements.add(id);
            this.saveAchievements();
            
            this.showAchievementNotification(achievement);
            //console.log(`Achievement unlocked: ${achievement.name} - ${achievement.description}`);
        }
    }

    showAchievementNotification(achievement) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">
                <div class="achievement-title">Достижение разблокировано!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;

        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #4CAF50;
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getAchievementProgress(id) {
        const achievement = this.achievements.get(id);
        if (!achievement) return 0;
        
        // Для прогрессивных достижений можно добавить логику
        return achievement.unlocked ? 100 : 0;
    }

    getUnlockedAchievements() {
        const unlocked = [];
        this.achievements.forEach((achievement, id) => {
            if (achievement.unlocked) {
                unlocked.push(achievement);
            }
        });
        return unlocked.sort((a, b) => (a.unlockedAt || 0) - (b.unlockedAt || 0));
    }

    getLockedAchievements() {
        const locked = [];
        this.achievements.forEach((achievement, id) => {
            if (!achievement.unlocked) {
                locked.push(achievement);
            }
        });
        return locked.sort((a, b) => a.name.localeCompare(b.name));
    }

    getAllAchievements() {
        const all = [];
        this.achievements.forEach(achievement => {
            all.push(achievement);
        });
        return all.sort((a, b) => {
            // Сначала разблокированные, потом заблокированные
            if (a.unlocked && !b.unlocked) return -1;
            if (!a.unlocked && b.unlocked) return 1;
            // Затем по времени разблокировки или по имени
            if (a.unlocked && b.unlocked) {
                return (a.unlockedAt || 0) - (b.unlockedAt || 0);
            }
            return a.name.localeCompare(b.name);
        });
    }
}