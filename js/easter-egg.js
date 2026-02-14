// ============================================
// Easter Egg: Konami Code Mini-Game
// ↑↑↓↓←→←→BA triggers a retro code-catcher game
// ============================================

(function () {
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    // Listen for Konami code
    document.addEventListener('keydown', (e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (key === KONAMI[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === KONAMI.length) {
                konamiIndex = 0;
                launchGame();
            }
        } else {
            konamiIndex = 0;
        }
    });

    function launchGame() {
        // Don't launch if already open
        if (document.getElementById('easterEggOverlay')) return;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'easterEggOverlay';
        overlay.innerHTML = `
            <div class="egg-game-container">
                <div class="egg-header">
                    <h2>🎮 CODE CATCHER</h2>
                    <div class="egg-stats">
                        <span>Score: <strong id="eggScore">0</strong></span>
                        <span>Time: <strong id="eggTime">30</strong>s</span>
                    </div>
                    <button class="egg-close" id="eggClose">✕</button>
                </div>
                <canvas id="eggCanvas"></canvas>
                <div class="egg-instructions">Use ← → arrow keys to catch falling code symbols!</div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Apply styles
        const style = document.createElement('style');
        style.id = 'easterEggStyles';
        style.textContent = `
            #easterEggOverlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.92);
                backdrop-filter: blur(12px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: eggFadeIn 0.4s ease;
            }
            @keyframes eggFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .egg-game-container {
                background: rgba(15, 15, 25, 0.95);
                border: 1px solid rgba(0, 232, 157, 0.3);
                border-radius: 20px;
                padding: 1.5rem;
                box-shadow: 0 0 60px rgba(0, 232, 157, 0.15), 0 0 120px rgba(123, 97, 255, 0.08);
                max-width: 600px;
                width: 90vw;
            }
            .egg-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 1rem;
                gap: 1rem;
            }
            .egg-header h2 {
                font-size: 1.3rem;
                font-weight: 800;
                background: linear-gradient(135deg, #00e89d, #7b61ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin: 0;
                white-space: nowrap;
            }
            .egg-stats {
                display: flex;
                gap: 1.5rem;
                font-family: 'IBM Plex Mono', monospace;
                color: #aaa;
                font-size: 0.9rem;
            }
            .egg-stats strong {
                color: #00e89d;
            }
            .egg-close {
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.1);
                color: #fff;
                width: 36px; height: 36px;
                border-radius: 10px;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .egg-close:hover {
                background: rgba(255, 70, 70, 0.3);
                border-color: rgba(255, 70, 70, 0.5);
            }
            #eggCanvas {
                width: 100%;
                border-radius: 12px;
                background: #0a0a14;
                display: block;
            }
            .egg-instructions {
                text-align: center;
                color: rgba(255,255,255,0.4);
                font-size: 0.8rem;
                margin-top: 0.75rem;
                font-family: 'IBM Plex Mono', monospace;
            }
            .egg-game-over {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: white;
                z-index: 10;
            }
            .egg-game-over h3 {
                font-size: 2rem;
                margin-bottom: 0.5rem;
                background: linear-gradient(135deg, #00e89d, #7b61ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        `;
        document.head.appendChild(style);

        // Initialize game
        const canvas = document.getElementById('eggCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 560;
        canvas.height = 400;

        let score = 0;
        let timeLeft = 30;
        let gameRunning = true;
        let paddleX = canvas.width / 2 - 50;
        const paddleW = 100, paddleH = 14;
        const symbols = ['{ }', '< >', '//', '=>', '( )', '[ ]', '&&', '||', '!=', '++'];
        const fallingItems = [];
        const keys = {};

        // Key handling
        const keyHandler = (e) => {
            keys[e.key] = e.type === 'keydown';
            if (e.key === 'Escape') closeGame();
        };
        document.addEventListener('keydown', keyHandler);
        document.addEventListener('keyup', keyHandler);

        // Spawn items
        function spawnItem() {
            if (!gameRunning) return;
            fallingItems.push({
                x: Math.random() * (canvas.width - 40) + 20,
                y: -20,
                speed: 2 + Math.random() * 3,
                text: symbols[Math.floor(Math.random() * symbols.length)],
                color: ['#00e89d', '#7b61ff', '#ff6b9d', '#ffd93d', '#6bddff'][Math.floor(Math.random() * 5)],
                caught: false,
                alpha: 1,
            });
        }

        // Game timer
        const timerInterval = setInterval(() => {
            if (!gameRunning) return;
            timeLeft--;
            document.getElementById('eggTime').textContent = timeLeft;
            if (timeLeft <= 0) {
                gameRunning = false;
                clearInterval(timerInterval);
                showGameOver();
            }
        }, 1000);

        // Spawn interval
        const spawnInterval = setInterval(() => {
            if (gameRunning) spawnItem();
        }, 600);

        function showGameOver() {
            const msg = score >= 20 ? "You're a coding legend! 🏆"
                : score >= 10 ? "Nice catch! 🎯"
                    : "Keep practicing! 💪";

            const goDiv = document.createElement('div');
            goDiv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:white;z-index:10;';
            goDiv.innerHTML = `
                <h3 style="font-size:2rem;margin-bottom:0.5rem;color:#00e89d;">Game Over!</h3>
                <p style="font-size:1.4rem;margin-bottom:0.25rem;">Score: <strong style="color:#7b61ff;">${score}</strong></p>
                <p style="color:#aaa;font-size:0.95rem;">${msg}</p>
                <p style="color:#555;font-size:0.8rem;margin-top:1rem;">Press ESC to close</p>
            `;
            overlay.querySelector('.egg-game-container').style.position = 'relative';
            overlay.querySelector('.egg-game-container').appendChild(goDiv);
        }

        function gameLoop() {
            if (!document.getElementById('easterEggOverlay')) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw glow grid background
            ctx.strokeStyle = 'rgba(0, 232, 157, 0.04)';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            // Move paddle
            if (gameRunning) {
                if (keys['ArrowLeft'] && paddleX > 0) paddleX -= 7;
                if (keys['ArrowRight'] && paddleX < canvas.width - paddleW) paddleX += 7;
            }

            // Draw paddle
            const grad = ctx.createLinearGradient(paddleX, 0, paddleX + paddleW, 0);
            grad.addColorStop(0, '#00e89d');
            grad.addColorStop(1, '#7b61ff');
            ctx.fillStyle = grad;
            ctx.shadowColor = '#00e89d';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.roundRect(paddleX, canvas.height - paddleH - 15, paddleW, paddleH, 7);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Update & draw falling items
            for (let i = fallingItems.length - 1; i >= 0; i--) {
                const item = fallingItems[i];

                if (gameRunning && !item.caught) {
                    item.y += item.speed;

                    // Collision with paddle
                    if (item.y + 15 >= canvas.height - paddleH - 15 &&
                        item.y + 15 <= canvas.height - 15 &&
                        item.x >= paddleX - 10 &&
                        item.x <= paddleX + paddleW + 10) {
                        item.caught = true;
                        score++;
                        document.getElementById('eggScore').textContent = score;

                        // Flash effect
                        ctx.fillStyle = item.color;
                        ctx.globalAlpha = 0.3;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.globalAlpha = 1;
                    }
                }

                if (item.caught) {
                    item.alpha -= 0.08;
                    if (item.alpha <= 0) {
                        fallingItems.splice(i, 1);
                        continue;
                    }
                }

                // Remove if off screen
                if (item.y > canvas.height + 20) {
                    fallingItems.splice(i, 1);
                    continue;
                }

                // Draw symbol
                ctx.font = 'bold 18px "IBM Plex Mono", monospace';
                ctx.fillStyle = item.color;
                ctx.globalAlpha = item.alpha;
                ctx.shadowColor = item.color;
                ctx.shadowBlur = 8;
                ctx.fillText(item.text, item.x - 12, item.y);
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }

            requestAnimationFrame(gameLoop);
        }

        function closeGame() {
            gameRunning = false;
            clearInterval(timerInterval);
            clearInterval(spawnInterval);
            document.removeEventListener('keydown', keyHandler);
            document.removeEventListener('keyup', keyHandler);
            const el = document.getElementById('easterEggOverlay');
            if (el) {
                el.style.animation = 'eggFadeIn 0.3s ease reverse';
                setTimeout(() => el.remove(), 300);
            }
            const style = document.getElementById('easterEggStyles');
            if (style) style.remove();
        }

        document.getElementById('eggClose').addEventListener('click', closeGame);
        gameLoop();
        spawnItem();
    }

})();
