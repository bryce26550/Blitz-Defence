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

//Some don't work on intended or just need some touching up before being added to the shop
const AVAILABLE_TOWER_SHOP_KEYS = new Set(['shooter', 'blaster', 'wizard', 'hacker', 'overlord', 'generator', 'sentinel', 'railgun', 'gambler', 'bomber']);

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

class FriendlySummon {
    constructor(x, y, path, options = {}) {
        this.x = x;
        this.y = y;
        this.width = options.width || 22;
        this.height = options.height || 22;
        this.speed = options.speed || 1.1;
        this.hp = options.hp || 1;
        this.damage = options.damage || 1;
        this.path = Array.isArray(path) ? path : [];
        this.currentWaypoint = this.path.length > 1 ? 1 : 0;
        this.color = options.color || '#b9ff57';
    }

    update(deltaTime) {
        if (!this.path || this.path.length === 0 || this.currentWaypoint >= this.path.length) {
            this.hp = 0;
            return;
        }

        const target = this.path[this.currentWaypoint];
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = target.x - cx;
        const dy = target.y - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 8) {
            this.currentWaypoint++;
            if (this.currentWaypoint >= this.path.length) {
                this.hp = 0;
            }
            return;
        }

        this.x += (dx / distance) * this.speed * deltaTime / 16;
        this.y += (dy / distance) * this.speed * deltaTime / 16;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.stroke();
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
        this.friendlySummons = [];
        this.particles = [];
        this.spellAnimations = [];
        this.spellZones = [];
        this.trackWalls = [];
        this.towerBuffs = [];

        this.exp = 0;
        this.level = 1;
        this.sheild = 250;
        this.maxSheild = 250;
        this.money = 99999;
        this.expToNextLevel = 100;
        this.showLevelUp = false;

        // Game state flags
        this.started = false;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gamePausedReason = '';
        this.restartFromPause = false
        this.smithCutsceneActive = false;
        this.smithCutsceneResolved = false;
        this.smithCutsceneEnemy = null;
        this.smithCutsceneChoice = null;

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
            railgunShot: document.getElementById('railgunShot'),
            levelUp: document.getElementById('levelUp'),
            megaman: document.getElementById('megaman'),
            plankton: document.getElementById('plankton'),
            mikuBeam: document.getElementById('mikuBeam'),
            scaryDiscord: document.getElementById('scaryDiscord'),
            flintChicken: document.getElementById('flintChicken'),
            getOffFloor: document.getElementById('getOffFloor'),
            wizardFireball: document.getElementById('wizardFireball'),
            wizardIceStorm: document.getElementById('wizardIceStorm'),
            wizardArcaneSurge: document.getElementById('wizardArcaneSurge'),
            wizardEarthquake: document.getElementById('wizardEarthquake'),
            wizardFog: document.getElementById('wizardFog'),
            wizardDoubleStrike: document.getElementById('wizardDoubleStrike'),
            thinkFast: document.getElementById('thinkFast'),
            genFinished: document.getElementById('genFinished'),
            nerfgun: document.getElementById('nerfgun'),
            fireworks: document.getElementById('fireworks'),
            diceRoll: document.getElementById('diceRoll'),
            war: document.getElementById('war'),
            vats: document.getElementById('vats')
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
        this.autoStart = false; // Disable auto-starting next wave for manual control

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

    showMapSelectionMenu() {
        this.hideAllMenus();
        document.getElementById('mapSelectionMenu').classList.remove('hidden');
        this.populateMapGrid();
        this.currentMapPage = 0;
        this.updateMapNavigation();
    }

    populateMapGrid() {
        const mapGrid = document.getElementById('mapGrid');
        if (!mapGrid) return;

        // Define your maps with their corresponding image files
        this.availableMaps = [
            { index: 0, name: '3 Ways', image: '/img/mapIMG/3Ways.png' },
            { index: 1, name: 'Spiral', image: '/img/mapIMG/Spiral.png' },
            { index: 2, name: '4Corners', image: '/img/mapIMG/4Corners.png' },
            { index: 3, name: 'Mirrored', image: '/img/mapIMG/Mirrored.png' },
            { index: 4, name: 'Cricut', image: '/img/mapIMG/Circut.png' },
            { index: 5, name: 'Eye Spy', image: '/img/mapIMG/EyeSpye.png' },
            { index: 6, name: '???', image: '/img/mapIMG/random.png' },
            { index: 7, name: 'Vortex', image: '/img/mapIMG/VortexMap.png' },
            { index: 8, name: 'Empty Space', image: '/img/mapIMG/EmptySpace.png' }
        ];

        this.mapsPerPage = 8;
        this.totalPages = Math.ceil(this.availableMaps.length / this.mapsPerPage);
        this.currentMapPage = 0;

        this.renderMapPage();
    }

    renderMapPage() {
        const mapGrid = document.getElementById('mapGrid');
        mapGrid.innerHTML = '';

        const startIndex = this.currentMapPage * this.mapsPerPage;
        const endIndex = Math.min(startIndex + this.mapsPerPage, this.availableMaps.length);

        for (let i = startIndex; i < endIndex; i++) {
            const map = this.availableMaps[i];

            const mapCard = document.createElement('div');
            mapCard.className = 'map-card';
            if (map.index === this.mapManager.currentMapIndex) {
                mapCard.classList.add('selected');
            }

            // Updated structure: name first, then image
            mapCard.innerHTML = `
            <div class="map-name">${map.name}</div>
            <img src="${map.image}" alt="${map.name}" class="map-preview-img" 
                 onerror="this.style.background='#333'; this.style.border='1px solid #555';">
        `;

            mapCard.addEventListener('click', () => {
                this.selectMap(map.index);
            });

            mapGrid.appendChild(mapCard);
        }
    }


    selectMap(mapIndex) {
        console.log(`Selected map: ${mapIndex}`);

        // Update the map manager
        this.mapManager.currentMapIndex = mapIndex;
        this.mapManager.currentMap = this.mapManager.maps[mapIndex];
        this.updateMultiTrackMode();

        // Hide the selection menu and return to start menu
        document.getElementById('mapSelectionMenu').classList.add('hidden');
        this.showStartMenu();

        // The canvas should automatically update because the start menu shows the map
    }

    updateMapNavigation() {
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageIndicator = document.getElementById('pageIndicator');

        if (prevBtn) prevBtn.disabled = this.currentMapPage === 0;
        if (nextBtn) nextBtn.disabled = this.currentMapPage >= this.totalPages - 1;
        if (pageIndicator) {
            pageIndicator.textContent = `Page ${this.currentMapPage + 1} of ${this.totalPages}`;
        }
    }


    showPauseMenu() {
        this.hideAllMenus();
        document.getElementById('pauseMenu').classList.remove('hidden');
    }

    showSmithCutscene(enemy) {
        if (this.smithCutsceneResolved || this.smithCutsceneActive) return;

        console.log('🎬 Smith Cutscene Triggered!');
        this.smithCutsceneActive = true;
        this.smithCutsceneEnemy = enemy || this.bosses.find(boss => boss && boss.isFinalBoss) || null;
        this.smithCutsceneChoice = null;
        this.gameRunning = false;
        this.hideBossHealthBar();
        this.hideAllMenus();

        const dialogue = document.getElementById('smithCutsceneDialogue');
        if (dialogue) {
            dialogue.textContent = 'Wait. I just wanted you all to do your best and grow as people.';
            console.log('✓ Dialogue text set');
        } else {
            console.error('✗ smithCutsceneDialogue element not found');
        }

        const cutscene = document.getElementById('smithCutscene');
        if (cutscene) {
            cutscene.classList.remove('hidden');
            console.log('✓ Cutscene overlay shown');
        } else {
            console.error('✗ smithCutscene element not found');
        }
    }

