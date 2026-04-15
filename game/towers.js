// Tower classes

const TOWER_TYPES = {
    shooter: {
        name: 'Shooter',
        cost: 100,
        damage: 1,
        range: 100,
        fireRate: 1200,  
        color: '#4CAF50',
        projectileCount: 1,
        projectileSpeed: 1,
        width: 30,
        height: 30,
        image: '/img/scout.png'
    },
    blaster: {
        name: 'Blaster',
        cost: 250,
        damage: 2,
        range: 50,
        fireRate: 1250,
        color: '#FF9800',
        projectileCount: 6,
        projectileSpeed: 0.5,
        spreadDegrees: 360,
        width: 34,
        height: 34,
        image: '/img/megaman.png'
    },
    railgun: {
        name: 'Railgun',
        cost: 300,
        damage: 5,
        range: 1000,
        fireRate: 3500,
        color: '#2196F3',
        projectileCount: 1, 
        projectileSpeed: 0.8,
        width: 30,
        height: 30,
        image: '/img/miku.png'
    },
    hacker: {
        name: 'Hacker',
        cost: 850,
        damage: 0,
        color: '#9C27B0',
        width: 30,
        height: 30,
        image: '/img/redditMod.png'
    },
    gambler: {
        name: 'Gambler',
        cost: 600,
        damage: 1,
        range: 100,
        fireRate: 1500,
        color: '#E91E63',
        projectileCount: 1,
        projectileSpeed: 1,
        width: 30,
        height: 30,
        image: '/img/pokerTable.jpg'
    },
    overlord: {
        name: 'Overlord',
        cost: 650,
        damage: 1,
        range: 25,
        fireRate: 1250,
        width: 30,
        height: 30,
        seeHidden: true,
        summonSpeed: 2500,
        summonCount: 3,
        color: '#795548',
        image: '/img/chickenJockey.png'
    },
    boomer: {
        name: 'Boomer',
        cost: 500,
        damage: 3,
        range: 65,
        fireRate: 1500,
        pierce: 0,
        projectileSpeed: 0.85,
        projectileCount: 1,
        seeHidden: false,
        damageReinforced: true,
        explosionArea: 25,
        color: '#f44336',
        width: 30,
        height: 30,
        image: '/img/boomer.png'
    },
    generator: {
        name: 'Shield Generator',
        cost: 50,
        damage: 0,
        color: '#00BCD4',
        width: 30,
        height: 30,
        regenSpeed : 5000,
        regenAmount : 15,
        regenMax: 30,
        image: '/img/gen.png'
    },
    sentinel: {
        name: 'Sentinel',
        range: 25,
        damage: 1,
        fireRate: 500,
        pierce: 0,
        projectileSpeed: 1,
        projectileLife: 1,
        projectileCount: 3,
        spreadDegrees: 70,
        seeHidden: false,
        damageReinforced: false,
        width: 40,
        height: 30,
        cost: 500,
        color: '#7c7c7cff',
        image: '/img/burst.png'
    }
};

function scaleFireRate(tower, factor, min = 60) {
    tower.fireRate = Math.max(min, Math.round((tower.fireRate || min) * factor));
}

function addPierce(tower, amount) {
    tower.pierce = Math.max(0, (tower.pierce || 0) + amount);
}

function tightenSpread(tower, factor) {
    if (!tower.spreadRadians || tower.spreadRadians <= 0) return;
    tower.spreadRadians = Math.max(Math.PI / 24, tower.spreadRadians * factor);
}

