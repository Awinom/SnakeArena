// scenes/VictoryScene.js
export default class VictoryScene {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.setupDOM();
    }

    setupDOM() {
        // Создаем элемент экрана победы
        this.victoryScreen = document.createElement('div');
        this.victoryScreen.id = 'victoryScreen';
        this.victoryScreen.className = 'victory-screen';
        this.victoryScreen.innerHTML = `
            <div class="video-background">
                <video id="SnakeVin" autoplay muted loop playsinline>
                    <source src="assets/video/SnakeVin.mp4" type="video/mp4">
                    <source src="assets/video/SnakeVin.webm" type="video/webm">
                    Ваш браузер не поддерживает видео.
                </video>
                <div class="video-overlay"></div>
            </div>
            <div class="victory-content">
                <h2 class="victory-title">ПОБЕДА!</h2>
                <p class="victory-message">Вы достигли максимальной длины!</p>
                <p class="victory-score">Ваш счет: <span id="victoryScore">0</span></p>
                <div class="victory-buttons">
                    <button id="victoryExitButton" class="victory-btn">Выйти</button>
                    <button id="victoryRestartButton" class="victory-btn">Начать заново</button>                    
                </div>
            </div>
        `;

        document.body.appendChild(this.victoryScreen);

        this.victoryScoreElement = document.getElementById('victoryScore');
        this.victoryRestartButton = document.getElementById('victoryRestartButton');
        this.victoryExitButton = document.getElementById('victoryExitButton');
        this.SnakeVin = document.getElementById('SnakeVin');

        this.victoryRestartButton.addEventListener('click', () => {
            this.hide();
            this.game.stateManager.showScreen('game');
            this.game.scenes.game.reset();
        });

        this.victoryExitButton.addEventListener('click', () => {
            this.hide();
            this.game.stateManager.showScreen('menu');
        });

        this.setupStyles();
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .victory-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 3000;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }

            .victory-screen.active {
                opacity: 1;
                pointer-events: all;
            }

            .victory-content {
                padding: 4vmin;
                border-radius: 12px;
                text-align: center;
	            align-items: center;
                display: flex; 
                width: 80%;
                max-width: 80vmin;
                flex-direction: column; /* Вертикальное направление */
                align-items: center; /* Центрируем по горизонтали */
                justify-content: center; /* Центрируем по вертикали */
            }

            .victory-title {
                color: #d6d6d6;
                font-size: 6vmin;
                margin-bottom: 1vmin;
                text-shadow: 0 0 0.2vmin rgba(247, 247, 247, 0.5);
            }

            .victory-message {
                color: #d6d6d6;
                font-size: 3.5vmin;
                margin-bottom: 2vmin;
            }

            .victory-score {
                color: #d6d6d6;
                font-size: 3vmin;
                margin-bottom: 6vmin;
            }

            .victory-buttons {
                display: flex;
                gap: 4vmin;
                width: 68vmin;
                max-width: 70vmin;
                justify-content: center;
            }

            .victory-btn {
                padding: 2vmin 4vmin;
                border: none;
                border-radius: 6px;
                font-size: 3.5vmin;
                cursor: pointer;
                transition: all 0.2s;
                flex: 1;
            }

            #victoryRestartButton {
                background: #4CAF50;
                color: white;
            }

            #victoryExitButton {
                background: #f44336;
                color: white;
            }

            .victory-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            }



            /* АНИМАЦИИ */

            .victory-screen.active {
            opacity: 1;
            pointer-events: all;
            animation: screenPulse 3s infinite alternate;
        }

        @keyframes screenPulse {
            0% {
                background: rgba(0, 0, 0, 0.85);
            }
            100% {
                background: rgba(1, 32, 27, 0.9);
            }
        }

        .victory-content {
            /* остальные стили */
            animation: contentAppear 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            transform-origin: center;
        }

        @keyframes contentAppear {
            0% {
                transform: scale(0.5) rotate(-5deg);
                opacity: 0;
            }
            70% {
                transform: scale(1.05) rotate(2deg);
            }
            100% {
                transform: scale(1) rotate(0);
                opacity: 1;
            }
        }

        .victory-title {
            color: #d6d6d6;
            font-size: 6vmin;
            margin-bottom: 1vmin;
            text-shadow: 0 0 0.2vmin rgba(247, 247, 247, 0.5);
            animation: titleGlow 2s infinite alternate;
        }

        @keyframes titleGlow {
            0% {
                text-shadow: 0 0 0.5vmin rgba(255, 255, 255, 0.5),
                             0 0 1vmin rgba(255, 215, 0, 0.3);
                transform: scale(1);
            }
            100% {
                text-shadow: 0 0 1vmin rgba(255, 255, 255, 0.8),
                             0 0 2vmin rgba(255, 215, 0, 0.6),
                             0 0 3vmin rgba(255, 165, 0, 0.4);
                transform: scale(1.05);
            }
        }

        .victory-score {
            color: #d6d6d6;
            font-size: 3vmin;
            margin-bottom: 6vmin;
            animation: scoreCountUp 1.5s ease-out forwards;
            opacity: 0;
            animation-delay: 0.5s;
        }

        @keyframes scoreCountUp {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            opacity: 0.7;
            animation: confettiFall 5s linear forwards;
        }

        @keyframes confettiFall {
            0% {
                transform: translateY(-100px) rotate(0deg);
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
            }
        }



        /* ВИДЕО */

        .video-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
                background: linear-gradient(135deg, #2c3459ff 0%, #2f1e41ff 100%); /* Красивый градиентный фон */
            }

            #SnakeVin {
                position: absolute;
                top: 50%;
                left: 50%;
                min-width: 100%;
                min-height: 100%;
                width: auto;
                height: auto;
                transform: translateX(-50%) translateY(-50%);
                object-fit: cover;
                opacity: 0.6; /* Полупрозрачность видео */
            }

            .video-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);                
            }


        `;
        document.head.appendChild(style);
    }

    animateScore(finalScore) {
    let currentScore = 0;
    const duration = 2000; // 2 секунды
    const increment = finalScore / (duration / 16); // 60fps
    
    const updateScore = () => {
        currentScore += increment;
        if (currentScore >= finalScore) {
            currentScore = finalScore;
            this.victoryScoreElement.textContent = Math.round(currentScore);
            return;
        }
        
        this.victoryScoreElement.textContent = Math.round(currentScore);
        requestAnimationFrame(updateScore);
    };
    
    updateScore();
}

    animateScore(finalScore) {
        let currentScore = 0;
        const duration = 2000;
        const increment = finalScore / (duration / 16);
        
        const updateScore = () => {
            currentScore += increment;
            if (currentScore >= finalScore) {
                currentScore = finalScore;
                this.victoryScoreElement.textContent = Math.round(currentScore);
                return;
            }
            
            this.victoryScoreElement.textContent = Math.round(currentScore);
            requestAnimationFrame(updateScore);
        };
        
        updateScore();
    }

    show(score) {
        this.score = score;
        if (this.victoryScoreElement) {
            this.victoryScoreElement.textContent = score;
        }
        this.victoryScreen.classList.add('active');
        this.animateScore(score);

        // Перезапускаем видео для синхронизации
        if (this.SnakeVin) {
            this.SnakeVin.currentTime = 0;
            this.SnakeVin.play();
        }
    }

    hide() {
        this.victoryScreen.classList.remove('active');

        // Пауза видео чтобы не тратились ресурсы
        if (this.SnakeVin) {
            this.SnakeVin.pause();
        }
    }

    // Методы для StateManager
    activate(score) {
        this.show(score);
    }

    deactivate() {
        this.hide();
    }

    update() {}
    render() {}
}