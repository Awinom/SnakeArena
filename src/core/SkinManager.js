// src/core/SkinManager.js
export default class SkinManager {
    constructor(game) {
        this.game = game;
        this.skins = new Map();
        this.currentSkin = 'default';
        this.imagesLoaded = false;
        this.loadSkins();
        this.loadSelectedSkin();
    }

    async loadSkins() {
        // Базовые скины с путями к PNG-файлам
        const skinDefinitions = [
            {
                id: 'default',
                name: 'Классический',
                head: './assets/skins/default/head.png',
                body: './assets/skins/default/body.png', 
                tail: './assets/skins/default/tail.png',
                isUnlocked: true,
                price: 0,
                // Для совместимости - цвета как fallback
                headColor: '#51c056ff',
                bodyColor: '#4CAF50',
                tailColor: '#4CAF50'
            },
            {
                id: 'fire',
                name: 'Огненный',
                head: './assets/skins/fire/head.png',
                body: './assets/skins/fire/body.png',
                tail: './assets/skins/fire/tail.png', 
                isUnlocked: false,
                price: 100,
                headColor: '#FF4500',
                bodyColor: '#FF6347',
                tailColor: '#FF6347'
            },
            {
                id: 'ice',
                name: 'Ледяной',
                head: './assets/skins/ice/head.png',
                body: './assets/skins/ice/body.png',
                tail: './assets/skins/ice/tail.png',
                isUnlocked: false,
                price: 150,
                headColor: '#00BFFF',
                bodyColor: '#87CEEB', 
                tailColor: '#87CEEB'
            },
            {
                id: 'gold',
                name: 'Золотой',
                head: './assets/skins/gold/head.png',
                body: './assets/skins/gold/body.png',
                tail: './assets/skins/gold/tail.png',
                isUnlocked: false,
                price: 200,
                headColor: '#FFD700',
                bodyColor: '#DAA520',
                tailColor: '#DAA520'
            }
        ];

        // Загружаем изображения для каждого скина
        for (const skinDef of skinDefinitions) {
            try {
                const skin = {
                    ...skinDef,
                    images: {
                        head: await this.loadImage(skinDef.head),
                        body: await this.loadImage(skinDef.body),
                        tail: await this.loadImage(skinDef.tail)
                    }
                };
                this.skins.set(skinDef.id, skin);
            } catch (error) {
                console.warn(`Failed to load skin ${skinDef.id}:`, error);
                // Используем fallback на цвета если изображения не загрузились
                this.skins.set(skinDef.id, {
                    ...skinDef,
                    images: null,
                    useColors: true
                });
            }
        }

        this.imagesLoaded = true;
        console.log('All skins loaded successfully');
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    getCurrentSkin() {
        const skin = this.skins.get(this.currentSkin) || this.skins.get('default');
        
        // Если изображения не загружены, используем цвета
        if (!skin.images && !skin.useColors) {
            console.warn(`Skin ${this.currentSkin} images not loaded, using colors as fallback`);
            skin.useColors = true;
        }
        
        return skin;
    }

    // Остальные методы остаются без изменений
    unlockSkin(skinId) {
        const skin = this.skins.get(skinId);
        if (skin) {
            skin.isUnlocked = true;
            this.saveSkins();
            return true;
        }
        return false;
    }

    setCurrentSkin(skinId) {
        const skin = this.skins.get(skinId);
        if (skin && skin.isUnlocked) {
            this.currentSkin = skinId;
            this.saveSelectedSkin();
            return true;
        }
        return false;
    }

    getUnlockedSkins() {
        return Array.from(this.skins.values()).filter(skin => skin.isUnlocked);
    }

    getLockedSkins() {
        return Array.from(this.skins.values()).filter(skin => !skin.isUnlocked);
    }

    loadSelectedSkin() {
        try {
            const saved = localStorage.getItem('snake_selected_skin');
            if (saved && this.skins.has(saved)) {
                this.currentSkin = saved;
            }
        } catch (e) {
            console.error('Error loading selected skin:', e);
        }
    }

    saveSelectedSkin() {
        try {
            localStorage.setItem('snake_selected_skin', this.currentSkin);
        } catch (e) {
            console.error('Error saving selected skin:', e);
        }
    }

    saveSkins() {
        try {
            const skinsData = {};
            this.skins.forEach((skin, id) => {
                skinsData[id] = {
                    isUnlocked: skin.isUnlocked
                };
            });
            localStorage.setItem('snake_skins', JSON.stringify(skinsData));
        } catch (e) {
            console.error('Error saving skins:', e);
        }
    }

    loadSkinsFromStorage() {
        try {
            const saved = localStorage.getItem('snake_skins');
            if (saved) {
                const skinsData = JSON.parse(saved);
                Object.keys(skinsData).forEach(skinId => {
                    const skin = this.skins.get(skinId);
                    if (skin) {
                        skin.isUnlocked = skinsData[skinId].isUnlocked;
                    }
                });
            }
        } catch (e) {
            console.error('Error loading skins from storage:', e);
        }
    }
}