const TOWER_UPGRADES = {
    shooter: [
        {
            id: 'scout',
            tier: 1,
            name: 'Scout',
            description: 'Attack Faster over a longer range',
            cost: 325,
            image: '/img/scout.png',
            apply: (tower) => {
                tower.fireRate = Math.max(120, Math.round(tower.fireRate * 0.9));
                tower.range += 5;
            }
        },
        {
            id: 'betterBullets',
            tier: 2,
            name: 'Better Bullets',
            description: 'Higher caliber bullets with increased damage and puncture',
            cost: 650,
            image: '/img/scout.png',
            apply: (tower) => {
                tower.damage += 1;
                addPierce(tower, 1);
            }
        },
        {
            id: 'goodGoggles',
            tier: 3,
            name: 'Good Goggles',
            description: 'Improved vision allows you to see farther and through stealth',
            cost: 1200,
            image: '/img/scout.png',
            apply: (tower) => {
                tower.range += 25;
                tower.seeHidden = true;
            }
        },
        {
            id: 'twinFire',
            tier: 4,
            name: 'Twin Fire',
            description: 'Double the gun, double the bullets, and double the fun.',
            cost: 2450,
            image: '/img/scout.png',
            apply: (tower) => {
                tower.projectileCount = Math.max(2, tower.projectileCount * 2);
                if (!tower.spreadRadians || tower.spreadRadians <= 0) {
                    tower.spreadRadians = Math.PI / 18;
                }
            }
        },
        {
            id: 'rapidFire',
            tier: 5,
            name: 'Rapid Fire',
            description: 'Took a few gun saftey courses, more damage, more peirce, and much faster fire rate.',
            cost: 5500,
            image: '/img/scout.png',
            apply: (tower) => {
                tower.damage += 2;
                addPierce(tower, 2);
                scaleFireRate(tower, 0.7, 80);
            }
        },
        {
            id: 'tf2scout',
            tier: 6,
            name: 'TF2 Scout',
            description: 'THINK FAST CHUCKLENUTS! An aggressive and snarky fighter with even higher damage and fire rate. Chance to stun enemies on hit.',
            cost: 10000,
            image: '/img/scout.png',
            apply: (tower) => {
                tower.damage += 3;
                tower.range += 20;
                scaleFireRate(tower, 0.6, 70);
                tower.stunChance = Math.min(1, (tower.stunChance || 0) + 0.15);
            }
        }
    ],
    railgun: [
        {
            id: 'betterCooling',
            tier: 1,
            name: 'Better Cooling',
            description: 'Improved cooling system allowing for slightlyfaster firing.',
            cost: 325,
            image: '/img/miku.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.9, 120);
            }
        },
        {
            id: 'highCaliber',
            tier: 2,
            name: 'High Caliber',
            description: 'Higher caliber bullets with the ability to rip through armor and deal increased damage and puncture',
            cost: 650,
            image: '/img/miku.png',
            apply: (tower) => {
                tower.damage += 3;
                addPierce(tower, 2);
                tower.damageReinforced = true;
            }
        },
        {
            id: 'overclocked',
            tier: 3,
            name: 'Overclocked',
            description: 'Improved firing mechanism allowing for more damage but slowing down the fire rate.',
            cost: 1200,
            image: '/img/miku.png',
            apply: (tower) => {
                tower.damage += 4;
                scaleFireRate(tower, 1.15, 120);
            }
        },
        {
            id: 'refraction',
            tier: 4,
            name: 'Refraction',
            description: 'Advanced refractive lens technology that refracts into a multitude of smaller blasts.',
            cost: 2450,
            image: '/img/miku.png',
            apply: (tower) => {
                tower.projectileCount += 2;
            }
        },
        {
            id: 'ultimatelazer',
            tier: 5,
            name: 'Ultimate Lazer',
            description: 'The ultimate laser weapon with an unstopable beam giving increased damage, puncture, but slowing fire rate.',
            cost: 5500,
            image: '/img/miku.png',
            apply: (tower) => {
                tower.damage += 8;
                addPierce(tower, 5);
                scaleFireRate(tower, 1.2, 120);
            }
        },
        {
            id: 'mikubeam',
            tier: 6,
            name: 'Miku Miku Beam',
            description: 'Miku Miku Beeeeeeaaammmm! Improves damage, attack speed, and gives infinite pierce/range.',
            cost: 50,
            image: '/img/miku.png',
            apply: (tower) => {
                tower.damage += 10;
                scaleFireRate(tower, 0.7, 60);
                tower.pierce = Infinity;
                tower.range = Infinity;
                tower.seeHidden = true;
            }
        }
    ],
    blaster: [
        {
            id: 'fastFiring',
            tier: 1,
            name: 'Fast Firing',
            description: 'Improved firing mechanism allowing for faster firing.',
            cost: 325,
            image: '/img/megaman.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.85, 100);
            }
        },
        {
            id: 'strongshells',
            tier: 2,
            name: 'Strong Shells',
            description: 'Enhanced shells that deal more damage and hit more enemies.',
            cost: 650,
            image: '/img/megaman.png',
            apply: (tower) => {
                tower.damage += 1;
                addPierce(tower, 1);
            }
        },
        {
            id: 'sturdyFrame',
            tier: 3,
            name: 'Sturdy Frame',
            description: 'A more robust frame that can handle increased stress. Increases damage and lifespan',
            cost: 1200,
            image: '/img/megaman.png',
            apply: (tower) => {
                tower.damage += 1;
                tower.projectileLife = (tower.projectileLife || 1) + 1;
                tower.range += 8;
            }
        },
        {
            id: 'doubleBarrel',
            tier: 4,
            name: 'Double Barrel',
            description: 'Two barrels, doubling the number of projectiles.',
            cost: 2450,
            image: '/img/megaman.png',
            apply: (tower) => {
                tower.projectileCount *= 2;
            }
        },
        {
            id: 'overdrive',
            tier: 5,
            name: 'Overdrive',
            description: 'Time to take this puppy into overdrive. Increased damage and pierce, but slower fire rate.',
            cost: 5500,
            image: '/img/megaman.png',
            apply: (tower) => {
                tower.damage += 3;
                addPierce(tower, 2);
                scaleFireRate(tower, 1.15, 100);
            }
        },
        {
            id: 'plankton',
            tier: 6,
            name: 'Maximum Overdrive',
            description: 'Im shifting into MAXIMUM OVERDRIVE! Increased fire rate and range.',
            cost: 10000,
            image: '/img/planktonOverdrive.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.6, 70);
                tower.range += 20;
            }
        }
    ],
    gambler: [
        {
            id: 'luckyCharm',
            tier: 1,
            name: 'Lucky Charm',
            description: 'A lucky charm that allows you to try your luck and get a different tower/upgrade.',
            cost: 50,
            image: '/img/pokerTable.jpg',
            apply: (tower) => {
                const rolls = [
                    () => { tower.damage += 2; },
                    () => { tower.range += 25; },
                    () => { scaleFireRate(tower, 0.75, 90); },
                    () => { addPierce(tower, 2); },
                    () => { tower.projectileCount += 1; },
                ];
                const index = Math.floor(Math.random() * rolls.length);
                rolls[index]();
            }
        }
    ],
    hacker: [
        {
            id: 'swiftSkills',
            tier: 1,
            name: 'Swift Skills',
            description: 'Improved hacking skills allowing for faster hacking.',
            cost: 1325,
            image: '/img/redditMod.png',
            apply: (tower) => {
                tower.hackInterval = Math.max(250, Math.round((tower.hackInterval || 2500) * 0.8));
            }
        },
        {
            id: 'hackerKnowledge',
            tier: 2,
            name: 'Hacker Knowledge',
            description: 'Enhanced abilities allow for deeper system access. Make some more money per hack.',
            cost: 3975,
            image: '/img/redditMod.png',
            apply: (tower) => {
                tower.hackRewardMultiplier = (tower.hackRewardMultiplier || 1) + 0.5;
            }
        },
        {
            id: 'malwareExpert',
            tier: 3,
            name: 'Malware Expert',
            description: 'Advanced malware  allow for more sophisticated attacks and double the payout per hack.',
            cost: 15000,
            image: '/img/redditMod.png',
            apply: (tower) => {
                tower.hackInterval = Math.max(200, Math.round((tower.hackInterval || 2500) * 0.85));
                tower.hackRewardMultiplier = (tower.hackRewardMultiplier || 1) * 2;
            }
        },
        {
            id: 'systemOverride',
            tier: 4,
            name: 'System Override',
            description: 'Time to make the big bucks! Override system controls to generate more money and triple the amount per hack.',
            cost: 63500,
            image: '/img/redditMod.png',
            apply: (tower) => {
                tower.hackInterval = Math.max(160, Math.round((tower.hackInterval || 2500) * 0.8));
                tower.hackRewardMultiplier = (tower.hackRewardMultiplier || 1) * 3;
            }
        },
        {
            id: 'merkman',
            tier: 5,
            name: 'The Merkman',
            description: 'Wait, I know that guy! How did he get here? Merkert will periodically remove specail states from enemies',
            cost: 50,
            image: '/img/merkman.png',
            apply: (tower) => {
                tower.statusCleanseChance = Math.min(1, (tower.statusCleanseChance || 0) + 0.2);
                tower.statusCleanseRadius = (tower.statusCleanseRadius || 60) + 20;
            }
        }
    ],
    overlord: [
        {
            id: 'swiftSummon',
            tier: 1,
            name: 'Swift Summon',
            description: 'Summons enemies more quickly and in greater numbers.',
            cost: 850,
            image: '/img/chickenJockey.png',
            apply: (tower) => {
                tower.summonSpeed = Math.max(250, Math.round((tower.summonSpeed || 2500) * 0.8));
                tower.summonCount = (tower.summonCount || 1) + 1;
            }
        },
        {
            id: 'strongSummons',
            tier: 2,
            name: 'Strong Summons',
            description: 'Summoned enemies are move with haste and are more powerful.',
            cost: 1900,
            image: '/img/chickenJockey.png',
            apply: (tower) => {
                tower.summonDamageMultiplier = (tower.summonDamageMultiplier || 1) + 0.5;
                tower.summonMoveSpeedMultiplier = (tower.summonMoveSpeedMultiplier || 1) + 0.25;
            }
        },
        {
            id: 'greaterSummons',
            tier: 3,
            name: 'Greater Summons',
            description: 'Summon enemis in even greater numbers and some have increased speed.',
            cost: 3500,
            image: '/img/chickenJockey.png',
            apply: (tower) => {
                tower.summonCount = (tower.summonCount || 1) + 2;
                tower.summonMoveSpeedMultiplier = (tower.summonMoveSpeedMultiplier || 1) + 0.15;
            }
        },
        {
            id: 'bigbad',
            tier: 4,
            name: 'Big Bad fella',
            description: 'Summons a boss among your minions.',
            cost: 3500,
            image: '/img/chickenJockey.png',
            apply: (tower) => {
                tower.summonBossChance = Math.min(1, (tower.summonBossChance || 0) + 0.15);
            }
        },
        {
            id: 'hordeArmy',
            tier: 5,
            name: 'Horde Army',
            description: 'Summons a horde of enemies to overwhelm your foes. Spawn count is doubled but less frequent.',
            cost: 7500,
            image: '/img/chickenJockey.png',
            apply: (tower) => {
                tower.summonCount = Math.max(1, (tower.summonCount || 1) * 2);
                tower.summonSpeed = Math.round((tower.summonSpeed || 2500) * 1.2);
            }
        },
        {
            id: 'chickenJockey',
            tier: 6,
            name: 'Chicken Jockey',
            description: 'Chicken Jockeys! Peck your enemies eyes out. Increased spawn count and speed with less summon speed.',
            cost: 50,
            image: '/img/chickenJockey.png',
            apply: (tower) => {
                tower.summonCount = (tower.summonCount || 1) + 3;
                tower.summonMoveSpeedMultiplier = (tower.summonMoveSpeedMultiplier || 1) + 0.4;
                tower.summonSpeed = Math.max(200, Math.round((tower.summonSpeed || 2500) * 0.75));
            }
        }
    ],
    boomer: [
        {
            id: 'heavyPayload',
            tier: 1,
            name: 'Heavy Payload',
            description: 'Big boom hehe. Increased area and damage.',
            cost: 650,
            image: '/img/boomer.png',
            apply: (tower) => {
                tower.damage += 2;
                tower.explosionArea = (tower.explosionArea || 0) + 15;
            }
        },
        {
            id: 'laserGuidance',
            tier: 2,
            name: 'Laser Guidance',
            description: 'A laser guidance system that allows for more accurate range.',
            cost: 1500,
            image: '/img/boomer.png',
            apply: (tower) => {
                tower.range += 20;
                tower.projectileSpeed += 0.2;
            }
        },
        {
            id: 'fastReload',
            tier: 3,
            name: 'Fast Reload',
            description: 'Reloads quicker for more destruction faster.',
            cost: 4000,
            image: '/img/boomer.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.8, 90);
            }
        },
        {
            id: 'aerodynamicShells',
            tier: 4,
            name: 'Aerodynamic Shells',
            description: 'Improved aerodynamics for faster firing and piercing.',
            cost: 9800,
            image: '/img/boomer.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.85, 80);
                addPierce(tower, 2);
                tower.projectileSpeed += 0.2;
            }
        },
        {
            id: 'clusterBomb',
            tier: 5,
            name: 'Cluster Bomb',
            description: 'Fire a wave of 5 rockets with increased damage.',
            cost: 12000,
            image: '/img/boomer.png',
            apply: (tower) => {
                tower.projectileCount = Math.max(tower.projectileCount, 5);
                tower.damage += 3;
            }
        },
        {
            id: 'cluster',
            tier: 6,
            name: 'Cluster F***',
            description: 'Youre gonna want to get in a vault for this one! Whenever a bomb explodes release a ring of smaller bombs around the area. ',
            cost: 50,
            image: '/img/vaultboy.png',
            apply: (tower) => {
                tower.clusterOnExplosion = true;
                tower.clusterCount = (tower.clusterCount || 0) + 8;
                tower.damage += 2;
                tower.explosionArea = (tower.explosionArea || 0) + 10;
            }
        }
    ],
    generator: [
        {
            id: 'swiftGeneration',
            tier: 1,
            name: 'Swift Generation',
            description: 'You equiped gen rush perks and now gens activate twice as often.',
            cost: 1300,
            image: '/img/gen.png',
            apply: (tower) => {
                tower.regenSpeed = Math.max(250, Math.round((tower.regenSpeed || 5000) * 0.5));
            }
        },
        {
            id: 'improvedAlloy',
            tier: 2,
            name: 'Improved Alloy',
            description: 'A stronger alloy and circuits that allows it to generate better shields and have more max shield capacity.',
            cost: 2600,
            image: '/img/gen.png',
            apply: (tower) => {
                tower.regenAmount = (tower.regenAmount || 0) + 15;
                tower.regenMax = (tower.regenMax || 0) + 30;
            }
        }
    ],
    sentinel: [
        {
            id: 'enhancedBarrel',
            tier: 1,
            name: 'Enhanced Barrel',
            description: 'An enhanced barrel that increases fire speed and less spread.',
            cost: 1000,
            image: '/img/burst.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.9, 70);
                tightenSpread(tower, 0.75);
            }
        },
        {
            id: 'reinforcedPlating',
            tier: 2,
            name: 'Reinforced Plating',
            description: 'Could always use more protection. pierce and damage increase.',
            cost: 1500,
            image: '/img/burst.png',
            apply: (tower) => {
                addPierce(tower, 1);
                tower.damage += 1;
            }
        },
        {
            id: 'apRounds',
            tier: 3,
            name: 'AP Rounds',
            description: 'Armor-piercing rounds that deal increased damage to heavily armored targets.',
            cost: 2000,
            image: '/img/burst.png',
            apply: (tower) => {
                tower.damageReinforced = true;
                addPierce(tower, 1);
                tower.damage += 2;
            }
        },
        {
            id: 'hypersonicCore',
            tier: 4,
            name: 'Hypersonic Core',
            description: 'A hypersonic core that increases fire rate and less spread.',
            cost: 2500,
            image: '/img/burst.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.75, 60);
                tightenSpread(tower, 0.75);
            }
        },
        {
            id: 'doubleTap',
            tier: 5,
            name: 'Double Tap',
            description: 'Fires two more bullets in the burst with faster fire rate.',
            cost: 5000,
            image: '/img/burst.png',
            apply: (tower) => {
                tower.projectileCount += 2;
                scaleFireRate(tower, 0.9, 55);
            }
        },
        {
            id: 'fortnite',
            tier: 6,
            name: 'Gun from Fortnite',
            description: 'Hey thats that one thing from that one game. Less spread, one more bullet in burst, faster fire rate.',
            cost: 10000,
            image: '/img/burst.png',
            apply: (tower) => {
                tower.projectileCount += 1;
                scaleFireRate(tower, 0.75, 50);
                tightenSpread(tower, 0.7);
            }
        }
    ]
};