    hideSmithCutscene() {
        const cutscene = document.getElementById('smithCutscene');
        if (cutscene) {
            cutscene.classList.add('hidden');
        }

        this.smithCutsceneActive = false;
        this.smithCutsceneEnemy = null;
    }

    // showLevelUpMenu() {
    //     this.hideAllMenus();
    //     document.getElementById('levelUpMenu').classList.remove('hidden');
    //     this.populateUpgradeOptions();
    // }

    hideAllMenus() {
        const menuIds = ['startMenu', 'pauseMenu', 'levelUpMenu', 'gameOver', 'victoryMenu', 'mapSelectionMenu', 'smithCutscene'];
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

    isMaxUpgradeShotTower(tower) {
        if (!tower) return false;
        if (tower.type === 'gambler') {
            return tower.level >= 10;
        }

        return !!(tower.isMaxUpgradeLevel && tower.isMaxUpgradeLevel());
    }

    getMaxUpgradeShotSound(tower) {
        if (!tower) return null;

        switch (tower.type) {
            case 'bomber':
                return 'fireworks';
            case 'blaster':
                return 'plankton';
            case 'shooter':
                return 'thinkFast';
            case 'sentinel':
                return 'nerfgun';
            case 'generator':
                return 'genFinished';
            case 'wizard':
                return 'wizardFireball';
            case 'railgun':
                return 'mikuBeam';
            case 'hacker':
                return 'getOffFloor';
            case 'overlord':
                return 'flintChicken';
            case 'gambler':
                return 'diceRoll';
            default:
                return null;
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
        const upgradeButton = document.getElementById('towerUpgradeBtn');
        const sellButton = document.getElementById('towerSellBtn');
        if (!panel || !title || !body || !upgradeButton || !sellButton) return;

        this.updateStoreDockUI();

        if (!this.started || !this.gameRunning) {
            return;
        }

        if (!this.selectedPlacedTower) {
            panel.classList.add('inactive');
            title.textContent = 'No Tower Selected';
            body.innerHTML = 'Click a placed tower to view upgrades.';
            upgradeButton.textContent = 'Upgrade';
            upgradeButton.disabled = true;
            upgradeButton.dataset.upgradeId = '';
            sellButton.textContent = 'Sell';
            sellButton.disabled = true;
            return;
        }

        panel.classList.remove('inactive');

        const tower = this.selectedPlacedTower;
        const nextUpgrades = tower.getAvailableUpgrades ? tower.getAvailableUpgrades() : [];
        const nextUpgrade = nextUpgrades[0];
        const gamblerRollLocked =
            tower.type === 'gambler' &&
            tower.gamblerUpgradeWavePurchased === this.waveNumber;
        const sellValue = tower.getSellValue ? tower.getSellValue() : Math.floor((tower.cost || 0) * 0.63);

        const levelText = `Lv ${tower.level || 1}`;
        if (tower.type === 'hacker') {
            const hackedTotal = Math.round(tower.totalHackedMoney || 0);
            title.textContent = `${tower.name} (${levelText} | Earned $${hackedTotal})`;
        } else {
            title.textContent = `${tower.name} (${levelText})`;
        }
        sellButton.textContent = `Sell ($${sellValue})`;
        sellButton.disabled = false;

        if (!nextUpgrade) {
            body.innerHTML = 'No upgrades available yet for this tower.';
            upgradeButton.textContent = 'Maxed';
            upgradeButton.disabled = true;
            upgradeButton.dataset.upgradeId = '';
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

        if (tower.type === 'gambler') {
            bodyHTML += `<div class="upgrade-description">Only one gambler roll can be bought per turn.</div>`;
        }

        body.innerHTML = bodyHTML;
        if (tower.type === 'gambler' && gamblerRollLocked) {
            upgradeButton.textContent = 'Roll used this turn';
            upgradeButton.disabled = true;
        } else if (tower.type === 'gambler') {
            upgradeButton.textContent = `Roll the Dice ($${nextUpgrade.cost})`;
            upgradeButton.disabled = this.money < nextUpgrade.cost;
        } else {
            upgradeButton.textContent = `Buy ${nextUpgrade.name} ($${nextUpgrade.cost})`;
            upgradeButton.disabled = this.money < nextUpgrade.cost;
        }
        upgradeButton.dataset.upgradeId = nextUpgrade.id;
    }

    buySelectedTowerUpgrade() {
        const tower = this.selectedPlacedTower;
        if (!tower || !tower.getAvailableUpgrades || !tower.applyUpgrade) return;

        const [nextUpgrade] = tower.getAvailableUpgrades();
        if (!nextUpgrade) return;
        if (this.money < nextUpgrade.cost) return;
        if (tower.type === 'gambler' && tower.gamblerUpgradeWavePurchased === this.waveNumber) {
            return;
        }

        const applied = tower.applyUpgrade(nextUpgrade.id);
        if (!applied) return;

        this.money -= applied.cost;
        if (tower.type === 'wizard' && applied.id === 'spellweaving') {
            this.playSound('wizardDoubleStrike');
        } else if (tower.type === 'wizard' && applied.id === 'untoldPower') {
            this.playSound('wizardFog');
        } else if (tower.type === 'generator' && tower.isMaxUpgradeLevel && tower.isMaxUpgradeLevel()) {
            this.playSound('genFinished');
        } else if (tower.type === 'sentinel' && tower.isMaxUpgradeLevel && tower.isMaxUpgradeLevel()) {
            this.playSound('nerfgun');
        } else if (tower.type === 'shooter' && tower.isMaxUpgradeLevel && tower.isMaxUpgradeLevel()) {
            this.playSound('thinkFast');
        } else if (tower.type === 'gambler') {
            tower.gamblerUpgradeWavePurchased = this.waveNumber;
            this.playSound('diceRoll');
        } else if (tower.type === 'hacker' && tower.isMaxUpgradeLevel && tower.isMaxUpgradeLevel()) {
            this.playSound('getOffFloor');
        } else if (tower.type === 'overlord' && tower.isMaxUpgradeLevel && tower.isMaxUpgradeLevel()) {
            this.playSound('flintChicken');
        } else if (tower.type === 'bomber' && tower.isMaxUpgradeLevel && tower.isMaxUpgradeLevel()) {
            this.playSound('war');
        } else if (tower.type === 'blaster' && applied.id === 'plankton') {
            this.playSound('plankton');
        } else if (tower.type === 'railgun' && applied.id === 'mikubeam') {
            this.playSound('mikuBeam');
        } else {
            this.playSound('levelUp');
        }
        this.updateGameUI();
        console.log(`Upgraded ${tower.name} with ${applied.name}. Money left: ${this.money}`);
    }

    sellSelectedTower() {
        const tower = this.selectedPlacedTower;
        if (!tower) return;

        const index = this.placedTowers.indexOf(tower);
        if (index === -1) return;

        const sellValue = tower.getSellValue ? tower.getSellValue() : Math.floor((tower.cost || 0) * 0.63);
        this.money += sellValue;
        this.placedTowers.splice(index, 1);
        this.setSelectedPlacedTower(null);
        this.updateGameUI();
        console.log(`Sold ${tower.name} for $${sellValue}. Money now: ${this.money}`);
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

        this.canvas.addEventListener('contextmenu', (e) => {
            if (this.selectedTower) {
                e.preventDefault();
            }
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

        const bossBtn = document.getElementById('bossBtn');
        if (bossBtn) {
            bossBtn.addEventListener('click', () => {
                console.log('Boss button clicked');
                    document.getElementById('victoryMenu').classList.add('hidden');
                    this.smithCutsceneActive = false;
                    this.smithCutsceneResolved = false;
                    this.smithCutsceneEnemy = null;
                    this.smithCutsceneChoice = null;
                    this.waveNumber = 41;
                    this.loadNewWave();
                    this.started = true;
                    this.gameRunning = true;
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

        const smithSpareBtn = document.getElementById('smithSpareBtn');
        if (smithSpareBtn) {
            smithSpareBtn.addEventListener('click', () => {
                void this.resolveSmithCutscene(true);
            });
        }

        const smithRefuseBtn = document.getElementById('smithRefuseBtn');
        if (smithRefuseBtn) {
            smithRefuseBtn.addEventListener('click', () => {
                void this.resolveSmithCutscene(false);
            });
        }

        // Map selection navigation
        const prevPageBtn = document.getElementById('prevPageBtn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentMapPage > 0) {
                    this.currentMapPage--;
                    this.renderMapPage();
                    this.updateMapNavigation();
                }
            });
        }

        const nextPageBtn = document.getElementById('nextPageBtn');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                if (this.currentMapPage < this.totalPages - 1) {
                    this.currentMapPage++;
                    this.renderMapPage();
                    this.updateMapNavigation();
                }
            });
        }

        const cancelMapSelection = document.getElementById('cancelMapSelection');
        if (cancelMapSelection) {
            cancelMapSelection.addEventListener('click', () => {
                document.getElementById('mapSelectionMenu').classList.add('hidden');
                this.showStartMenu();
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
                this.showMapSelectionMenu();
            });
        }

        const towerUpgradeBtn = document.getElementById('towerUpgradeBtn');
        if (towerUpgradeBtn) {
            towerUpgradeBtn.addEventListener('click', () => {
                this.buySelectedTowerUpgrade();
            });
        }

        const towerSellBtn = document.getElementById('towerSellBtn');
        if (towerSellBtn) {
            towerSellBtn.addEventListener('click', () => {
                this.sellSelectedTower();
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
        // Right-click cancels the currently selected shop tower for placement.
        if (e.button === 2) {
            if (this.selectedTower) {
                e.preventDefault();
                this.selectedTower = null;
                this.updateTowerShopUI();
            }
            return;
        }

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
            if (clickedTower) {
                this.toggleStoreDock(true);
                return;
            }
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
            if (placedTower.type === 'hacker') {
                this.playSound('scaryDiscord');
            }
            this.selectedTower = null;
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
        this.smithCutsceneActive = false;
        this.smithCutsceneResolved = false;
        this.smithCutsceneEnemy = null;
        this.smithCutsceneChoice = null;
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
        const victoryMessage = document.getElementById('victoryMessage');
        if (victoryMessage) {
            victoryMessage.textContent = '';
            victoryMessage.classList.add('hidden');
        }
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

        if (!this.gameRunning || this.gamePaused) return;

        // Check collisions
        this.checkCollisions();

        // // Player shooting
        // if (this.keys['Space']) {
        //     this.player.shoot(this.bullets, this.mouseX, this.mouseY);
        // }

        this.checkWaveProgress();
        // this.checkLevelUp();

        // Update placed towers (acquire targets & fire)
        const allEnemies = [
            ...this.enemies,
            ...this.tanks,
            ...this.sprinters,
            ...this.bosses
        ];

        this.updateSupportTowers(deltaTime, allEnemies);
        this.castWizardSpells(deltaTime, allEnemies);
        this.updateSpellStates(deltaTime);

        this.placedTowers.forEach(tower => {
            tower.update(deltaTime, allEnemies);
            const fired = tower.shoot(this.bullets);
            const hasOverdrive = tower.appliedUpgradeIds && tower.appliedUpgradeIds.includes('overdrive');
            const hasMaximumOverdrive = tower.appliedUpgradeIds && tower.appliedUpgradeIds.includes('plankton');
            const isMaxUpgradeShotTower = this.isMaxUpgradeShotTower(tower);

            if (fired && isMaxUpgradeShotTower && Math.random() < 0.01) {
                const soundName = this.getMaxUpgradeShotSound(tower);
                if (soundName) this.playSound(soundName);
            } else if (fired && tower.type === 'bomber') {
                this.playSound('fireworks');
            }
            if (fired && tower.type === 'blaster' && hasOverdrive && !hasMaximumOverdrive) {
                this.playSound('megaman');
            }
            if (fired && tower.type === 'wizard') {
                this.playSound('wizardFireball');
            }
        });
    }

    findNearestEnemy(x, y, enemies, range = Infinity, canSeeHidden = false) {
        let nearest = null;
        let nearestDist = range;

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (!enemy || enemy.hp <= 0) continue;
            if (enemy.hidden && !canSeeHidden) continue;

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

    getNearestTrackSpawn(x, y) {
        const availablePaths = this.mapManager.getAvailablePaths();
        let best = null;

        for (let p = 0; p < availablePaths.length; p++) {
            const pathName = availablePaths[p];
            const waypoints = this.mapManager.getPathWaypoints(pathName) || [];
            for (let i = 0; i < waypoints.length; i++) {
                const point = waypoints[i];
                const dx = point.x - x;
                const dy = point.y - y;
                const distSq = dx * dx + dy * dy;
                if (!best || distSq < best.distSq) {
                    best = {
                        pathName,
                        waypoints,
                        waypointIndex: i,
                        x: point.x,
                        y: point.y,
                        distSq
                    };
                }
            }
        }

        return best;
    }

    buildReversePathFromWaypoint(waypoints, startIndex) {
        const reversePath = [];
        for (let i = startIndex; i >= 0; i--) {
            reversePath.push({ x: waypoints[i].x, y: waypoints[i].y });
        }
        return reversePath;
    }

    spawnFriendlySummon(tower, bossSummon = false) {
        const cx = tower.x + tower.width / 2;
        const cy = tower.y + tower.height / 2;
        const nearestTrack = this.getNearestTrackSpawn(cx, cy);
        if (!nearestTrack || !nearestTrack.waypoints || nearestTrack.waypoints.length < 2) return;

        const reversePath = this.buildReversePathFromWaypoint(
            nearestTrack.waypoints,
            Math.max(1, nearestTrack.waypointIndex)
        );
        if (reversePath.length < 2) return;

        const summonSpeed = Math.max(0.65, (tower.projectileSpeed || 1) * (tower.summonMoveSpeedMultiplier || 1));
        const summonDamage = Math.max(
            1,
            Math.round((tower.damage || 1) * (tower.summonDamageMultiplier || 1) * (bossSummon ? 1.25 : 1) * 0.65)
        );

        const summonSize = bossSummon ? 26 : 22;
        const summon = new FriendlySummon(
            reversePath[0].x - summonSize / 2,
            reversePath[0].y - summonSize / 2,
            reversePath,
            {
                width: summonSize,
                height: summonSize,
                speed: summonSpeed,
                hp: bossSummon ? 2 : 1,
                damage: summonDamage,
                color: bossSummon ? '#ffd166' : '#b9ff57'
            }
        );

        this.friendlySummons.push(summon);
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
            Math.round((tower.damage || 1) * (tower.summonDamageMultiplier || 1) * (bossSummon ? 1.25 : 1) * 0.65)
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

    getHackerRoundReward(tower) {
        return Math.max(
            1,
            Math.round((12 + this.waveNumber * 1.2) * (tower.hackRewardMultiplier || 1))
        );
    }

    runHackerRoundHack(allEnemies) {
        for (let i = 0; i < this.placedTowers.length; i++) {
            const tower = this.placedTowers[i];
            if (!tower || tower.type !== 'hacker') continue;

            const reward = this.getHackerRoundReward(tower);
            this.money += reward;
            tower.totalHackedMoney = (tower.totalHackedMoney || 0) + reward;

            if (tower.isMaxUpgradeLevel && tower.isMaxUpgradeLevel()) {
                this.playSound('getOffFloor');
            }

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
        }
    }

    isWaveInProgress() {
        return this.totalEnemiesInWave > 0
            && (this.enemiesSpawned < this.totalEnemiesInWave || this.enemiesAlive > 0);
    }

    updateSupportTowers(deltaTime, allEnemies) {
        for (let i = 0; i < this.placedTowers.length; i++) {
            const tower = this.placedTowers[i];
            if (!tower) continue;

            if (tower.type === 'generator') {
                if (!this.isWaveInProgress()) {
                    continue;
                }
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
                        const bossSummon = Math.random() < (tower.summonBossChance || 0);
                        this.spawnFriendlySummon(tower, bossSummon);
                    }

                    tower.summonCooldown = Math.max(1200, tower.summonSpeed || 2500);
                }
            }
        }
    }

    getAllEnemies() {
        return [
            ...this.enemies,
            ...this.shooters,
            ...this.tanks,
            ...this.sprinters,
            ...this.bosses
        ];
    }

    addSpellAnimation(type, x, y, options = {}) {
        this.spellAnimations.push({
            type,
            x,
            y,
            radius: options.radius || 30,
            life: options.life || 600,
            maxLife: options.life || 600,
            color: options.color || '#ffffff'
        });
    }

    getEnemySpeedMultiplier(enemy, now) {
        let multiplier = 1;

        if ((enemy.spellSlowUntil || 0) > now) {
            multiplier = Math.min(multiplier, enemy.spellSlowMultiplier || 1);
        }

        for (let i = 0; i < this.spellZones.length; i++) {
            const zone = this.spellZones[i];
            if (!zone || zone.type !== 'slow' || zone.expiresAt <= now) continue;
            const ex = enemy.x + (enemy.width || 0) / 2;
            const ey = enemy.y + (enemy.height || 0) / 2;
            const dx = ex - zone.x;
            const dy = ey - zone.y;
            if ((dx * dx + dy * dy) <= zone.radius * zone.radius) {
                multiplier = Math.min(multiplier, zone.multiplier || 1);
            }
        }

        return Math.max(0.2, multiplier);
    }

    handleTrackWallCollision(enemy, deltaTime) {
        for (let i = 0; i < this.trackWalls.length; i++) {
            const wall = this.trackWalls[i];
            if (!wall || wall.hp <= 0) continue;
            if (!this.checkCollision(enemy, wall)) continue;

            const breakRate = Math.max(0.1, (enemy.damage || 1) * 0.025) * (deltaTime / 16);
            wall.hp -= breakRate;

            if (wall.hp <= 0) {
                this.addSpellAnimation('quakeBreak', wall.x + wall.width / 2, wall.y + wall.height / 2, {
                    radius: 26,
                    life: 500,
                    color: '#d7ccc8'
                });
                this.playSound('wizardEarthquake');
            }
            return true;
        }
        return false;
    }

    updateEnemyGroup(enemyList, deltaTime) {
        const now = Date.now();
        return enemyList.filter(enemy => {
            if ((enemy.stunTimer || 0) > 0) {
                enemy.stunTimer -= deltaTime;
            } else if (!this.handleTrackWallCollision(enemy, deltaTime)) {
                const speedMultiplier = this.getEnemySpeedMultiplier(enemy, now);
                const baseSpeed = enemy.speed;
                enemy.speed = baseSpeed * speedMultiplier;
                enemy.update(deltaTime);
                enemy.speed = baseSpeed;
            }

            if (enemy.hp > 0) {
                return true;
            }

            if (enemy.isFinalBoss && !this.smithCutsceneActive && !this.smithCutsceneResolved) {
                console.log('🎬 Smith HP dropped to 0, triggering cutscene...');
                this.showSmithCutscene(enemy);
                return true;
            }

            return enemy.isFinalBoss && this.smithCutsceneActive && !this.smithCutsceneResolved;
        });
    }

    updateTowerBuffStates(now) {
        for (let i = 0; i < this.placedTowers.length; i++) {
            const tower = this.placedTowers[i];
            if (tower) {
                tower.attackSpeedMultiplier = 1;
            }
        }

        for (let i = 0; i < this.towerBuffs.length; i++) {
            const buff = this.towerBuffs[i];
            if (!buff || buff.expiresAt <= now) continue;

            for (let t = 0; t < this.placedTowers.length; t++) {
                const tower = this.placedTowers[t];
                if (!tower || tower === buff.sourceTower) continue;
                const tx = tower.x + tower.width / 2;
                const ty = tower.y + tower.height / 2;
                const dx = tx - buff.x;
                const dy = ty - buff.y;
                if ((dx * dx + dy * dy) <= buff.radius * buff.radius) {
                    tower.attackSpeedMultiplier = Math.min(
                        tower.attackSpeedMultiplier || 1,
                        buff.attackSpeedMultiplier || 1
                    );
                }
            }
        }
    }

    updateSpellStates(deltaTime) {
        const now = Date.now();

        this.spellAnimations = this.spellAnimations.filter(anim => {
            anim.life -= deltaTime;
            return anim.life > 0;
        });

        this.spellZones = this.spellZones.filter(zone => zone && zone.expiresAt > now);
        this.towerBuffs = this.towerBuffs.filter(buff => buff && buff.expiresAt > now);
        this.trackWalls = this.trackWalls.filter(wall => wall && wall.hp > 0 && wall.expiresAt > now);

        this.updateTowerBuffStates(now);
    }

    castWizardSpells(deltaTime, allEnemies) {
        if (!allEnemies || allEnemies.length === 0) return;

        for (let i = 0; i < this.placedTowers.length; i++) {
            const tower = this.placedTowers[i];
            if (!tower || tower.type !== 'wizard') continue;

            tower.spellCooldown = Math.max(0, (tower.spellCooldown || tower.spellCastRate || 0) - deltaTime);
            tower.supportCooldown = Math.max(0, (tower.supportCooldown || tower.supportCastRate || 0) - deltaTime);

            const cx = tower.x + tower.width / 2;
            const cy = tower.y + tower.height / 2;

            if (tower.spellCastRate > 0 && tower.spellCooldown <= 0) {
                const target = this.findNearestEnemy(cx, cy, allEnemies, tower.range + 30);
                if (target) {
                    const tx = target.x + (target.width || 0) / 2;
                    const ty = target.y + (target.height || 0) / 2;
                    const spells = [];
                    if (tower.iceStorm) spells.push('iceStorm');
                    if (tower.arcaneSurge) spells.push('arcaneSurge');
                    if (tower.earthquake) spells.push('earthquake');
                    const spell = spells.length > 0
                        ? spells[Math.floor(Math.random() * spells.length)]
                        : 'fireball';

                    if (spell === 'iceStorm') {
                        const dx = tx - cx;
                        const dy = ty - cy;
                        const len = Math.sqrt(dx * dx + dy * dy) || 1;
                        const speed = Math.max(0.55, (tower.projectileSpeed || 1) * 0.85);

                        const bullet = new Bullet(cx, cy, true);
                        bullet.isPlayer = true;
                        bullet.fromTower = true;
                        bullet.sourceTower = tower;
                        bullet.isWizardIceStorm = true;
                        bullet.width = 11;
                        bullet.height = 11;
                        bullet.damage = Math.max(1, Math.round((tower.damage || 1) * 0.75));
                        bullet.pierce = 1;
                        bullet.lifeRemaining = 2400;
                        bullet.vx = (dx / len) * speed;
                        bullet.vy = (dy / len) * speed;
                        bullet.towerColor = '#90caf9';
                        bullet.render = function(ctx) {
                            const px = this.x + this.width / 2;
                            const py = this.y + this.height / 2;
                            ctx.save();
                            ctx.fillStyle = 'rgba(144, 202, 249, 0.35)';
                            ctx.beginPath();
                            ctx.arc(px, py, this.width * 0.9, 0, Math.PI * 2);
                            ctx.fill();

                            ctx.fillStyle = '#b3e5fc';
                            ctx.beginPath();
                            ctx.arc(px, py, this.width * 0.55, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        };
                        this.bullets.push(bullet);
                        this.playSound('wizardIceStorm');
                    } else if (spell === 'arcaneSurge') {
                        const surgeRadius = 60;
                        for (let e = 0; e < allEnemies.length; e++) {
                            const enemy = allEnemies[e];
                            if (!enemy || enemy.hp <= 0) continue;
                            const ex = enemy.x + (enemy.width || 0) / 2;
                            const ey = enemy.y + (enemy.height || 0) / 2;
                            const sdx = ex - tx;
                            const sdy = ey - ty;
                            if ((sdx * sdx + sdy * sdy) <= surgeRadius * surgeRadius) {
                                const surgeDamage = Math.max(1, Math.round((tower.damage || 1) * 0.8));
                                enemy.takeDamage ? enemy.takeDamage(surgeDamage) : (enemy.hp -= surgeDamage);
                            }
                        }
                        this.addSpellAnimation('arcaneSurge', tx, ty, {
                            radius: surgeRadius,
                            life: 550,
                            color: '#ba68c8'
                        });
                    } else if (spell === 'earthquake') {
                        const nearestTrack = this.getNearestTrackSpawn(tx, ty);
                        if (nearestTrack) {
                            const wallSize = 22;
                            this.trackWalls.push({
                                x: nearestTrack.x - wallSize / 2,
                                y: nearestTrack.y - wallSize / 2,
                                width: wallSize,
                                height: wallSize,
                                hp: 18,
                                expiresAt: Date.now() + 5500
                            });
                            this.addSpellAnimation('earthquake', nearestTrack.x, nearestTrack.y, {
                                radius: 36,
                                life: 650,
                                color: '#bcaaa4'
                            });
                            this.playSound('wizardEarthquake');
                        }
                    }
                }

                tower.spellCooldown = Math.max(1000, tower.spellCastRate || 7000);
            }

            if (tower.supportCastRate > 0 && tower.supportCooldown <= 0) {
                if (tower.fog) {
                    const fogTarget = this.findNearestEnemy(cx, cy, allEnemies, tower.range + 40);
                    if (fogTarget) {
                        const fx = fogTarget.x + (fogTarget.width || 0) / 2;
                        const fy = fogTarget.y + (fogTarget.height || 0) / 2;
                        this.spellZones.push({
                            type: 'slow',
                            x: fx,
                            y: fy,
                            radius: 90,
                            multiplier: 0.55,
                            expiresAt: Date.now() + Math.max(3000, tower.spellLength || 2000)
                        });
                        this.addSpellAnimation('fog', fx, fy, {
                            radius: 90,
                            life: Math.max(3000, tower.spellLength || 2000),
                            color: '#90a4ae'
                        });
                    }
                }

                if (tower.doubleStrike) {
                    this.towerBuffs.push({
                        x: cx,
                        y: cy,
                        radius: tower.range + 50,
                        attackSpeedMultiplier: 0.6,
                        expiresAt: Date.now() + 15000,
                        sourceTower: tower
                    });
                    this.addSpellAnimation('doubleStrike', cx, cy, {
                        radius: tower.range + 50,
                        life: 950,
                        color: '#fff176'
                    });
                }

                tower.supportCooldown = Math.max(2200, tower.supportCastRate || 12000);
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

        // Slightly accelerate spawn pacing as waves increase to preserve the
        // existing curve while increasing pressure.
        const paceBonus = Math.floor((this.waveNumber - 1) * 3.5);
        this.spawnDelay = Math.max(120, 260 - paceBonus);

        // Reset wave track index for per-wave mode
        if (this.multiTrackMode === 'perWave') {
            const availablePaths = this.mapManager.getAvailablePaths();
            this.waveTrackIndex = (this.waveTrackIndex + 1) % availablePaths.length;
        }

        const allEnemies = [
            ...this.enemies,
            ...this.shooters,
            ...this.tanks,
            ...this.sprinters,
            ...this.bosses
        ];
        this.runHackerRoundHack(allEnemies);
    }

    getEnemyBucketForClass(EnemyClass) {
        if (!EnemyClass) return 'enemies';

        if (EnemyClass === Smith || EnemyClass.name === 'Smith') return 'bosses';
        if (EnemyClass === Boss || EnemyClass.name === 'Boss') return 'bosses';
        if (EnemyClass === Tank || EnemyClass.name === 'Tank') return 'tanks';

        if (
            EnemyClass === Sprinter1 ||
            EnemyClass === Sprinter2 ||
            (EnemyClass.name && EnemyClass.name.startsWith('Sprinter'))
        ) {
            return 'sprinters';
        }

        if (
            EnemyClass === Enemy1 ||
            EnemyClass === Enemy2 ||
            EnemyClass === Enemy3 ||
            (EnemyClass.name && EnemyClass.name.startsWith('Enemy'))
        ) {
            return 'enemies';
        }

        return 'enemies';
    }

    getEnemyBucketForClass(EnemyClass) {
        if (!EnemyClass) return 'enemies';

        if (EnemyClass === Smith || EnemyClass.name === 'Smith') return 'bosses';
        if (EnemyClass === Boss || EnemyClass.name === 'Boss') return 'bosses';
        if (EnemyClass === Tank || EnemyClass.name === 'Tank') return 'tanks';

        if (
            EnemyClass === Sprinter1 ||
            EnemyClass === Sprinter2 ||
            (EnemyClass.name && EnemyClass.name.startsWith('Sprinter'))
        ) {
            return 'sprinters';
        }

        if (
            EnemyClass === Enemy1 ||
            EnemyClass === Enemy2 ||
            EnemyClass === Enemy3 ||
            (EnemyClass.name && EnemyClass.name.startsWith('Enemy'))
        ) {
            return 'enemies';
        }

        return 'enemies';
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

        // Don't apply enhancements to Smith - he's already perfect
        if (EnemyClass.name !== 'Smith') {
            applyEnemyEnhancements(enemy, this.waveNumber);
        }

        // Add to appropriate array
        const bucket = this.getEnemyBucketForClass(EnemyClass);
        this[bucket].push(enemy);

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
        [...this.enemies, ...this.tanks, ...this.sprinters, ...this.bosses].forEach(enemy => {
            this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        });

        // Actually clear all enemies and bullets
        this.enemies = [];
        this.tanks = [];
        this.sprinters = [];
        this.bosses = [];
        this.friendlySummons = [];
        this.bullets = [];
    }

    async checkWaveProgress() {
        // Don't check progress if no wave has been loaded yet
        if (this.totalEnemiesInWave === 0) {
            return; // Exit early - no wave to check progress on
        }

        // Count total living enemies
        this.enemiesAlive = this.enemies.length + this.tanks.length + this.sprinters.length + this.bosses.length;

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

            // Special case: If we just completed wave 41 (Smith defeated), trigger victory
            if (this.waveNumber === 41) {
                console.log('Smith defeated! Victory achieved!');
                this.victory();
                return;
            }

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


    // checkLevelUp() {
    //     if (this.exp >= this.expToNextLevel && !this.showLevelUp) {
    //         this.showLevelUp = true;
    //         this.gamePaused = true;
    //         this.gamePausedReason = 'levelup';
    //         this.generateUpgradeOptions();
    //         this.showLevelUpMenu(); // Show HTML level up menu
    //     }
    // }

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

                // Apply gravity to bomb projectiles for arc effect
                if (bullet.isBomb && bullet.gravity) {
                    bullet.vy = Math.min(bullet.vy + bullet.gravity, bullet.maxFallSpeed || 2);
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

        // Update enemies with shared spell effects and wall interactions.
        this.enemies = this.updateEnemyGroup(this.enemies, deltaTime);
        this.shooters = this.updateEnemyGroup(this.shooters, deltaTime);
        this.tanks = this.updateEnemyGroup(this.tanks, deltaTime);
        this.sprinters = this.updateEnemyGroup(this.sprinters, deltaTime);

        this.friendlySummons = this.friendlySummons.filter(summon => {
            summon.update(deltaTime);
            return summon.hp > 0;
        });

        this.bosses = this.updateEnemyGroup(this.bosses, deltaTime);


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
        const damageEnemyFromSummon = (enemyList, summon, expReward, giveMoney = true) => {
            for (let i = enemyList.length - 1; i >= 0; i--) {
                const enemy = enemyList[i];
                if (!enemy || enemy.hp <= 0) continue;
                if (!this.checkCollision(summon, enemy)) continue;

                enemy.takeDamage ? enemy.takeDamage(summon.damage) : (enemy.hp -= summon.damage);
                summon.hp -= 1;
                this.createExplosion(
                    enemy.x + (enemy.width || 0) / 2,
                    enemy.y + (enemy.height || 0) / 2
                );

                if (enemy.hp <= 0) {
                    if (giveMoney) {
                        this.money += enemy.worth || 0;
                    }
                    this.addExp(expReward);
                    enemyList.splice(i, 1);
                }

                if (summon.hp <= 0) {
                    this.createExplosion(
                        summon.x + summon.width / 2,
                        summon.y + summon.height / 2
                    );
                    return true;
                }
            }
            return false;
        };

        for (let i = this.friendlySummons.length - 1; i >= 0; i--) {
            const summon = this.friendlySummons[i];
            if (!summon || summon.hp <= 0) {
                this.friendlySummons.splice(i, 1);
                continue;
            }

            let summonConsumed = false;
            summonConsumed = summonConsumed || damageEnemyFromSummon(this.enemies, summon, 5, true);
            summonConsumed = summonConsumed || damageEnemyFromSummon(this.shooters, summon, 12, true);
            summonConsumed = summonConsumed || damageEnemyFromSummon(this.tanks, summon, 25, true);
            summonConsumed = summonConsumed || damageEnemyFromSummon(this.sprinters, summon, 35, true);
            summonConsumed = summonConsumed || damageEnemyFromSummon(this.bosses, summon, 100, true);

            if (summonConsumed || summon.hp <= 0) {
                this.friendlySummons.splice(i, 1);
            }
        }

        const getTowerAdjustedDamage = (bullet, target) => {
            let damage = bullet.damage || 1;
            if (target.reinforced && !bullet.damageReinforced) {
                damage = Math.max(1, Math.ceil(damage * 0.5));
            }
            return damage;
        };

        const getBeamLineForBullet = (bullet) => {
            if (!bullet || !bullet.isRailBeam) return null;

            const centerX = bullet.x + (bullet.width || 0) / 2;
            const centerY = bullet.y + (bullet.height || 0) / 2;
            const velocityLength = Math.hypot(bullet.vx || 0, bullet.vy || 0) || 1;
            const dirX = (bullet.vx || 0) / velocityLength;
            const dirY = (bullet.vy || 0) / velocityLength;

            const thickness = bullet.beamThickness || (bullet.isMikuBeam ? 18 : 6);

            if (bullet.isMikuBeam) {
                const source = bullet.sourceTower;
                const startX = source ? (source.x + source.width / 2) : centerX;
                const startY = source ? (source.y + source.height / 2) : centerY;
                const fullScreenLength = Math.hypot(this.width, this.height) + 180;
                return {
                    startX,
                    startY,
                    endX: startX + dirX * fullScreenLength,
                    endY: startY + dirY * fullScreenLength,
                    width: thickness
                };
            }

            const beamLength = bullet.beamLength || 120;
            return {
                startX: centerX - dirX * beamLength,
                startY: centerY - dirY * beamLength,
                endX: centerX,
                endY: centerY,
                width: thickness
            };
        };

        const canBeamDamageTarget = (bullet, target) => {
            if (!bullet || !bullet.isRailBeam) return true;
            if (!bullet._beamHitTargets) {
                bullet._beamHitTargets = new WeakSet();
            }
            if (bullet._beamHitTargets.has(target)) {
                return false;
            }
            bullet._beamHitTargets.add(target);
            return true;
        };

        const bulletHitsEnemy = (bullet, enemy) => {
            if (!bullet || !enemy) return false;
            if (bullet.isRailBeam) {
                const beamLine = getBeamLineForBullet(bullet);
                if (!beamLine) return false;
                return this.checkLineCollision(enemy, beamLine);
            }
            return this.checkCollision(bullet, enemy);
        };

        const spawnRefractionShards = (bullet, target) => {
            if (!bullet.fromTower || bullet.isRefractionShard) return;

            const sourceTower = bullet.sourceTower;
            if (!sourceTower || sourceTower.type !== 'railgun') return;

            const splitCount = sourceTower.refractionSplitCount || 0;
            if (splitCount <= 0) return;

            const originX = target.x + (target.width || 0) / 2;
            const originY = target.y + (target.height || 0) / 2;
            const baseAngle = Math.atan2(bullet.vy || 0, bullet.vx || 1);
            const splitSpread = Math.PI / 3;
            const splitSpeed = Math.max(0.45, sourceTower.projectileSpeed || 0.8);
            const splitDamage = Math.max(1, Math.round((bullet.damage || 1) * 0.7));

            for (let s = 0; s < splitCount; s++) {
                const t = splitCount === 1 ? 0.5 : (s / (splitCount - 1));
                const angle = baseAngle - splitSpread / 2 + (splitSpread * t);

                const shard = new Bullet(originX, originY, true);
                shard.width = 4;
                shard.height = 4;
                shard.vx = Math.cos(angle) * splitSpeed;
                shard.vy = Math.sin(angle) * splitSpeed;
                shard.damage = splitDamage;
                shard.pierce = 1;
                shard.fromTower = true;
                shard.sourceTower = sourceTower;
                shard.towerColor = bullet.towerColor;
                shard.damageReinforced = !!bullet.damageReinforced;
                shard.lifeRemaining = 700;
                shard.isRefractionShard = true;
                shard.render = function(ctx) {
                    ctx.fillStyle = this.towerColor || '#a8d7ff';
                    ctx.beginPath();
                    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                };
                this.bullets.push(shard);
            }
        };

        const applyTowerHitEffects = (bullet, target) => {
            if (!bullet.fromTower) return;

            spawnRefractionShards(bullet, target);

            if (bullet.isWizardIceStorm) {
                const sx = target.x + (target.width || 0) / 2;
                const sy = target.y + (target.height || 0) / 2;
                this.spellZones.push({
                    type: 'slow',
                    x: sx,
                    y: sy,
                    radius: 70,
                    multiplier: 0.45,
                    expiresAt: Date.now() + 3000
                });
                this.addSpellAnimation('iceStorm', sx, sy, {
                    radius: 70,
                    life: 800,
                    color: '#90caf9'
                });
            }

            if (bullet.stunChance && Math.random() < bullet.stunChance) {
                const stunDuration = bullet.stunDuration || 800;
                target.stunTimer = Math.max(target.stunTimer || 0, stunDuration);
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
                // Handle bomb explosions (bomb projectiles detonate on ANY hit)
                let shouldSkipRegularCollision = false;
                if (bullet.isBomb && bullet.explosionArea) {
                    let bombHit = false;
                    const explosionX = bullet.x + bullet.width / 2;
                    const explosionY = bullet.y + bullet.height / 2;
                    const explosionRadius = bullet.explosionArea;

                    // Apply explosion damage to all enemies within radius
                    const applyExplosionDamage = (enemyList) => {
                        for (let j = enemyList.length - 1; j >= 0; j--) {
                            const enemy = enemyList[j];
                            if (!enemy || enemy.hp <= 0) continue;
                        
                            const ex = enemy.x + (enemy.width || 0) / 2;
                            const ey = enemy.y + (enemy.height || 0) / 2;
                            const dx = ex - explosionX;
                            const dy = ey - explosionY;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                        
                            if (dist <= explosionRadius) {
                                const damage = getTowerAdjustedDamage(bullet, enemy);
                                enemy.takeDamage ? enemy.takeDamage(damage) : (enemy.hp -= damage);
                                applyTowerHitEffects(bullet, enemy);
                                bombHit = true;
                            
                                if (enemy.hp <= 0) {
                                    const bomberKilledBoss = enemyList === this.bosses
                                        && bullet.sourceTower
                                        && bullet.sourceTower.type === 'bomber';
                                    if (bomberKilledBoss) {
                                        this.playSound('vats');
                                    }
                                    this.money += enemy.worth || 0;
                                    this.addExp(5);
                                    if (this.player.lifeSteal && this.player.health < this.player.maxHealth) {
                                        this.player.health++;
                                    }
                                    enemyList.splice(j, 1);
                                }
                            }
                        }
                    };

                    // Check all enemy types within explosion radius
                    applyExplosionDamage(this.enemies);
                    applyExplosionDamage(this.shooters);
                    applyExplosionDamage(this.tanks);
                    applyExplosionDamage(this.sprinters);
                    applyExplosionDamage(this.bosses);

                    if (bombHit) {
                        this.createExplosion(explosionX, explosionY);
                        this.addSpellAnimation('bombBlast', explosionX, explosionY, {
                            radius: Math.max(18, Math.min(36, explosionRadius * 0.75)),
                            life: 2000,
                            color: '#ffb74d'
                        });
                        this.playSound('enemyHit');
                        this.bullets.splice(i, 1);
                        shouldSkipRegularCollision = true;
                    }
                }

                if (shouldSkipRegularCollision) continue;

                // Check vs enemies
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (bulletHitsEnemy(bullet, this.enemies[j])) {
                    const enemy = this.enemies[j];
                    if (!canBeamDamageTarget(bullet, enemy)) continue;
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
                if (bulletHitsEnemy(bullet, this.shooters[j])) {
                    const shooter = this.shooters[j];
                    if (!canBeamDamageTarget(bullet, shooter)) continue;
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
                if (bulletHitsEnemy(bullet, this.tanks[j])) {
                    const tank = this.tanks[j];
                    if (!canBeamDamageTarget(bullet, tank)) continue;
                    const damage = getTowerAdjustedDamage(bullet, tank);
                    tank.takeDamage(damage);
                    applyTowerHitEffects(bullet, tank);
                    this.createExplosion(bullet.x, bullet.y);
                    this.playSound('enemyHit');

                    if (tank.hp <= 0) {
                        this.createExplosion(tank.x, tank.y);
                        this.money += tank.worth;
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
                if (bulletHitsEnemy(bullet, this.sprinters[j])) {
                    const sprinter = this.sprinters[j];
                    if (!canBeamDamageTarget(bullet, sprinter)) continue;
                    const damage = getTowerAdjustedDamage(bullet, sprinter);
                    sprinter.takeDamage(damage);
                    applyTowerHitEffects(bullet, sprinter);
                    this.createExplosion(bullet.x, bullet.y);
                    this.playSound('enemyHit');

                    if (sprinter.hp <= 0) {
                        this.createExplosion(sprinter.x, sprinter.y);
                        this.money += sprinter.worth;
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
                if (bulletHitsEnemy(bullet, this.bosses[j])) {
                    const boss = this.bosses[j];
                    if (!canBeamDamageTarget(bullet, boss)) continue;
                    const damage = getTowerAdjustedDamage(bullet, boss);

                    // Damage the boss first
                    boss.takeDamage ? boss.takeDamage(damage) : (boss.hp -= damage);
                    applyTowerHitEffects(bullet, boss);
                    this.createExplosion(bullet.x, bullet.y);
                    this.playSound('enemyHit');

                    if (boss.hp <= 0) {
                        const bomberKilledBoss = bullet.sourceTower && bullet.sourceTower.type === 'bomber';
                        if (bomberKilledBoss) {
                            this.playSound('vats');
                        }
                        this.createExplosion(boss.x, boss.y);
                        this.money += boss.worth;
                        this.bosses.splice(j, 1);

                        this.addExp(150);
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

    // Add this after your existing methods in the Game class

    updateBossHealthBar() {
        const healthBar = document.getElementById('bossHealthBar');
        const healthFill = document.getElementById('bossHealthFill');
        const healthText = document.getElementById('bossHealthText');

        // Find Smith boss
        const smith = this.bosses.find(boss => boss.constructor.name === 'Smith');

        if (smith && smith.isFinalBoss) {
            // Show health bar
            healthBar.style.display = 'block';

            // Update health percentage
            const healthPercent = (smith.hp / smith.maxHp) * 100;
            healthFill.style.width = healthPercent + '%';

            // Update text
            healthText.textContent = `${smith.hp} / ${smith.maxHp}`;

            // Change color based on health
            if (healthPercent > 66) {
                healthFill.style.background = 'linear-gradient(90deg, #ff4444, #ff0000, #cc0000)';
            } else if (healthPercent > 33) {
                healthFill.style.background = 'linear-gradient(90deg, #ffaa00, #ff6600, #ff4400)';
            } else {
                healthFill.style.background = 'linear-gradient(90deg, #ff0000, #aa0000, #660000)';
            }
        } else {
            // Hide health bar when no final boss
            healthBar.style.display = 'none';
        }
    }

    hideBossHealthBar() {
        const healthBar = document.getElementById('bossHealthBar');
        if (healthBar) {
            healthBar.style.display = 'none';
        }
    }


    removeEnemyFromArrays(enemy) {
        let index = this.enemies.indexOf(enemy);
        if (index > -1) this.enemies.splice(index, 1);

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
            return;
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

    renderSpellEffects(ctx) {
        const now = Date.now();

        for (let i = 0; i < this.spellZones.length; i++) {
            const zone = this.spellZones[i];
            if (!zone || zone.expiresAt <= now || zone.type !== 'slow') continue;

            ctx.save();
            ctx.fillStyle = 'rgba(140, 180, 200, 0.16)';
            ctx.strokeStyle = 'rgba(180, 220, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        for (let i = 0; i < this.towerBuffs.length; i++) {
            const buff = this.towerBuffs[i];
            if (!buff || buff.expiresAt <= now) continue;

            ctx.save();
            ctx.strokeStyle = 'rgba(255, 241, 118, 0.35)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(buff.x, buff.y, buff.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        for (let i = 0; i < this.trackWalls.length; i++) {
            const wall = this.trackWalls[i];
            if (!wall || wall.hp <= 0) continue;

            const hpRatio = Math.max(0, Math.min(1, wall.hp / 18));
            ctx.save();
            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            ctx.strokeStyle = '#d7ccc8';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(wall.x, wall.y - 6, wall.width, 4);
            ctx.fillStyle = '#81c784';
            ctx.fillRect(wall.x, wall.y - 6, wall.width * hpRatio, 4);
            ctx.restore();
        }

        for (let i = 0; i < this.spellAnimations.length; i++) {
            const anim = this.spellAnimations[i];
            if (!anim || anim.life <= 0) continue;

            const progress = 1 - (anim.life / Math.max(1, anim.maxLife));
            const alpha = Math.max(0, 1 - progress);
            const radius = anim.radius * (0.55 + progress * 0.75);

            ctx.save();
            if (anim.type === 'fog') {
                ctx.fillStyle = `rgba(176, 190, 197, ${0.18 * alpha})`;
                ctx.beginPath();
                ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (anim.type === 'iceStorm') {
                ctx.strokeStyle = `rgba(179, 229, 252, ${0.75 * alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (anim.type === 'doubleStrike') {
                ctx.strokeStyle = `rgba(255, 241, 118, ${0.7 * alpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (anim.type === 'earthquake' || anim.type === 'quakeBreak') {
                ctx.strokeStyle = `rgba(188, 170, 164, ${0.75 * alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (anim.type === 'arcaneSurge') {
                ctx.strokeStyle = `rgba(186, 104, 200, ${0.8 * alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (anim.type === 'bombBlast') {
                ctx.fillStyle = `rgba(255, 183, 77, ${0.16 * alpha})`;
                ctx.beginPath();
                ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(255, 235, 170, ${0.7 * alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(anim.x, anim.y, radius * 0.75, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    async gameOver() {
        this.gameRunning = false;
        this.hideBossHealthBar(); // Hide boss health bar
        this.hideSmithCutscene();
        this.playSound('playerDefeat')
        document.getElementById('gameOver').classList.remove('hidden');
    }

    async victory(message = '') {
        this.gameRunning = false;
        this.hideBossHealthBar(); // Hide boss health bar
        this.hideSmithCutscene();
        this.playSound('bossDefeat')
        const victoryMessage = document.getElementById('victoryMessage');
        if (victoryMessage) {
            victoryMessage.textContent = message;
            victoryMessage.classList.toggle('hidden', !message);
        }
        document.getElementById('victoryMenu').classList.remove('hidden');
    }

    async resolveSmithCutscene(spare) {
        if (!this.smithCutsceneActive || this.smithCutsceneResolved) return;

        this.smithCutsceneResolved = true;
        this.smithCutsceneChoice = spare ? 'spare' : 'refuse';

        const smith = this.smithCutsceneEnemy;
        if (smith) {
            this.removeEnemyFromArrays(smith);
            this.bosses = this.bosses.filter(boss => boss !== smith);
        } else {
            this.bosses = this.bosses.filter(boss => !boss.isFinalBoss);
        }

        this.hideSmithCutscene();

        const waveCompleteTime = Date.now() - this.waveStartTime;
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

        const victoryMessage = spare
            ? 'You spared Smith. He finally gets the chance to grow.'
            : 'You chose not to spare Smith. The final boss is gone.';

        this.victory(victoryMessage);
    }


    restart(startImmediately = false) {
        // Store current customization before creating new player
        const savedColor = this.player.color;
        const savedColorIndex = this.player.colorIndex;
        const savedBodyShapeIndex = this.player.bodyShapeIndex;
        const savedInnerShapeIndex = this.player.innerShapeIndex;
        const savedShapeIndex = this.player.shapeIndex;

        // Hide boss health bar
        this.hideBossHealthBar();

        // hasPaid = false;
        this.bullets = [];
        this.lineshots = [];
        this.enemies = [];
        this.shooters = [];
        this.tanks = [];
        this.sprinters = [];
        this.bosses = [];
        this.friendlySummons = [];
        this.particles = [];
        this.spellAnimations = [];
        this.spellZones = [];
        this.trackWalls = [];
        this.towerBuffs = [];
        this.placedTowers = [];
        this.selectedTower = null;
        this.selectedPlacedTower = null;
        this.storeOpen = false;
        this.exp = 0;
        this.level = 1;
        this.money = 9999999;
        this.expToNextLevel = 100;
        this.waveNumber = 1;
        this.waveRequirement = 300;
        this.showLevelUp = false;
        this.gamePaused = false;
        this.gamePausedReason = '';
        this.smithCutsceneActive = false;
        this.smithCutsceneResolved = false;
        this.smithCutsceneEnemy = null;
        this.smithCutsceneChoice = null;
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
        const victoryMenu = document.getElementById('victoryMenu');
        if (victoryMenu) {
            victoryMenu.classList.add('hidden');
        }
        const victoryMessage = document.getElementById('victoryMessage');
        if (victoryMessage) {
            victoryMessage.textContent = '';
            victoryMessage.classList.add('hidden');
        }
        this.hideSmithCutscene();

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
        this.renderSpellEffects(this.ctx);

        if (this.started && this.gameRunning) {
            this.updateGameUI();
            this.updateBossHealthBar(); // Add this line
        }

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
        this.tanks.forEach(tank => tank.render(this.ctx));
        this.sprinters.forEach(sprinter => sprinter.render(this.ctx));
        this.friendlySummons.forEach(summon => summon.render(this.ctx));

        // Render bosses (without walls)
        this.bosses.forEach(boss => boss.render(this.ctx));

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