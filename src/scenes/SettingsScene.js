// SettingsScene.js
export default class SettingsScene {
    constructor(game) {
        this.game = game;
        this.settings = this.loadSettings();
        this.setupDOM();
    }

    loadSettings() {
        // Загружаем настройки из localStorage или используем значения по умолчанию
        const defaultSettings = {
            controlMode: 'swipe', // 'buttons', 'keyboard', 'swipe'
            soundVolume: 0.7,
            vibrationEnabled: true
        };

        try {
        const savedSettings = localStorage.getItem('snake_settings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            
            // Обеспечиваем обратную совместимость
            if (typeof parsed.soundEnabled === 'boolean') {
                parsed.soundVolume = parsed.soundEnabled ? 0.7 : 0;
                delete parsed.soundEnabled;
            }
            
            // Убеждаемся, что soundVolume - валидное число
            if (typeof parsed.soundVolume !== 'number' || isNaN(parsed.soundVolume)) {
                parsed.soundVolume = defaultSettings.soundVolume;
            }
            
            return {...defaultSettings, ...parsed};
        }
        return defaultSettings;
        } catch (e) {
            console.error('Error loading settings:', e);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('snake_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    setupDOM() {
        this.settingsScreen = document.getElementById('settingsScreen');
        this.backButton = document.getElementById('settingsBackButton');
        this.controlModeSelect = document.getElementById('controlMode');
        this.soundVolumeSlider = document.getElementById('soundVolume');
        this.volumeValueDisplay = document.getElementById('volumeValue');
        this.vibrationToggle = document.getElementById('vibrationToggle');
        this.volumeTooltip = document.getElementById('volumeTooltip');

        // Устанавливаем текущие значения
        this.controlModeSelect.value = this.settings.controlMode;
        this.soundVolumeSlider.value = this.settings.soundVolume * 100;
        this.vibrationToggle.checked = this.settings.vibrationEnabled;

        // Обработчики событий
        this.backButton.addEventListener('click', () => {
            this.hide();
            this.game.stateManager.showScreen('menu');
        });

        this.controlModeSelect.addEventListener('change', (e) => {
            this.settings.controlMode = e.target.value;
            this.saveSettings();
            this.applySettings();
        });


        // Обработчик для обновления подсказки громкости
        this.soundVolumeSlider.addEventListener('mousedown', () => {
            if (this.volumeTooltip) {
                this.volumeTooltip.style.opacity = '1';
            }
        });

        this.soundVolumeSlider.addEventListener('mouseup', () => {
            if (this.volumeTooltip) {
                setTimeout(() => {
                    if (this.volumeTooltip) {
                        this.volumeTooltip.style.opacity = '0';
                    }
                }, 1000);
            }
        });

        this.soundVolumeSlider.addEventListener('touchstart', () => {
            if (this.volumeTooltip) {
                this.volumeTooltip.style.opacity = '1';
            }
        });

        this.soundVolumeSlider.addEventListener('touchend', () => {
            if (this.volumeTooltip) {
                setTimeout(() => {
                    if (this.volumeTooltip) {
                        this.volumeTooltip.style.opacity = '0';
                    }
                }, 1000);
            }
        });

        this.soundVolumeSlider.addEventListener('input', (e) => {
        this.settings.soundVolume = e.target.value / 100; // Преобразуем обратно в 0-1
        this.updateVolumeTooltip(e.target.value);
        this.saveSettings();
        this.applySettings();
        });

        // Инициализируем позицию подсказки
        this.updateVolumeTooltip(this.soundVolumeSlider.value);

        this.vibrationToggle.addEventListener('change', (e) => {
            this.settings.vibrationEnabled = e.target.checked;
            this.saveSettings();
            this.applySettings();
        });


    }

    updateVolumeTooltip(value) {
    if (this.volumeTooltip) {
        this.volumeTooltip.textContent = `${value}%`;
        
        // Обновляем позицию подсказки относительно ползунка
        const slider = this.soundVolumeSlider;
        const percent = (slider.value - slider.min) / (slider.max - slider.min);
        const tooltipWidth = this.volumeTooltip.offsetWidth;
        const sliderWidth = slider.offsetWidth;
        
        this.volumeTooltip.style.left = `${percent * (sliderWidth - tooltipWidth/2) + tooltipWidth/4}px`;
    }
    }

    applySettings() {
        // Применяем настройки к игре
        if (this.game.applySettings) {
            this.game.applySettings(this.settings);
        }
        
        // Показываем/скрываем кнопки управления в зависимости от режима
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.style.display = this.settings.controlMode === 'buttons' ? 'flex' : 'none';
        }
    }

    show() {
        this.settingsScreen.style.display = 'flex';
        setTimeout(() => {
            this.settingsScreen.style.opacity = '1';
        }, 10);
        this.applySettings();
    }

    hide() {
        this.settingsScreen.style.opacity = '0';
        setTimeout(() => {
            this.settingsScreen.style.display = 'none';
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