const TOWER_IMAGE_CACHE = {};

function getTowerImage(src) {
    if (!src) return null;
    if (TOWER_IMAGE_CACHE[src]) return TOWER_IMAGE_CACHE[src];

    const img = new Image();
    img.src = src;
    TOWER_IMAGE_CACHE[src] = img;
    return img;
}

class Tower {
    constructor(x, y, type) {
        const def = TOWER_TYPES[type];
        if (!def) throw new Error(`Unknown tower type: ${type}`);

        // Center the tower on the placement point
        this.x = x - def.width / 2;
        this.y = y - def.height / 2;
        this.type = type;
        this.name = def.name;
        this.cost = def.cost;
        this.damage = def.damage;
        this.range = def.range;
        this.fireRate = def.fireRate;
        this.color = def.color;
        this.projectileSpeed = def.projectileSpeed;
        this.width = def.width;
        this.height = def.height;
        this.projectileCount = def.projectileCount || 1;
        this.pierce = def.pierce || 1;
        this.seeHidden = !!def.seeHidden;
        this.spreadRadians = typeof def.spreadDegrees === 'number'
            ? (def.spreadDegrees * Math.PI) / 180
            : (def.spreadRadians || 0);

        this.projectileLife = def.projectileLife || 0;
        this.damageReinforced = !!def.damageReinforced;
        this.explosionArea = def.explosionArea || 0;
        this.clusterOnExplosion = !!def.clusterOnExplosion;
        this.clusterCount = def.clusterCount || 0;

        this.regenSpeed = def.regenSpeed || 0;
        this.regenAmount = def.regenAmount || 0;
        this.regenMax = def.regenMax || 0;

        this.hackInterval = def.hackInterval || 2500;
        this.hackRewardMultiplier = def.hackRewardMultiplier || 1;
        this.statusCleanseChance = def.statusCleanseChance || 0;
        this.statusCleanseRadius = def.statusCleanseRadius || 60;

        this.summonSpeed = def.summonSpeed || 0;
        this.summonCount = def.summonCount || 1;
        this.summonDamageMultiplier = def.summonDamageMultiplier || 1;
        this.summonMoveSpeedMultiplier = def.summonMoveSpeedMultiplier || 1;
        this.summonBossChance = def.summonBossChance || 0;

        this.stunChance = def.stunChance || 0;

        this.level = 1;
        this.appliedUpgradeIds = [];
        this.currentUpgradeImage = def.image || null;

        this.fireCooldown = 0;
        this.hackCooldown = this.hackInterval;
        this.regenCooldown = this.regenSpeed;
        this.summonCooldown = this.summonSpeed;
        this.target = null;
        this.showRange = false;
    }

