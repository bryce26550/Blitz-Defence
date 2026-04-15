// Global variables
let pendingAction = 'play';

// Payment functions
function pay() {
    document.querySelector('.payment-content').style.display = 'block';
    document.querySelector('.payment-overlay').style.display = 'block';
}

function hidePayment() {
    document.querySelector('.payment-content').style.display = 'none';
    document.querySelector('.payment-overlay').style.display = 'none';

    // Check if we need to return to pause menu
    if (window.game && window.game.restartFromPause) {
        console.log('Payment cancelled, returning to pause menu');
        window.game.restartFromPause = false; // Reset flag
        window.game.showPauseMenu(); // Show pause menu again
    }
}

const AVAILABLE_TOWER_SHOP_KEYS = new Set(['shooter', 'blaster']);

function isTowerShopAvailable(key) {
    return AVAILABLE_TOWER_SHOP_KEYS.has(key);
}

async function post(path, body) {
    const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

async function doTransfer() {
    const pin = document.getElementById('pin').value;

    if (!pin) {
        alert('Please enter your PIN.');
        return;
    }

    console.log('Sending payment request with PIN:', pin);

    try {
        const result = await post('/payIn', { pin });
        console.log('Raw server response:', result);

        if (result.ok === true) {
            hidePayment();

            await new Promise(resolve => setTimeout(resolve, 100));

            if (window.game) {
                console.log('Calling game.startGame()...');

                // Check if this was a restart from pause menu
                if (window.game.restartFromPause) {
                    window.game.restartFromPause = false; // Reset flag
                    window.game.restart(true); // Restart and begin immediately
                } else {
                    window.game.startGame(); // Normal start
                }
            } else {
                console.error('window.game not found!');
            }
            return;
        } else {
            let errorMessage = result.error || result.message || 'Unknown error';
            console.log('Payment failed with error:', errorMessage);
            alert('Payment failed: ' + errorMessage);
            console.error('Payment failed:', result);
        }
    } catch (error) {
        console.error('Network/parsing error:', error);
        alert('Payment failed: Network error');
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.serverSessionId = null

        this.player = new Player(this.width / 2, this.height - 50);
        this.mouseX = this.width / 2;
        this.mouseY = this.height / 2;
        this.bullets = [];
        this.lineshots = [];
        this.enemies = [];
        this.shooters = [];
        this.tanks = [];
        this.sprinters = [];
        this.bosses = [];
        this.particles = [];

        this.exp = 0;
        this.level = 1;
        this.sheild = 250;
        this.maxSheild = 250;
        this.money = 500;
        this.expToNextLevel = 100;
        this.showLevelUp = false;

        // Game state flags
        this.started = false;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gamePausedReason = '';
        this.restartFromPause = false

        // Music setup
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.currentMusic = null;
        this.musicFading = false;
        this.musicStarted = false;

        // Set volume levels
        if (this.backgroundMusic) this.backgroundMusic.volume = 0.05;

        this.soundEffects = {
            enemyHit: document.getElementById('enemyHit'),
            enemyShot: document.getElementById('enemyShot'),
            playerHit: document.getElementById('playerHit'),
            playerShot: document.getElementById('playerShot'),
            playerDefeat: document.getElementById('playerDefeat'),
            bossDefeat: document.getElementById('bossDefeat'),
            slasherDash: document.getElementById('slasherDash'),
            railgunShot: document.getElementById('railgunShot')
        }

        Object.values(this.soundEffects).forEach(sound => {
            if (sound) {
                sound.loop = false;
            }
        });

        // Start background music
        this.startBackgroundMusic()

        // Wave system
        this.waveManager = new WaveManager();
        this.currentWave = [];
        this.currentWaveIndex = 0;
        this.waveComplete = false;
        this.totalWaves = this.waveManager.getTotalWaves();
        this.spawnTimer = 0;
        this.spawnDelay = 250; // 0.25 seconds in milliseconds
        this.waveStartAllowed = false; // Flag to control wave start button availability

        // Load persisted settings
        const _saved = (() => { try { return JSON.parse(localStorage.getItem('blitzDefenceSettings') || '{}'); } catch (e) { return {}; } })();
        this.autoStart = _saved.waveAuto === true;  // default: manual
        this.showTooltips = _saved.tooltips !== false;  // default: on
        this.soundEnabled = _saved.sound !== false;  // default: on
        this.applySoundSetting();

        // Multi-track spawning modes
        this.multiTrackMode = 'perWave'; // 'perEnemy', 'perWave', or 'single'
        this.currentTrackIndex = 0; // For rotating tracks
        this.waveTrackIndex = 0; // For wave-based track selection

        this.keys = {};
        this.lastTime = 0;
        this.waveNumber = 1;
        this.waveStartTime = Date.now();

        // Enemy tracking
        this.totalEnemiesInWave = 0;
        this.enemiesSpawned = 0;
        this.enemiesAlive = 0;


        // UI hit rects for canvas interactions
        this.uiRects = {
            startButton: null,
            colorBox: null,
            shapeBox: null,
            previewBox: null,
            upgradeOptions: [],
            pause: { resumeButton: null, restartButton: null },
            waveStart: { x: this.width - 45, y: this.height - 45, w: 30, h: 30 }
        };

        // Map management
        this.mapManager = new MapManager(this.width, this.height);

        // Tower system
        this.placedTowers = [];          // Tower instances placed on the map
        this.selectedTower = null;       // Key from TOWER_TYPES currently selected in shop
        this.selectedPlacedTower = null; // Currently selected placed tower for upgrades
        this.towerShopRects = [];        // Clickable rects for the bottom shop panel
        this.storeOpen = false;          // Right-side store dock visibility

        this.renderer = new GameRenderer(this);

        this.showStartMenu(); // Show start menu initially
        this.setupEventListeners();

        // Load player customization from server
        this.loadPlayerCustomization();

        this.gameLoop();
    }

    showStartMenu() {
        this.hideAllMenus();
        document.getElementById('startMenu').classList.remove('hidden');
        this.updatePlayerPreview();
    }

    showPauseMenu() {
        this.hideAllMenus();
        document.getElementById('pauseMenu').classList.remove('hidden');
    }

    showLevelUpMenu() {
        this.hideAllMenus();
        document.getElementById('levelUpMenu').classList.remove('hidden');
        this.populateUpgradeOptions();
    }

    hideAllMenus() {
        const menuIds = ['startMenu', 'pauseMenu', 'levelUpMenu', 'gameOver', 'victoryMenu'];
        menuIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
            } else {
                console.error(`Element ${id} not found!`);
            }
        });
    }

    startBackgroundMusic() {
        if (this.backgroundMusic) {
            this.currentMusic = this.backgroundMusic;
            this.fadeIn(this.backgroundMusic);
        }
    }

    startMusicIfNeeded() {
        if (!this.musicStarted && this.backgroundMusic) {
            this.musicStarted = true;
            this.currentMusic = this.backgroundMusic;
            this.fadeIn(this.backgroundMusic);
        }
    }


    switchToBackgroundMusic() {
        if (this.currentMusic === this.backgroundMusic) return;

        if (this.currentMusic) {
            this.fadeOut(this.currentMusic);
            setTimeout(() => {
                this.currentMusic = this.backgroundMusic;
                this.fadeIn(this.backgroundMusic);
            }, 1000);
        }
    }

    // Method to fade out audio
    fadeOut(audioElement) {
        if (!audioElement || audioElement.paused) return;

        this.musicFading = true;
        const fadeStep = 0.05; // How much to decrease each step
        const fadeInterval = 50; // 50ms between steps (1000ms total / 20 steps)

        const fade = setInterval(() => {
            if (audioElement.volume > fadeStep) {
                audioElement.volume -= fadeStep;
            } else {
                audioElement.volume = 0;
                audioElement.pause();
                clearInterval(fade);
                this.musicFading = false;
            }
        }, fadeInterval);
    }

    // Method to fade in audio
    fadeIn(audioElement) {
        if (!audioElement) return;

        audioElement.volume = 0;
        audioElement.play();
        this.musicFading = true;

        const fadeStep = 0.025; // How much to increase each step  
        const fadeInterval = 50;
        const targetVolume = 0.5;

        const fade = setInterval(() => {
            if (audioElement.volume < targetVolume - fadeStep) {
                audioElement.volume += fadeStep;
            } else {
                audioElement.volume = targetVolume;
                clearInterval(fade);
                this.musicFading = false;
            }
        }, fadeInterval);
    }

    playSound(soundName) {
        if (!this.soundEnabled) return;
        const sound = this.soundEffects[soundName];
        if (sound) {
            sound.loop = false;
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Sound play failed:', e));
        }
    }

    applySoundSetting() {
        const enabled = this.soundEnabled;
        const allAudio = [
            this.backgroundMusic,
            ...Object.values(this.soundEffects)
        ];
        allAudio.forEach(el => { if (el) el.muted = !enabled; });
    }

    updatePlayerPreview() {
        const playerSprite = document.getElementById('playerSprite');
        if (playerSprite) {
            // Clear the sprite and create a canvas for proper rendering
            playerSprite.innerHTML = '';

            const canvas = document.createElement('canvas');
            canvas.width = 30;
            canvas.height = 30;
            canvas.style.width = '30px';
            canvas.style.height = '30px';

            const ctx = canvas.getContext('2d');

            // Create a temporary player object for rendering preview
            const tempPlayer = {
                x: 0,
                y: 0,
                width: 30,
                height: 30,
                color: this.player.color,
                bodyShapeIndex: this.player.bodyShapeIndex,
                innerShapeIndex: this.player.innerShapeIndex,
                drawBodyShape: this.player.drawBodyShape.bind(this.player),
                drawInnerShape: this.player.drawInnerShape.bind(this.player),
                drawStar: this.player.drawStar.bind(this.player),
                drawPolygon: this.player.drawPolygon.bind(this.player),
            };

            // Set the player properties for rendering
            const originalX = this.player.x;
            const originalY = this.player.y;
            const originalBodyShape = this.player.bodyShapeIndex;
            const originalInnerShape = this.player.innerShapeIndex;

            this.player.x = 0;
            this.player.y = 0;
            this.player.bodyShapeIndex = this.player.bodyShapeIndex;
            this.player.innerShapeIndex = this.player.innerShapeIndex;

            // Render the player preview
            this.player.drawBodyShape(ctx);
            this.player.drawInnerShape(ctx, 15, 15, 18);

            // Restore original values
            this.player.x = originalX;
            this.player.y = originalY;
            this.player.bodyShapeIndex = originalBodyShape;
            this.player.innerShapeIndex = originalInnerShape;

            // Add the canvas to the sprite container
            playerSprite.appendChild(canvas);
        }

        // Update text labels with expanded arrays
        const colorNames = ['Green', 'Blue', 'Purple', 'Cyan', 'Orange', 'Red', 'Pink', 'Lavender', 'Yellow', 'Gray'];
        const bodyShapeNames = ['Triangle', 'Circle', 'Square', 'Star', 'Diamond', 'Hexagon', 'Cross'];
        const innerShapeNames = ['Triangle', 'Circle', 'Square', 'Star', 'Diamond', 'Hexagon', 'Cross'];

        const colorNameEl = document.getElementById('colorName');
        const bodyShapeNameEl = document.getElementById('bodyShapeName');
        const shapeNameEl = document.getElementById('shapeName');

        if (colorNameEl) colorNameEl.textContent = colorNames[this.player.colorIndex] || 'Unknown';
        if (bodyShapeNameEl) bodyShapeNameEl.textContent = bodyShapeNames[this.player.bodyShapeIndex] || 'Unknown';
        if (shapeNameEl) shapeNameEl.textContent = innerShapeNames[this.player.innerShapeIndex] || 'Unknown';
    }

    updatePlayerShape(sprite) {
        sprite.classList.remove('triangle-shape', 'circle-shape', 'square-shape');

        if (this.player.shapeIndex === 0) {
            sprite.classList.add('triangle-shape');
        } else if (this.player.shapeIndex === 1) {
            sprite.classList.add('circle-shape');
        } else {
            sprite.classList.add('square-shape');
        }
    }

    populateUpgradeOptions() {
        const upgradeContainer = document.getElementById('upgradeOptions');
        if (!upgradeContainer) return;

        upgradeContainer.innerHTML = '';

        for (let i = 0; i < this.upgradeOptions.length; i++) {
            const upgrade = this.upgradeOptions[i];
            const optionDiv = document.createElement('div');
            optionDiv.className = 'upgrade-option';
            optionDiv.addEventListener('click', () => this.selectUpgrade(i));

            optionDiv.innerHTML = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-number">${i + 1}</div>
        `;

            upgradeContainer.appendChild(optionDiv);
        }
    }

    updateGameUI() {
        // Update all UI elements
        const elements = {
            'levelValue': this.level,
            'expValue': this.exp,
            'expMaxValue': this.expToNextLevel,
            'healthValue': this.sheild,
            'healthMaxValue': this.maxSheild,
            'moneyValue': this.money,
            'currentWave': this.waveNumber,
            'totalWaves': this.totalWaves,
            'towersValue': this.placedTowers.length,
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        }

        const expProgress = (this.exp / this.expToNextLevel) * 100;
        const expProgressFill = document.getElementById('expProgressFill');
        if (expProgressFill) expProgressFill.style.width = expProgress + '%';
        this.updateTowerShopUI();
        this.updateTowerUpgradeUI();
    }

    updateStoreDockUI() {
        const dock = document.getElementById('storeDock');
        const toggleBtn = document.getElementById('storeToggleBtn');
        if (!dock || !toggleBtn) return;

        const shouldShow = this.started && this.gameRunning;
        dock.classList.toggle('hidden', !shouldShow);

        if (!shouldShow) {
            this.storeOpen = false;
            dock.classList.remove('open');
            dock.classList.add('closed');
            toggleBtn.setAttribute('aria-expanded', 'false');
            return;
        }

        dock.classList.toggle('open', this.storeOpen);
        dock.classList.toggle('closed', !this.storeOpen);
        toggleBtn.setAttribute('aria-expanded', this.storeOpen ? 'true' : 'false');
    }

    toggleStoreDock(forceOpen) {
        this.storeOpen = typeof forceOpen === 'boolean' ? forceOpen : !this.storeOpen;
        this.updateStoreDockUI();
    }

    findTowerAtPoint(x, y) {
        for (let i = this.placedTowers.length - 1; i >= 0; i--) {
            const tower = this.placedTowers[i];
            if (!tower) continue;
            if (x >= tower.x && x <= tower.x + tower.width && y >= tower.y && y <= tower.y + tower.height) {
                return tower;
            }
        }
        return null;
    }

    setSelectedPlacedTower(tower) {
        this.selectedPlacedTower = tower || null;
        this.placedTowers.forEach(item => {
            if (item) item.showRange = (item === this.selectedPlacedTower);
        });
        this.updateTowerUpgradeUI();
    }

    updateTowerUpgradeUI() {
        const panel = document.getElementById('towerUpgradePanel');
        const title = document.getElementById('towerUpgradeTitle');
        const body = document.getElementById('towerUpgradeBody');
        const button = document.getElementById('towerUpgradeBtn');
        if (!panel || !title || !body || !button) return;

        this.updateStoreDockUI();

        if (!this.started || !this.gameRunning) {
            return;
        }

        if (!this.selectedPlacedTower) {
            panel.classList.add('inactive');
            title.textContent = 'No Tower Selected';
            body.innerHTML = 'Click a placed tower to view upgrades.';
            button.textContent = 'Upgrade';
            button.disabled = true;
            button.dataset.upgradeId = '';
            return;
        }

        panel.classList.remove('inactive');

        const tower = this.selectedPlacedTower;
        const nextUpgrades = tower.getAvailableUpgrades ? tower.getAvailableUpgrades() : [];
        const nextUpgrade = nextUpgrades[0];

        title.textContent = `${tower.name} (Lv ${tower.level || 1})`;

        if (!nextUpgrade) {
            body.innerHTML = 'No upgrades available yet for this tower.';
            button.textContent = 'Maxed';
            button.disabled = true;
            button.dataset.upgradeId = '';
            return;
        }

        let bodyHTML = '';
        if (nextUpgrade.image) {
            bodyHTML += `<img src="${nextUpgrade.image}" class="upgrade-preview-img" alt="${nextUpgrade.name}">`;
        }
        bodyHTML += `<div class="upgrade-info">
            <div class="upgrade-name">${nextUpgrade.name}</div>
            <div class="upgrade-description">${nextUpgrade.description}</div>
            <div class="upgrade-cost">Cost: $${nextUpgrade.cost}</div>
        </div>`;

        body.innerHTML = bodyHTML;
        button.textContent = `Buy ${nextUpgrade.name} ($${nextUpgrade.cost})`;
        button.disabled = this.money < nextUpgrade.cost;
        button.dataset.upgradeId = nextUpgrade.id;
    }

    buySelectedTowerUpgrade() {
        const tower = this.selectedPlacedTower;
        if (!tower || !tower.getAvailableUpgrades || !tower.applyUpgrade) return;

        const [nextUpgrade] = tower.getAvailableUpgrades();
        if (!nextUpgrade) return;
        if (this.money < nextUpgrade.cost) return;

        const applied = tower.applyUpgrade(nextUpgrade.id);
        if (!applied) return;

        this.money -= applied.cost;
        this.updateGameUI();
        console.log(`Upgraded ${tower.name} with ${applied.name}. Money left: ${this.money}`);
    }


    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.started && (e.code === 'Enter' || e.code === 'Space')) {
                this.startGame();
                return;
            }

            if (this.started && e.code === 'Escape' && !this.showLevelUp) {
                this.togglePause();
                return;
            }

            if (!this.started) {
                if (e.code === 'KeyC') {
                    this.player.cycleShellColor();
                    this.updatePlayerPreview();
                }
                if (e.code === 'KeyV') {
                    this.player.cycleInnerShape();
                    this.updatePlayerPreview();
                }
                if (e.code === 'KeyB') {
                    this.player.cycleBodyShape();
                    this.updatePlayerPreview();
                }
            }

            this.keys[e.code] = true;

            if (this.showLevelUp) {
                if (e.code === 'Digit1') this.selectUpgrade(0);
                if (e.code === 'Digit2') this.selectUpgrade(1);
                if (e.code === 'Digit3') this.selectUpgrade(2);
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.startMusicIfNeeded();
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.startMusicIfNeeded();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleCanvasClick(x, y, e);
        });

        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', async () => {
                console.log('Game over restart button clicked');

                // Hide game over menu
                document.getElementById('gameOver').classList.add('hidden');

                // Reset to start menu state and show payment
                this.quitToMenu();
                pay();
            });
        }

        // Start button
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                pay();
            });
        }

        // Admin test-start button (skips payment for local testing)
        const testStartBtn = document.getElementById('testStartBtn');
        if (testStartBtn) {
            testStartBtn.addEventListener('click', async () => {
                const r = await post('/adminStartGame', {});
                if (r.ok) {
                    this.startGame();
                } else {
                    console.error('Admin start failed:', r.error);
                    alert('Test start failed: ' + (r.error || 'unknown error'));
                }
            });
        }

        // Resume button
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // Pause restart button
        const pauseRestartBtn = document.getElementById('pauseRestartBtn');
        if (pauseRestartBtn) {
            pauseRestartBtn.addEventListener('click', async () => {
                console.log('Pause restart button clicked');

                // Set a flag so we know we came from pause menu
                this.restartFromPause = true;

                // Show payment prompt
                pay();
            });
        }

        // Quit button
        const quitBtn = document.getElementById('quitBtn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                this.quitToMenu();
            });
        }

        const mainMenuBtn = document.getElementById('mainMenuBtn'); // or quitBtn if you're using same ID
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                console.log('Game over main menu button clicked');

                // Hide game over menu explicitly
                document.getElementById('gameOver').classList.add('hidden');

                // Go to main menu
                this.quitToMenu();
            });
        }

        // Victory menu buttons (unique IDs)
        const victoryRestartBtn = document.getElementById('victoryRestartBtn');
        if (victoryRestartBtn) {
            victoryRestartBtn.addEventListener('click', async () => {
                console.log('Victory restart button clicked');
                document.getElementById('victoryMenu').classList.add('hidden');
                this.quitToMenu();
                pay();
            });
        }

        const victoryMainMenuBtn = document.getElementById('victoryMainMenuBtn');
        if (victoryMainMenuBtn) {
            victoryMainMenuBtn.addEventListener('click', () => {
                console.log('Victory main menu button clicked');
                document.getElementById('victoryMenu').classList.add('hidden');
                this.quitToMenu();
            });
        }



        // Player customization buttons
        const colorBtn = document.getElementById('colorBtn');
        if (colorBtn) {
            colorBtn.addEventListener('click', () => {
                this.player.cycleShellColor();
                this.updatePlayerPreview();
            });
        }

        const bodyShapeBtn = document.getElementById('bodyShapeBtn');
        if (bodyShapeBtn) {
            bodyShapeBtn.addEventListener('click', () => {
                this.player.cycleBodyShape();
                this.updatePlayerPreview();
            });
        }

        const shapeBtn = document.getElementById('shapeBtn');
        if (shapeBtn) {
            shapeBtn.addEventListener('click', () => {
                this.player.cycleInnerShape();
                this.updatePlayerPreview();
            });
        }

        const mapBtn = document.getElementById('mapBtn');
        if (mapBtn) {
            mapBtn.addEventListener('click', () => {
                this.mapManager.cycleMap();
                this.updateMultiTrackMode(); // Update spawning mode based on new map
            });
        }

        const towerUpgradeBtn = document.getElementById('towerUpgradeBtn');
        if (towerUpgradeBtn) {
            towerUpgradeBtn.addEventListener('click', () => {
                this.buySelectedTowerUpgrade();
            });
        }

        const storeToggleBtn = document.getElementById('storeToggleBtn');
        if (storeToggleBtn) {
            storeToggleBtn.addEventListener('click', () => {
                this.toggleStoreDock();
            });
        }


        // Player preview click
        const playerPreview = document.getElementById('playerPreview');
        if (playerPreview) {
            playerPreview.addEventListener('click', () => {
                this.player.cycleShellColor();
                this.updatePlayerPreview();
            });
        }

    }

    handleCanvasClick(x, y, e) {
        // Make it so towers can't be placed near the wave start button
        if (this.pointInRect(x, y, this.uiRects.waveStart)) {
            console.log("Wave start button clicked!");

            // Check if button should be clickable
            if (this.totalEnemiesInWave > 0 && (this.enemiesSpawned < this.totalEnemiesInWave || this.enemiesAlive > 0)) {
                console.log("Wave still in progress, button disabled");
                return;
            }

            console.log("Loading and starting wave manually via button click");

            // Load the new wave
            this.loadNewWave();

            // Enable spawning
            this.waveStartAllowed = true;

            return;
        }

        if (this.started && this.gameRunning && !this.selectedTower) {
            const clickedTower = this.findTowerAtPoint(x, y);
            this.setSelectedPlacedTower(clickedTower);
            if (clickedTower) return;
        }

        // Tower placement on the map 
        if (this.selectedTower && this.started && this.gameRunning) {
            const def = TOWER_TYPES[this.selectedTower];

            // Check whether the player can afford the tower
            if (this.money < def.cost) {
                console.log(`Not enough money to place ${def.name} (need ${def.cost}, have ${this.money})`);
                return;
            }

            const placementIssue = this.getTowerPlacementIssue(x, y, def);
            if (placementIssue) {
                console.log(`Cannot place tower: ${placementIssue}`);
                return;
            }

            // Place the tower and deduct cost
            const placedTower = new Tower(x, y, this.selectedTower);
            this.placedTowers.push(placedTower);
            this.setSelectedPlacedTower(placedTower);
            this.money -= def.cost;
            this.updateGameUI();
            console.log(`Placed ${def.name} at (${Math.round(x)}, ${Math.round(y)}). Money left: ${this.money}`);
            return;
        }

        // Handle other canvas clicks here if needed
        console.log(`Canvas clicked at: ${x}, ${y}`);
    }




    /**
     * Select or deselect a tower type for placement.
     * Called by the HTML shop panel buttons.
     */
    selectTower(key) {
        if (!isTowerShopAvailable(key)) return;
        this.selectedTower = (this.selectedTower === key) ? null : key;
        if (this.selectedTower) {
            this.setSelectedPlacedTower(null);
        }
        this.updateTowerShopUI();
    }

    formatTowerShopStats(def) {
        const parts = [];

        if (typeof def.damage === 'number') {
            parts.push(`DMG ${def.damage}`);
        }

        if (typeof def.range === 'number') {
            parts.push(`RNG ${def.range}`);
        }

        if (typeof def.fireRate === 'number') {
            const seconds = def.fireRate / 1000;
            parts.push(`Rate ${Number.isInteger(seconds) ? seconds.toFixed(0) : seconds.toFixed(2)}s`);
        }

        if (typeof def.projectileCount === 'number' && def.projectileCount > 1) {
            parts.push(`${def.projectileCount} shots`);
        }

        if (!parts.length) {
            parts.push('Support tower');
        }

        return parts.join(' | ');
    }

    buildTowerShopCards(container) {
        container.innerHTML = '';

        Object.entries(TOWER_TYPES).forEach(([key, def]) => {
            const towerCost = Number.isFinite(def.cost) ? def.cost : 0;
            const isAvailable = isTowerShopAvailable(key);
            const card = document.createElement('div');
            card.className = 'tower-card';
            card.classList.toggle('coming-soon', !isAvailable);
            card.id = `towerBtn-${key}`;
            card.title = isAvailable
                ? `Select ${def.name} to buy for placement`
                : 'Coming soon';
            card.addEventListener('click', () => this.selectTower(key));

            const iconDiv = document.createElement('div');
            iconDiv.className = 'tower-card-icon';
            if (def.image) {
                iconDiv.style.backgroundImage = `url('${def.image}')`;
                iconDiv.style.backgroundSize = 'cover';
                iconDiv.style.backgroundPosition = 'center';
            } else {
                iconDiv.style.background = def.color || '#777';
            }

            card.appendChild(iconDiv);

            const nameDiv = document.createElement('div');
            nameDiv.className = 'tower-card-name';
            nameDiv.textContent = def.name;
            card.appendChild(nameDiv);

            const statsDiv = document.createElement('div');
            statsDiv.className = 'tower-card-stats';
            statsDiv.textContent = this.formatTowerShopStats(def);
            card.appendChild(statsDiv);

            const actionDiv = document.createElement('div');
            actionDiv.className = 'tower-card-action';
            actionDiv.textContent = isAvailable ? 'Buy tower' : 'Coming soon';
            card.appendChild(actionDiv);

            const costDiv = document.createElement('div');
            costDiv.className = 'tower-card-cost';
            costDiv.textContent = `$${towerCost}`;
            card.appendChild(costDiv);

            container.appendChild(card);
        });
    }

    /**
     * Refresh affordability and selection state on all HTML tower shop cards.
     */
    updateTowerShopUI() {
        const shop = document.getElementById('towerShop');
        const hint = document.getElementById('towerShopHint');
        const cards = document.getElementById('towerShopCards');

        if (!shop || !cards) return;

        this.updateStoreDockUI();

        if (!this.started || !this.gameRunning) {
            return;
        }

        if (!cards.dataset.rendered) {
            this.buildTowerShopCards(cards);
            cards.dataset.rendered = 'true';
        }

        if (this.selectedTower && !isTowerShopAvailable(this.selectedTower)) {
            this.selectedTower = null;
        }

        const selectedDef = this.selectedTower ? TOWER_TYPES[this.selectedTower] : null;
        if (hint) {
            const selectedCost = selectedDef && Number.isFinite(selectedDef.cost) ? selectedDef.cost : 0;
            hint.textContent = selectedDef
                ? `Selected ${selectedDef.name}. Click the map to place it for $${selectedCost}.`
                : 'Select a tower to buy, then click the map to place it.';
        }

        Object.keys(TOWER_TYPES).forEach(key => {
            const btn = document.getElementById('towerBtn-' + key);
            if (!btn) return;
            const def = TOWER_TYPES[key];
            const towerCost = Number.isFinite(def.cost) ? def.cost : 0;
            const isAvailable = isTowerShopAvailable(key);
            const canAfford = isAvailable && this.money >= towerCost;
            btn.classList.toggle('selected', this.selectedTower === key);
            btn.classList.toggle('unaffordable', !canAfford);
            btn.classList.toggle('coming-soon', !isAvailable);
            btn.title = isAvailable
                ? `Select ${def.name} to buy for placement`
                : 'Coming soon';

            const action = btn.querySelector('.tower-card-action');
            if (action) {
                action.textContent = !isAvailable
                    ? 'Coming soon'
                    : this.selectedTower === key
                        ? 'Selected'
                        : 'Buy tower';
            }
        });
    }

    /**
     * (Legacy) Canvas-based tower shop — no longer called; HTML panel is used instead.
     * Kept here in case a canvas fallback is needed.
     */
    renderTowerShop() {
        const { ctx } = this;
        const types = Object.keys(TOWER_TYPES);
        const btnW = 80;
        const btnH = 70;
        const gap = 8;
        const totalW = types.length * (btnW + gap) - gap;
        const shopX = this.width - totalW - 16;
        const shopY = this.height - btnH - 16;

        this.towerShopRects = [];

        // Panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(shopX - 8, shopY - 8, totalW + 16, btnH + 16);

        types.forEach((key, i) => {
            const def = TOWER_TYPES[key];
            const btnX = shopX + i * (btnW + gap);
            const isSelected = this.selectedTower === key;
            const isAvailable = isTowerShopAvailable(key);
            const canAfford = isAvailable && this.money >= def.cost;

            // Button background
            ctx.fillStyle = isSelected
                ? 'rgba(255, 255, 255, 0.28)'
                : canAfford ? 'rgba(40, 40, 40, 0.8)' : 'rgba(60, 60, 60, 0.5)';
            ctx.fillRect(btnX, shopY, btnW, btnH);

            // Border (gold when selected, tower colour when affordable, grey otherwise)
            ctx.strokeStyle = isSelected ? '#FFD700' : canAfford ? def.color : '#555555';
            ctx.lineWidth = isSelected ? 2.5 : 1.5;
            ctx.strokeRect(btnX, shopY, btnW, btnH);

            // Tower icon 
            ctx.fillStyle = canAfford ? def.color : '#666666';
            const iconSize = 20;
            ctx.fillRect(btnX + (btnW - iconSize) / 2, shopY + 8, iconSize, iconSize);

            // Name label
            ctx.fillStyle = canAfford ? '#ffffff' : '#888888';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(def.name, btnX + btnW / 2, shopY + 44);

            // Cost label
            ctx.fillStyle = canAfford ? '#FFD700' : '#666666';
            ctx.font = '11px Arial';
            ctx.fillText(isAvailable ? ('$' + def.cost) : 'Soon', btnX + btnW / 2, shopY + 58);

            this.towerShopRects.push({ x: btnX, y: shopY, w: btnW, h: btnH, key });
        });

        // Restore alignment default
        ctx.textAlign = 'left';
    }

    /**
     * Render a semi-transparent preview of the tower under the cursor while
     * the player has a tower type selected.  Shows red when placement is
     * invalid (on track or can't afford), green-tinted when valid.
     */
    renderTowerPlacementPreview() {
        if (!this.selectedTower) return;
        const { ctx } = this;
        const def = TOWER_TYPES[this.selectedTower];
        if (!isTowerShopAvailable(this.selectedTower)) return;

        const placementIssue = this.getTowerPlacementIssue(this.mouseX, this.mouseY, def);
        const canAfford = this.money >= def.cost;
        const valid = !placementIssue && canAfford;

        const px = this.mouseX - def.width / 2;
        const py = this.mouseY - def.height / 2;

        // Range ring
        ctx.beginPath();
        ctx.arc(this.mouseX, this.mouseY, def.range, 0, Math.PI * 2);
        ctx.strokeStyle = valid ? 'rgba(255,255,255,0.20)' : 'rgba(255,0,0,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tower ghost
        ctx.fillStyle = valid ? def.color + 'aa' : 'rgba(220, 30, 30, 0.55)';
        ctx.fillRect(px, py, def.width, def.height);
        ctx.strokeStyle = valid ? '#ffffff' : '#ff4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, def.width, def.height);

        // Tooltip
        const label = !canAfford
            ? `Need $${def.cost} (have $${this.money})`
            : placementIssue ? `Cannot place: ${placementIssue}` : `Place ${def.name} ($${def.cost})`;
        ctx.fillStyle = valid ? 'rgba(0,0,0,0.7)' : 'rgba(180,0,0,0.7)';
        const tw = ctx.measureText(label).width + 12;
        ctx.fillRect(this.mouseX + 14, this.mouseY - 22, tw, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(label, this.mouseX + 20, this.mouseY - 7);
    }

    quitToMenu() {
        console.log('quitToMenu called');

        // Reset game state
        this.started = false;
        this.gameRunning = false;
        this.gamePaused = false;
        this.showLevelUp = false;
        this.placedTowers = [];
        this.selectedTower = null;
        this.selectedPlacedTower = null;
        this.storeOpen = false;

        // Hide the right-side store dock when returning to menu
        this.updateStoreDockUI();

        // Reset payment
        // hasPaid = false;

        // Hide all other menus and show start menu
        this.hideAllMenus();
        this.showStartMenu();

        console.log('Should be showing start menu now');
    }



    async startGame() {
        // Check payment status with server
        const accessCheck = await post('/checkGameAccess', {});

        if (accessCheck.needsPayment) {
            pay(); // Show payment dialog
            return;
        }

        // Start server game session
        const sessionResult = await post('/startGameSession', {});

        if (!sessionResult.ok) {
            console.error('Failed to start game session:', sessionResult.error);
            pay(); // Require payment
            return;
        }

        this.serverSessionId = sessionResult.sessionId;
        console.log('Server game session started');

        // Start client game
        this.started = true;
        this.gameRunning = true;
        this.storeOpen = false;
        this.hideAllMenus();
        this.restart(true);
    }

    async loadPlayerCustomization() {
        try {
            const result = await fetch('/loadCustomization');
            const data = await result.json();

            if (data.ok && data.customization) {
                console.log('Loading player customizatrion', data.customization);

                // Apply loaded customization
                this.player.colorIndex = data.customization.colorIndex;
                this.player.color = this.player.shellColorChoices[this.player.colorIndex];
                this.player.bodyShapeIndex = data.customization.bodyShapeIndex;
                this.player.innerShapeIndex = data.customization.innerShapeIndex;
                this.player.shapeIndex = this.player.innerShapeIndex; // legacy compatibility

                // Update preview to reflect loaded customization
                this.updatePlayerPreview();

                console.log('Player customization loaded successfully');
            }
        } catch (error) {
            console.error('Error loading player customization:', error);
        }
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        this.gamePausedReason = this.gamePaused ? 'pause' : '';

        if (this.gamePaused) {
            this.showPauseMenu();
        } else {
            this.hideAllMenus();
        }
    }
    pointInRect(x, y, rect) {
        if (!rect) return false;
        return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    }

    rectsOverlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    inflateRect(rect, amount) {
        if (!rect) return null;
        return {
            x: rect.x - amount,
            y: rect.y - amount,
            w: rect.w + amount * 2,
            h: rect.h + amount * 2
        };
    }

    getTowerPlacementRect(x, y, def) {
        return {
            x: x - def.width / 2,
            y: y - def.height / 2,
            w: def.width,
            h: def.height
        };
    }

    getProtectedPlacementRects() {
        const protectedRects = [];
        if (this.uiRects.waveStart) protectedRects.push(this.uiRects.waveStart);
        return protectedRects;
    }

    getTowerPlacementIssue(x, y, def) {
        const placementRect = this.getTowerPlacementRect(x, y, def);

        // Keep the full tower on the canvas.
        if (
            placementRect.x < 0 ||
            placementRect.y < 0 ||
            placementRect.x + placementRect.w > this.width ||
            placementRect.y + placementRect.h > this.height
        ) {
            return 'outside map bounds';
        }

        const tolerance = 5 + Math.max(def.width, def.height) / 2 + 5;
        if (this.mapManager.isPointOnTrack(x, y, tolerance)) {
            return 'on the track';
        }

        const towerSpacing = 2;
        const testRect = this.inflateRect(placementRect, towerSpacing / 2);
        for (const tower of this.placedTowers) {
            if (!tower) continue;
            const towerRect = {
                x: tower.x,
                y: tower.y,
                w: tower.width,
                h: tower.height
            };
            if (this.rectsOverlap(testRect, towerRect)) {
                return 'overlapping another tower';
            }
        }

        const buttonSafetyPadding = 14;
        for (const uiRect of this.getProtectedPlacementRects()) {
            if (this.rectsOverlap(placementRect, this.inflateRect(uiRect, buttonSafetyPadding))) {
                return 'too close to the start button';
            }
        }

        return null;
    }

    update(deltaTime) {
        if (!this.started) return;
        if (!this.gameRunning || this.gamePaused) return;

        this.player.update(this.keys, deltaTime);

        // Spawn enemies
        this.spawnEnemies(deltaTime);

        // Update all entities
        this.updateEntities(deltaTime);

        // Check collisions
        this.checkCollisions();

        // // Player shooting
        // if (this.keys['Space']) {
        //     this.player.shoot(this.bullets, this.mouseX, this.mouseY);
        // }

        this.checkWaveProgress();
        this.checkLevelUp();

        // Update placed towers (acquire targets & fire)
        const allEnemies = [
            ...this.enemies,
            ...this.shooters,
            ...this.tanks,
            ...this.sprinters,
            ...this.bosses
        ];

        this.updateSupportTowers(deltaTime, allEnemies);

        this.placedTowers.forEach(tower => {
            tower.update(deltaTime, allEnemies);
            tower.shoot(this.bullets);
        });
    }

    findNearestEnemy(x, y, enemies, range = Infinity) {
        let nearest = null;
        let nearestDist = range;

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (!enemy || enemy.hp <= 0) continue;
            if (enemy.hidden) continue;

            const ex = enemy.x + (enemy.width || 0) / 2;
            const ey = enemy.y + (enemy.height || 0) / 2;
            const dx = ex - x;
            const dy = ey - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        return nearest;
    }

    spawnSummonProjectile(tower, target, bossSummon = false) {
        if (!target) return;

        const cx = tower.x + tower.width / 2;
        const cy = tower.y + tower.height / 2;
        const tx = target.x + (target.width || 0) / 2;
        const ty = target.y + (target.height || 0) / 2;
        const dx = tx - cx;
        const dy = ty - cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const moveScale = Math.max(0.5, tower.summonMoveSpeedMultiplier || 1);
        const speed = (tower.projectileSpeed || 1) * moveScale;

        const bullet = new Bullet(cx, cy, true);
        bullet.width = bossSummon ? 10 : 7;
        bullet.height = bossSummon ? 10 : 7;
        bullet.vx = (dx / len) * speed;
        bullet.vy = (dy / len) * speed;
        bullet.damage = Math.max(
            1,
            Math.round((tower.damage || 1) * (tower.summonDamageMultiplier || 1) * (bossSummon ? 2 : 1))
        );
        bullet.pierce = 1;
        bullet.isPlayer = true;
        bullet.fromTower = true;
        bullet.sourceTower = tower;
        bullet.towerColor = bossSummon ? '#ffcc66' : tower.color;
        bullet.damageReinforced = true;
        bullet.lifeRemaining = 2200;
        this.bullets.push(bullet);
    }

    updateSupportTowers(deltaTime, allEnemies) {
        for (let i = 0; i < this.placedTowers.length; i++) {
            const tower = this.placedTowers[i];
            if (!tower) continue;

            if (tower.type === 'hacker') {
                tower.hackCooldown -= deltaTime;
                if (tower.hackCooldown <= 0) {
                    const reward = Math.max(
                        1,
                        Math.round((4 + this.waveNumber * 0.4) * (tower.hackRewardMultiplier || 1))
                    );
                    this.money += reward;

                    if (
                        tower.statusCleanseChance > 0 &&
                        allEnemies.length > 0 &&
                        Math.random() < tower.statusCleanseChance
                    ) {
                        const index = Math.floor(Math.random() * allEnemies.length);
                        const target = allEnemies[index];
                        if (target) {
                            target.hidden = false;
                            if ('isDashing' in target) target.isDashing = false;
                            if ('stunTimer' in target) target.stunTimer = 0;
                        }
                    }

                    tower.hackCooldown = Math.max(200, tower.hackInterval || 2500);
                }
            }

            if (tower.type === 'generator') {
                tower.regenCooldown -= deltaTime;
                if (tower.regenCooldown <= 0) {
                    this.maxSheild = Math.max(this.maxSheild, 250 + (tower.regenMax || 0));
                    this.healBase(tower.regenAmount || 0);
                    tower.regenCooldown = Math.max(250, tower.regenSpeed || 5000);
                }
            }

            if (tower.type === 'overlord') {
                tower.summonCooldown -= deltaTime;
                if (tower.summonCooldown <= 0) {
                    const summonCount = Math.max(1, tower.summonCount || 1);
                    for (let s = 0; s < summonCount; s++) {
                        const target = this.findNearestEnemy(
                            tower.x + tower.width / 2,
                            tower.y + tower.height / 2,
                            allEnemies,
                            tower.range ? Math.max(tower.range * 6, 160) : 220
                        );
                        if (!target) break;
                        const bossSummon = Math.random() < (tower.summonBossChance || 0);
                        this.spawnSummonProjectile(tower, target, bossSummon);
                    }

                    tower.summonCooldown = Math.max(250, tower.summonSpeed || 2500);
                }
            }
        }
    }

    setMultiTrackMode(mode) {
        this.multiTrackMode = mode; // 'perEnemy', 'perWave', or 'single'
        console.log('Multi-track mode set to:', mode);
    }

    updateMultiTrackMode() {
        const newMode = this.mapManager.getTrackMode();
        if (newMode !== this.multiTrackMode) {
            this.multiTrackMode = newMode;
            console.log(`Map changed: Multi-track mode set to ${newMode}`);

            // Reset track indices when mode changes
            this.currentTrackIndex = 0;
            this.waveTrackIndex = 0;
        }
    }


    spawnEnemies(deltaTime) {
        // Load new wave if current is complete
        if (!this.waveStartAllowed) {
            return; // Don't spawn if wave start is not allowed
        }

        if (this.autoStart) {
            if (this.waveComplete || this.currentWave.length === 0) {
                this.loadNewWave();
            }
        }

        // Spawn enemies with timing
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnDelay && this.enemiesSpawned < this.currentWave.length) {
            this.spawnNextEnemy();
            this.spawnTimer = 0;
        }

    }

    loadNewWave() {
        console.log(`Loading wave ${this.waveNumber}`);

        this.currentWave = this.waveManager.getWave(this.waveNumber);
        this.currentWaveIndex = 0;
        this.enemiesSpawned = 0;
        this.totalEnemiesInWave = this.currentWave.length;
        this.waveComplete = false;

        // Reset wave track index for per-wave mode
        if (this.multiTrackMode === 'perWave') {
            const availablePaths = this.mapManager.getAvailablePaths();
            this.waveTrackIndex = (this.waveTrackIndex + 1) % availablePaths.length;
        }
    }

    spawnNextEnemy() {
        if (this.enemiesSpawned >= this.currentWave.length) return;

        const EnemyClass = this.currentWave[this.enemiesSpawned];
        const availablePaths = this.mapManager.getAvailablePaths();

        // Determine which path to use
        let pathName;
        if (this.multiTrackMode === 'cricut') {
            // Custom Cricut logic: alternate between 4Corners and Mirrored per wave
            pathName = this.getCricutPathForEnemy();
        } else if (this.multiTrackMode === 'perEnemy') {
            // Rotate path for each enemy
            pathName = availablePaths[this.currentTrackIndex % availablePaths.length];
            this.currentTrackIndex++;
        } else if (this.multiTrackMode === 'perWave') {
            // Same path for entire wave
            pathName = availablePaths[this.waveTrackIndex % availablePaths.length];
        } else {
            // Single path mode - use first available
            pathName = availablePaths[0];
        }


        // Get spawn position and path
        const spawnPos = this.mapManager.getSpawnPosition(pathName);
        const pathWaypoints = this.mapManager.getPathWaypoints(pathName);

        // Create enemy with path
        const enemy = new EnemyClass(spawnPos.x, spawnPos.y, this);

        // Center enemy on path
        enemy.x = spawnPos.x - enemy.width / 2;
        enemy.y = spawnPos.y - enemy.height / 2;

        enemy.setPath(pathWaypoints);

        // Add to appropriate array
        if (EnemyClass === Enemy) {
            this.enemies.push(enemy);
        } else if (EnemyClass === Shooter) {
            this.shooters.push(enemy);
        } else if (EnemyClass === Tank) {
            this.tanks.push(enemy);
        } else if (EnemyClass === Sprinter) {
            this.sprinters.push(enemy);
        } else if (EnemyClass === Boss) {
            this.sprinters.push(enemy);
        }

        this.enemiesSpawned++;
        this.enemiesAlive++;

        console.log(`Spawned ${EnemyClass.name} on ${pathName} path (${this.enemiesSpawned}/${this.totalEnemiesInWave})`);
    }

    getCricutPathForEnemy() {
        const isOddWave = this.waveNumber % 2 === 1;

        if (isOddWave) {
            // Odd waves: Always use 4Corners
            return 'corners';
        } else {
            // Even waves: Alternate between mirrored paths per enemy
            const isEvenEnemy = this.enemiesSpawned % 2 === 0;
            return isEvenEnemy ? 'mirroredTop' : 'mirroredBottom';
        }
    }

    clearAllEnemies() {
        // Create explosions for dramatic effect
        [...this.enemies, ...this.shooters, ...this.tanks, ...this.sprinters].forEach(enemy => {
            this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        });

        // Actually clear all enemies and bullets
        this.enemies = [];
        this.shooters = [];
        this.tanks = [];
        this.sprinters = [];
        this.bullets = [];
    }

    async checkWaveProgress() {
        // Don't check progress if no wave has been loaded yet
        if (this.totalEnemiesInWave === 0) {
            return; // Exit early - no wave to check progress on
        }

        // Count total living enemies
        this.enemiesAlive = this.enemies.length + this.shooters.length + this.tanks.length + this.sprinters.length + this.bosses.length;

        // Check if wave is complete (all enemies spawned and defeated)
        if (this.enemiesSpawned >= this.totalEnemiesInWave && this.enemiesAlive === 0) {
            console.log(`Wave ${this.waveNumber} complete!`);

            const waveCompleteTime = Date.now() - this.waveStartTime;

            // Report to server for validation
            const result = await post('/recordGameEvent', {
                eventType: 'WAVE_COMPLETE',
                data: {
                    waveNumber: this.waveNumber,
                    timeTaken: waveCompleteTime,
                }
            });

            if (!result.ok) {
                console.error('Server rejected wave completion:', result.error);
                alert('Game session ended due to validation error');
                this.gameOver();
                return;
            }

            const nextWave = result.nextWave;

            if (this.waveNumber >= this.totalWaves) {
                this.victory();
                return;
            }

            // Normal wave transition
            this.waveNumber = nextWave;
            this.waveStartAllowed = true; // Disable until next wave is loaded
            this.waveComplete = true;
            this.waveStartTime = Date.now();

            this.currentWave = [];
            this.totalEnemiesInWave = 0;
            this.enemiesSpawned = 0;
        }
    }


    checkLevelUp() {
        if (this.exp >= this.expToNextLevel && !this.showLevelUp) {
            this.showLevelUp = true;
            this.gamePaused = true;
            this.gamePausedReason = 'levelup';
            this.generateUpgradeOptions();
            this.showLevelUpMenu(); // Show HTML level up menu
        }
    }

    generateUpgradeOptions() {
        const allUpgrades = [
            { name: "Bonus Shield", description: "+5 Max Shield", effect: () => { this.player.maxHealth += 5; this.player.health += 5; } },
            { name: "Damage Boost", description: "+1 Bullet Damage", effect: () => { this.player.damage += 1; } },
            { name: "Fire Rate", description: "Faster Shooting", effect: () => { this.player.shootCooldownMax = Math.max(50, this.player.shootCooldownMax - 30); } },
            { name: "Pierce Shot", description: "Bullets Go Through Enemies", effect: () => { this.player.pierce += 1; } },
            { name: "Ricochet", description: "Bullets Bounce (2 bounces)", effect: () => { this.player.ricochet = true; this.player.ricochetBounces = (this.player.ricochetBounces || 0) + 2; } },
            { name: "Multi Shot", description: "+1 Bullet Per Shot", effect: () => { this.player.multiShot += 1; } },
            { name: "Speed Boost", description: "Move Faster", effect: () => { this.player.speed += 0.1; } },
            { name: "Syphone", description: "Recover Shield on Enemy Kill", effect: () => { this.player.lifeSteal = true; } },
            { name: "Shield Recharge", description: "Recover Lost Shield", effect: () => { this.player.health += 5; } },
            { name: "Lock In", description: "Your Bullets Lock in and Hunt Down Enemies", effect: () => { this.player.lockIn = true; this.player.lockInDistance = (this.player.lockInDistance || 0) + 50; } }
        ];

        // Randomly select 3 upgrades
        this.upgradeOptions = [];
        const availableUpgrades = [...allUpgrades];
        const filteredUpgrades = availableUpgrades.filter(upgrade => {
            if (this.player.lifeSteal == true) {
                if (upgrade.name === "Syphone") {
                    console.log("Syphon upgrade removed from avalible upgrades");
                    return false
                }
            }

            if (this.player.lockInDistance == 150) {
                if (upgrade.name === "Lock In") {
                    console.log("Lock In upgrade removed from avalible upgrades");
                    return false
                }
            }

            if (this.player.ricochetBounces == 6) {
                if (upgrade.name === "Ricochet") {
                    console.log("Ricochet upgrade removed from avalible upgrades");
                    return false
                }
            }

            if (this.player.pierce == 4) {
                if (upgrade.name === "Pierce Shot") {
                    console.log("Pierce Shot upgrade removed from avalible upgrades");
                    return false
                }
            }

            return true
        });

        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * filteredUpgrades.length);
            this.upgradeOptions.push(filteredUpgrades.splice(randomIndex, 1)[0]);
        }
    }

    selectUpgrade(index) {
        if (index >= 0 && index < this.upgradeOptions.length) {
            this.upgradeOptions[index].effect();
            this.level++;
            this.exp -= this.expToNextLevel;
            this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
            this.showLevelUp = false;
            this.gamePaused = false;
            this.gamePausedReason = '';
            this.upgradeOptions = [];
            this.hideAllMenus(); // Hide menus when resuming
        }
    }

    addExp(amount) {
        this.exp += amount;
    }

    checkLineCollision(player, lineShot) {
        // Simple line-rectangle intersection
        const corners = [
            { x: player.x, y: player.y },
            { x: player.x + player.width, y: player.y },
            { x: player.x, y: player.y + player.height },
            { x: player.x + player.width, y: player.y + player.height }
        ];

        for (let corner of corners) {
            const distance = this.pointToLineDistance(corner.x, corner.y, lineShot);
            if (distance < lineShot.width / 2) {
                return true;
            }
        }
        return false;
    }

    pointToLineDistance(px, py, lineShot) {
        const dx = lineShot.endX - lineShot.startX;
        const dy = lineShot.endY - lineShot.startY;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return Math.sqrt((px - lineShot.startX) ** 2 + (py - lineShot.startY) ** 2);

        const t = Math.max(0, Math.min(1, ((px - lineShot.startX) * dx + (py - lineShot.startY) * dy) / (length * length)));
        const projX = lineShot.startX + t * dx;
        const projY = lineShot.startY + t * dy;

        return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
    }

    updateEntities(deltaTime) {
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime);

            if (typeof bullet.lifeRemaining === 'number') {
                bullet.lifeRemaining -= deltaTime;
                if (bullet.lifeRemaining <= 0) return false;
            }

            // Ricochet bullets off walls
            if (bullet.ricochet && bullet.isPlayer) {
                if (bullet.x <= 0 || bullet.x + bullet.width >= this.width) {
                    bullet.vx *= -1;
                    bullet.vx *= 0.85;
                    bullet.vy *= 0.95;
                    bullet.x = Math.max(0, Math.min(this.width - bullet.width, bullet.x));
                    bullet.ricochetBounces = (bullet.ricochetBounces || 0) - 1;
                }
                if (bullet.y <= 0 || bullet.y + bullet.height >= this.height) {
                    bullet.vy *= -1;
                    bullet.vx *= 0.95;
                    bullet.vy *= 0.85;
                    bullet.y = Math.max(0, Math.min(this.height - bullet.height, bullet.y));
                    bullet.ricochetBounces = (bullet.ricochetBounces || 0) - 1;
                }

                if ((bullet.ricochetBounces || 0) <= 0) {
                    bullet.ricochet = false;
                }
            }

            if (bullet.lockIn && bullet.isPlayer) {
                // If bullet doesn't have a target yet, look for one
                if (!bullet.target) {
                    // Your loop through enemies to find one within 50 pixels
                    for (let enemy of this.enemies) {
                        const dx = enemy.x - bullet.x;
                        const dy = enemy.y - bullet.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= this.player.lockInDistance) {
                            bullet.target = enemy; // Remember this enemy
                            break; // Stop looking for more targets
                        }
                    }
                }

                if (!bullet.target) {
                    // Your loop through shooters to find one within 50 pixels
                    for (let shooter of this.shooters) {
                        const dx = shooter.x - bullet.x;
                        const dy = shooter.y - bullet.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= this.player.lockInDistance) {
                            bullet.target = shooter; // Remember this shooter
                            break; // Stop looking for more targets
                        }
                    }
                }

                if (!bullet.target) {
                    // Your loop through tanks to find one within 50 pixels
                    for (let tank of this.tanks) {
                        const dx = tank.x - bullet.x;
                        const dy = tank.y - bullet.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= this.player.lockInDistance) {
                            bullet.target = tank; // Remember this tank
                            break; // Stop looking for more targets
                        }
                    }
                }

                if (!bullet.target) {
                    // Your loop through sprinters to find one within 50 pixels
                    for (let sprinter of this.sprinters) {
                        const dx = sprinter.x - bullet.x;
                        const dy = sprinter.y - bullet.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= this.player.lockInDistance) {
                            bullet.target = sprinter; // Remember this sprinter
                            break; // Stop looking for more targets
                        }
                    }
                }

                if (!bullet.target) {
                    // Your loop through bosses to find one within 50 pixels
                    for (let boss of this.bosses) {
                        const dx = boss.x - bullet.x;
                        const dy = boss.y - bullet.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= this.player.lockInDistance) {
                            bullet.target = boss; // Remember this boss
                            break; // Stop looking for more targets
                        }
                    }
                }

                // If bullet has a target, adjust trajectory toward it
                if (bullet.target) {
                    // Check if target still exists in the game
                    const targetStillExists = this.enemies.includes(bullet.target) ||
                        this.shooters.includes(bullet.target) ||
                        this.tanks.includes(bullet.target) ||
                        this.sprinters.includes(bullet.target) ||
                        this.bosses.includes(bullet.target);

                    if (!targetStillExists) {
                        bullet.target = null; // Clear the dead target
                        // Bullet will continue with its last velocity
                    } else {
                        // Normal homing logic
                        const dx = bullet.target.x - bullet.x;
                        const dy = bullet.target.y - bullet.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        const homingSpeed = 0.3;
                        bullet.vx = (dx / distance) * homingSpeed;
                        bullet.vy = (dy / distance) * homingSpeed;
                    }

                }
            }

            return bullet.y > -50 && bullet.y < this.height + 50 &&
                bullet.x > -50 && bullet.x < this.width + 50;
        });

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            if ((enemy.stunTimer || 0) > 0) {
                enemy.stunTimer -= deltaTime;
            } else {
                enemy.update(deltaTime);
            }
            return enemy.hp > 0;
        });

        // Update shooters
        this.shooters = this.shooters.filter(shooter => {
            if ((shooter.stunTimer || 0) > 0) {
                shooter.stunTimer -= deltaTime;
            } else {
                shooter.update(deltaTime);
            }
            return shooter.hp > 0;
        });

        // Update tanks
        this.tanks = this.tanks.filter(tank => {
            if ((tank.stunTimer || 0) > 0) {
                tank.stunTimer -= deltaTime;
            } else {
                tank.update(deltaTime);
            }
            return tank.hp > 0;
        });

        // Update sprinters
        this.sprinters = this.sprinters.filter(sprinter => {
            if ((sprinter.stunTimer || 0) > 0) {
                sprinter.stunTimer -= deltaTime;
            } else {
                sprinter.update(deltaTime);
            }
            return sprinter.hp > 0;
        });

        // Update enemies
        this.bosses = this.enemies.filter(boss => {
            if ((boss.stunTimer || 0) > 0) {
                boss.stunTimer -= deltaTime;
            } else {
                boss.update(deltaTime);
            }
            return boss.hp > 0;
        });


        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });

        this.lineshots = this.lineshots.filter(lineShot => {
            console.log('Filtering LineShot - isPreview:', lineShot.isPreview, 'isActive:', lineShot.isActive, 'frameCount:', lineShot.frameCount);

            lineShot.update(deltaTime);

            if (lineShot.isPreview) {
                return lineShot.isActive !== false;

            }
            return lineShot.frameCount < lineShot.maxFrames;

        });
    }

    checkCollisions() {
        const getTowerAdjustedDamage = (bullet, target) => {
            let damage = bullet.damage || 1;
            if (target.reinforced && !bullet.damageReinforced) {
                damage = Math.max(1, Math.ceil(damage * 0.5));
            }
            return damage;
        };

        const applyTowerHitEffects = (bullet, target) => {
            if (!bullet.fromTower) return;

            if (bullet.stunChance && Math.random() < bullet.stunChance) {
                target.stunTimer = Math.max(target.stunTimer || 0, 800);
            }

            if (bullet.clusterOnExplosion && (bullet.clusterCount || 0) > 0) {
                const originX = target.x + (target.width || 0) / 2;
                const originY = target.y + (target.height || 0) / 2;
                const clusterDamage = Math.max(1, Math.round((bullet.damage || 1) * 0.35));
                for (let c = 0; c < bullet.clusterCount; c++) {
                    const angle = (Math.PI * 2 * c) / bullet.clusterCount;
                    const shard = new Bullet(originX, originY, true);
                    shard.width = 4;
                    shard.height = 4;
                    shard.vx = Math.cos(angle) * 0.55;
                    shard.vy = Math.sin(angle) * 0.55;
                    shard.damage = clusterDamage;
                    shard.pierce = 1;
                    shard.fromTower = true;
                    shard.sourceTower = bullet.sourceTower;
                    shard.towerColor = bullet.towerColor;
                    shard.lifeRemaining = 650;
                    this.bullets.push(shard);
                }
            }
        };

        // Player bullets vs all enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet || !bullet.isPlayer) continue;

            let hit = false;
            let hitCount = 0;

            // Check vs enemies
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.checkCollision(bullet, this.enemies[j])) {
                    const enemy = this.enemies[j];
                    const damage = getTowerAdjustedDamage(bullet, enemy);

                    // Damage the enemy first
                    enemy.takeDamage ? enemy.takeDamage(damage) : (enemy.hp -= damage);
                    applyTowerHitEffects(bullet, enemy);
                    this.createExplosion(bullet.x, bullet.y);
                    this.playSound('enemyHit');

                    if (enemy.hp <= 0) {
                        this.createExplosion(enemy.x, enemy.y);
                        this.money += enemy.worth;
                        this.enemies.splice(j, 1);

                        this.addExp(5);
                        if (this.player.lifeSteal && this.player.health < this.player.maxHealth) {
                            this.player.health++;
                        }
                    }
                    hit = true;
                    hitCount++;
                    if (hitCount >= bullet.pierce) break;
                }
            }

            // Check vs shooters
            for (let j = this.shooters.length - 1; j >= 0 && hitCount < bullet.pierce; j--) {
                if (this.checkCollision(bullet, this.shooters[j])) {
                    const shooter = this.shooters[j];
                    const damage = getTowerAdjustedDamage(bullet, shooter);

                    // Damage the enemy first
                    shooter.takeDamage ? shooter.takeDamage(damage) : (shooter.hp -= damage);
                    applyTowerHitEffects(bullet, shooter);
                    this.createExplosion(bullet.x, bullet.y);
                    this.playSound('enemyHit');

                    if (shooter.hp <= 0) {
                        this.createExplosion(shooter.x, shooter.y);
                        this.shooters.splice(j, 1);
                        this.addExp(12);
                        if (this.player.lifeSteal && this.player.health < this.player.maxHealth) {
                            this.player.health++;
                        }
                    }
                    hit = true;
                    hitCount++;
                }
            }

            // Check vs tanks
            for (let j = this.tanks.length - 1; j >= 0 && hitCount < bullet.pierce; j--) {
                if (this.checkCollision(bullet, this.tanks[j])) {
                    const damage = getTowerAdjustedDamage(bullet, this.tanks[j]);
                    this.tanks[j].takeDamage(damage);
                    applyTowerHitEffects(bullet, this.tanks[j]);
                    this.createExplosion(bullet.x, bullet.y);
                    this.playSound('enemyHit');

                    if (this.tanks[j].hp <= 0) {
                        const tanks = this.tanks[j];
                        this.createExplosion(this.tanks[j].x, this.tanks[j].y);
                        this.money += tanks.worth;
                        this.tanks.splice(j, 1);
                        this.addExp(25);
                        if (this.player.lifeSteal && this.player.health < this.player.maxHealth) {
                            this.player.health++;
                        }
                    }
                    hit = true;
                    hitCount++;
                }
            }

            // Check vs sprinters
            for (let j = this.sprinters.length - 1; j >= 0 && hitCount < bullet.pierce; j--) {
                if (this.checkCollision(bullet, this.sprinters[j])) {
                    const damage = getTowerAdjustedDamage(bullet, this.sprinters[j]);
                    this.sprinters[j].takeDamage(damage);
                    applyTowerHitEffects(bullet, this.sprinters[j]);
                    this.createExplosion(bullet.x, bullet.y);
                    this.playSound('enemyHit');

                    if (this.sprinters[j].hp <= 0) {
                        const sprinters = this.sprinters[j];
                        this.createExplosion(this.sprinters[j].x, this.sprinters[j].y);
                        this.money += sprinters.worth;
                        this.sprinters.splice(j, 1);
                        this.addExp(35);
                        if (this.player.lifeSteal && this.player.health < this.player.maxHealth) {
                            this.player.health++;
                        }
                    }
                    hit = true;
                    hitCount++;
                }
            }

            // Check vs Boss
            for (let j = this.bosses.length - 1; j >= 0; j--) {
                if (this.checkCollision(bullet, this.bosses[j])) {
                    const boss = this.bosses[j];
                    const damage = getTowerAdjustedDamage(bullet, boss);

                    // Damage the boss first
                    boss.takeDamage ? boss.takeDamage(damage) : (boss.hp -= damage);
                    applyTowerHitEffects(bullet, boss);
                    this.createExplosion(bullet.x, bullet.y);
                    this.playSound('enemyHit');

                    if (boss.hp <= 0) {
                        this.createExplosion(boss.x, boss.y);
                        this.money += boss.worth;
                        this.enemies.splice(j, 1);

                        this.addExp(5);
                        if (this.player.lifeSteal && this.player.health < this.player.maxHealth) {
                            this.player.health++;
                        }
                    }
                    hit = true;
                    hitCount++;
                    if (hitCount >= bullet.pierce) break;
                }
            }


            if (hit && hitCount >= bullet.pierce) {
                this.bullets.splice(i, 1);
            }
        };
    }

    removeEnemyFromArrays(enemy) {
        let index = this.enemies.indexOf(enemy);
        if (index > -1) this.enemies.splice(index, 1);

        index = this.shooters.indexOf(enemy);
        if (index > -1) this.shooters.splice(index, 1);

        index = this.tanks.indexOf(enemy);
        if (index > -1) this.tanks.splice(index, 1);

        index = this.sprinters.indexOf(enemy);
        if (index > -1) this.sprinters.splice(index, 1);

        index = this.bosses.indexOf(enemy);
        if (index > -1) this.bosses.splice(index, 1);
    }

    clearMinions() {
        // Remove all minions
        this.enemies = this.enemies.filter(enemy => { !enemy.minion });
        this.createExplosion(this.enemies.x, this.enemies.y);
        this.shooters = this.shooters.filter(shooter => !shooter.minion);
        this.createExplosion(this.shooters.x, this.shooters.y);
        this.tanks = this.tanks.filter(tank => !tank.minion);
        this.createExplosion(this.tanks.x, this.tanks.y);
        this.sprinters = this.sprinters.filter(sprinter => !sprinter.minion);
        this.createExplosion(this.sprinters.x, this.sprinters.y);

        console.log('All minions cleared after boss defeat');

    }


    takeDamage(amount) {
        this.sheild = Math.max(0, this.sheild - amount);
        this.playSound('playerHit')
        console.log(`Base took ${amount} damage! Health: ${this.sheild}/${this.maxSheild}`);

        if (this.sheild <= 0) {
            this.gameOver();
        }
    }

    // Method to heal base (for upgrades)
    healBase(amount) {
        this.sheild = Math.min(this.maxSheild, this.sheild + amount);
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y));
        }
    }

    async gameOver() {
        this.gameRunning = false;
        this.playSound('playerDefeat')
        document.getElementById('gameOver').classList.remove('hidden');
    }

    async victory() {
        this.gameRunning = false;
        this.playSound('bossDefeat')
        document.getElementById('victoryMenu').classList.remove('hidden');
    }


    restart(startImmediately = false) {
        // Store current customization before creating new player
        const savedColor = this.player.color;
        const savedColorIndex = this.player.colorIndex;
        const savedBodyShapeIndex = this.player.bodyShapeIndex;
        const savedInnerShapeIndex = this.player.innerShapeIndex;
        const savedShapeIndex = this.player.shapeIndex;

        // hasPaid = false;
        this.bullets = [];
        this.lineshots = [];
        this.enemies = [];
        this.shooters = [];
        this.tanks = [];
        this.sprinters = [];
        this.bosses = [];
        this.particles = [];
        this.placedTowers = [];
        this.selectedTower = null;
        this.selectedPlacedTower = null;
        this.storeOpen = false;
        this.exp = 0;
        this.level = 1;
        this.money = 500;
        this.expToNextLevel = 100;
        this.waveNumber = 1;
        this.waveRequirement = 300;
        this.showLevelUp = false;
        this.gamePaused = false;
        this.gamePausedReason = '';
        this.gameRunning = startImmediately;
        this.started = startImmediately || this.started;

        // Reset wave system
        this.currentWave = [];
        this.currentWaveIndex = 0;
        this.waveComplete = false;
        this.waveStartAllowed = false;
        // Re-read persisted settings
        const _s = (() => { try { return JSON.parse(localStorage.getItem('blitzDefenceSettings') || '{}'); } catch (e) { return {}; } })();
        this.autoStart = _s.waveAuto === true;
        this.showTooltips = _s.tooltips !== false;
        this.soundEnabled = _s.sound !== false;
        this.applySoundSetting();
        this.spawnTimer = 0;
        this.totalEnemiesInWave = 0;
        this.enemiesSpawned = 0;
        this.enemiesAlive = 0;
        this.updateMultiTrackMode()

        // Create new player and restore customization
        this.player = new Player(this.width / 2, this.height - 50);
        this.player.color = savedColor;
        this.player.colorIndex = savedColorIndex;
        this.player.shapeIndex = savedShapeIndex;
        this.player.bodyShapeIndex = savedBodyShapeIndex;
        this.player.innerShapeIndex = savedInnerShapeIndex;
        this.player.game = this;

        // Update the preview to show restored customization
        this.updatePlayerPreview();

        document.getElementById('gameOver').classList.add('hidden');

        this.updateStoreDockUI();
        if (startImmediately) {
            this.updateTowerShopUI();
            this.updateTowerUpgradeUI();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Use MapManager for rendering paths and base
        this.mapManager.renderPaths(this.ctx);
        this.mapManager.renderBase(this.ctx);
        this.mapManager.renderMapName(this.ctx);

        // Render placed towers (before enemies so they appear beneath)
        this.placedTowers.forEach(tower => tower.render(this.ctx));

        // Tower placement preview (ghost under cursor when a tower is selected)
        if (this.started && this.gameRunning && this.selectedTower) {
            this.renderTowerPlacementPreview();
        }

        // Draw game objects
        this.player.render(this.ctx);

        // Render enemies first
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.shooters.forEach(shooter => shooter.render(this.ctx));
        this.tanks.forEach(tank => tank.render(this.ctx));
        this.sprinters.forEach(sprinter => sprinter.render(this.ctx));

        // Render bosses (without walls)
        this.bosses.forEach(boss => boss.render(this.ctx));

        // Render boss walls (before bullets so bullets appear on top)
        this.bosses.forEach(boss => {
            if (boss.renderWalls) {  // Check if this boss type has walls
                boss.renderWalls(this.ctx);
            }
        });

        // Render bullets (after walls)
        this.bullets.forEach(bullet => bullet.render(this.ctx));

        this.lineshots.forEach((lineshot, index) => {
            lineshot.render(this.ctx);
        });

        // Render particles last
        this.particles.forEach(particle => particle.render(this.ctx));

        // MOVE WAVE START BUTTON TO HERE (RENDER LAST SO IT'S ON TOP)
        if (this.started && this.gameRunning && this.enemiesAlive === 0 && (this.enemiesSpawned >= this.totalEnemiesInWave || this.totalEnemiesInWave === 0)) {

            this.ctx.fillStyle = 'rgba(0, 255, 0, 1)';
            this.ctx.fillRect(this.uiRects.waveStart.x, this.uiRects.waveStart.y, this.uiRects.waveStart.w, this.uiRects.waveStart.h);

            // Draw white triangle pointing right
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();

            // Calculate triangle points (centered in button, pointing right)
            const buttonCenterX = this.uiRects.waveStart.x + this.uiRects.waveStart.w / 2;
            const buttonCenterY = this.uiRects.waveStart.y + this.uiRects.waveStart.h / 2;
            const triangleSize = 25; // Adjust size as needed

            // Triangle pointing right
            this.ctx.moveTo(buttonCenterX - triangleSize / 3, buttonCenterY - triangleSize / 2); // Top left
            this.ctx.lineTo(buttonCenterX + triangleSize / 2.5, buttonCenterY);                 // Right point
            this.ctx.lineTo(buttonCenterX - triangleSize / 3, buttonCenterY + triangleSize / 2); // Bottom left
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Update UI if game is running
        if (this.started && this.gameRunning) {
            this.updateGameUI();
        }
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
});

// Sockets

// Add this near the top of main.js, with more debugging
console.log('Attempting to connect to socket...');
const clientSocket = io();

clientSocket.on('connect', () => {
    console.log('Successfully connected to game socket!');
});

clientSocket.on('disconnect', () => {
    console.log('Disconnected from game socket');
});

clientSocket.on('priceUpdate', (data) => {
    console.log('Received price update:', data);

    // Update the price display
    const priceElement = document.getElementById('price');
    if (priceElement) {
        console.log('Updating price element to:', data.newPrice);
        priceElement.textContent = data.newPrice + ' Digipogs';
    } else {
        console.log('Price element not found!');
    }
});