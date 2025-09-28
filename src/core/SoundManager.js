// SoundManager.js
export default class SoundManager {
    constructor() {
        this.sounds = {};
        this.volume = 0.7;
        this.enabled = true;
        this.audioContext = null;
        this.unlocked = false;

        // Попытка разблокировки аудио на мобильных устройствах
        this.unlockAudio();
    }

    unlockAudio() {
        // Создаем контекст аудио
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API is not supported', e);
        }

        // Функция для разблокировки аудио
        const unlock = () => {
            if (this.unlocked) return;
            
            // Создаем пустой буфер и воспроизводим его
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
            
            this.unlocked = true;
        };

        // Разблокируем аудио по клику или касанию
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
    }

    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.addEventListener('canplaythrough', () => {
                this.sounds[name] = audio;
                resolve();
            });
            audio.addEventListener('error', (e) => {
                console.error(`Error loading sound ${name}:`, e);
                reject(e);
            });
            audio.src = url;
            audio.load();
        });
    }

    playSound(name) {
        if (this.volume <= 0 || !this.sounds[name]) return;
        
        try {
            // Клонируем звук для возможности одновременного воспроизведения
            const clone = this.sounds[name].cloneNode();
            clone.volume = this.volume;
            clone.play().catch(e => {
                console.log('Audio play failed, trying to unlock:', e);
                this.unlocked = false;
                this.unlockAudio();
            });
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    }

    setVolume(volume) {
        // Убеждаемся, что volume - это число между 0 и 1
        if (typeof volume !== 'number' || isNaN(volume)) {
            volume = 0.7; // Значение по умолчанию
        }
        
        // Ограничиваем значение между 0 и 1
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Обновляем громкость уже загруженных звуков
        Object.values(this.sounds).forEach(sound => {
            if (sound && typeof sound.volume === 'number') {
                sound.volume = this.volume;
            }
        });
    }

    vibrate(pattern) {
        if (navigator.vibrate && this.enabled) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                console.error('Vibration failed:', e);
            }
        }
    }
}