    getAvailableUpgrades() {
        const options = TOWER_UPGRADES[this.type] || [];
        return options
            .filter(upgrade => !this.appliedUpgradeIds.includes(upgrade.id))
            .sort((a, b) => a.tier - b.tier);
    }

    canAffordNextUpgrade(money) {
        const [nextUpgrade] = this.getAvailableUpgrades();
        if (!nextUpgrade) return false;
        return money >= nextUpgrade.cost;
    }

    applyUpgrade(upgradeId) {
        const availableUpgrades = this.getAvailableUpgrades();
        const upgrade = availableUpgrades.find(item => item.id === upgradeId);
        if (!upgrade) return null;

        upgrade.apply(this);
        this.appliedUpgradeIds.push(upgrade.id);
        if (upgrade.image) {
            this.currentUpgradeImage = upgrade.image;
        }
        this.level += 1;
        return upgrade;
    }

    isMaxUpgradeLevel() {
        return this.getAvailableUpgrades().length === 0;
    }

    getMaxLevelImagePath() {
        if (this.currentUpgradeImage) return this.currentUpgradeImage;

        const upgrades = TOWER_UPGRADES[this.type] || [];
        if (!upgrades.length) return null;

        const highestTierUpgrade = upgrades.reduce((best, current) => {
            if (!best || current.tier > best.tier) return current;
            return best;
        }, null);

        return (highestTierUpgrade && highestTierUpgrade.image) || null;
    }

    /**
     * Update tower state: cool down fire and acquire nearest enemy in range.
     * @param {number} deltaTime
     * @param {Array} enemies 
     */
    update(deltaTime, enemies) {
        this.fireCooldown = Math.max(0, this.fireCooldown - deltaTime);

        // Find the closest enemy within range
        this.target = null;
        let closestDist = this.range;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        enemies.forEach(enemy => {
            if (!enemy || enemy.hp <= 0) return;
            if (enemy.hidden && !this.seeHidden) return;
            const dx = (enemy.x + (enemy.width || 0) / 2) - cx;
            const dy = (enemy.y + (enemy.height || 0) / 2) - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= this.range && dist < closestDist) {
                closestDist = dist;
                this.target = enemy;
            }
        });
    }

    /**
     * Fire bullets toward/around the current target.
     * Single-shot towers aim directly; multi-shot towers (projectileCount > 1)
     * fire projectiles evenly spread in a full 360° burst.
     * @param {Array} bullets - shared game bullets array
     */
    shoot(bullets) {
        if (!this.target || this.fireCooldown > 0) return;
        this.fireCooldown = this.fireRate;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const tx = this.target.x + (this.target.width || 0) / 2;
        const ty = this.target.y + (this.target.height || 0) / 2;

        const dx = tx - cx;
        const dy = ty - cy;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;

        const baseAngle = Math.atan2(dy, dx);
        const count = this.projectileCount;
        const hasConeSpread = count > 1 && this.spreadRadians > 0 && this.spreadRadians < (Math.PI * 2);
        const angleStep = count > 1
            ? (hasConeSpread ? this.spreadRadians / Math.max(1, count - 1) : (Math.PI * 2) / count)
            : 0;
        const startAngle = hasConeSpread ? (baseAngle - this.spreadRadians / 2) : 0;

        for (let i = 0; i < count; i++) {
            const angle = count > 1
                ? (hasConeSpread ? (startAngle + i * angleStep) : (i * angleStep))
                : baseAngle;

            const bullet = new Bullet(cx, cy, true);
            bullet.width = 6;
            bullet.height = 6;
            bullet.vx = Math.cos(angle) * this.projectileSpeed;
            bullet.vy = Math.sin(angle) * this.projectileSpeed;
            bullet.damage = this.damage;
            bullet.pierce = this.pierce || 1;
            bullet.towerColor = this.color;
            bullet.fromTower = true;
            bullet.sourceTower = this;
            bullet.damageReinforced = !!this.damageReinforced;
            bullet.stunChance = this.stunChance || 0;
            bullet.clusterOnExplosion = !!this.clusterOnExplosion;
            bullet.clusterCount = this.clusterCount || 0;

            if (this.projectileLife > 0) {
                bullet.lifeRemaining = this.projectileLife * 1000;
            }

            bullet.render = function(ctx) {
                ctx.fillStyle = this.towerColor || '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
            };

            bullets.push(bullet);
        }
    }

    render(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Range ring
        if (this.showRange) {
            ctx.beginPath();
            ctx.arc(cx, cy, this.range, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Maxed towers use their upgrade icon on-canvas.
        const shouldDrawIcon = this.isMaxUpgradeLevel();
        const iconPath = shouldDrawIcon ? this.getMaxLevelImagePath() : null;
        const iconImage = iconPath ? getTowerImage(iconPath) : null;
        const canDrawIcon = !!(iconImage && iconImage.complete && iconImage.naturalWidth > 0);

        if (canDrawIcon) {
            ctx.drawImage(iconImage, this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }

        // Barrel pointing toward current target
        if (this.target) {
            const tx = this.target.x + (this.target.width || 0) / 2;
            const ty = this.target.y + (this.target.height || 0) / 2;
            const angle = Math.atan2(ty - cy, tx - cx);
            const barrelLen = this.width / 2 + 6;

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * barrelLen, cy + Math.sin(angle) * barrelLen);
            ctx.stroke();
        }
    }
}
