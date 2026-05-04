// Tower classes
const TOWER_TYPES = {
    shooter: {
        name: 'Shooter',
        cost: 100,
        damage: 1,
        range: 100,
        fireRate: 1000,
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
        damage: 1,
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
        range: 999999999999,
        fireRate: 3000,
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
        cost: 1000,
        damage: 1,
        range: 25,
        fireRate: 1250,
        width: 30,
        height: 30,
        seeHidden: true,
        summonSpeed: 8500,
        summonCount: 2,
        color: '#795548',
        image: '/img/chickenJockey.png'
    },
    bomber: {
        name: 'Bomber',
        cost: 500,
        damage: 3,
        range: 65,
        fireRate: 2200,
        pierce: 0,
        projectileSpeed: 0.85,
        projectileCount: 1,
        seeHidden: false,
        damageReinforced: true,
        explosionArea: 25,
        color: '#f44336',
        width: 30,
        height: 30,
        image: '/img/bomb.png',
        projectileLife: 2
    },
    generator: {
        name: 'Shield Generator',
        cost: 1250,
        damage: 0,
        color: '#00BCD4',
        width: 30,
        height: 30,
        regenSpeed: 9500,
        regenAmount: 10,
        regenMax: 20,
        image: '/img/gen.png'
    },
    sentinel: {
        name: 'Sentinel',
        range: 130,
        damage: 1,
        fireRate: 250,
        pierce: 0,
        projectileSpeed: 1,
        projectileLife: 1,
        projectileCount: 3,
        spreadDegrees: 70,
        burstShotDelay: 110,
        seeHidden: false,
        damageReinforced: false,
        width: 30,
        height: 30,
        cost: 750,
        color: '#7c7c7cff',
        image: '/img/burst.png'
    },
    wizard: {
        name: 'Wizard',
        cost: 1000,
        damage: 2,
        range: 100,
        fireRate: 1250,
        spellCastRate: 7000,
        supportCastRate: 12000,
        spellLength: 2000,
        fireball: true,
        color: '#0004ff',
        projectileCount: 1,
        projectileSpeed: 1,
        width: 30,
        height: 30,
        image: '/img/shadowWizard.png'
    },
    silly: {
        name: 'Silly Billy',
        cost: 175,
        damage: 1,
        range: 85,
        fireRate: 1200,
        stunChance: 1,
        stunDuration: 2200,
        stunRadius: 0,
        poisonDamage: 0,
        poisonDuration: 0,
        poisonTickRate: 0,
        width: 30,
        height: 30,
        color: '#f7d36b',
        image: '/img/sillyBilly.png'
    },
    grohl: {
        name: 'Dave Grohl',
        cost: 1,
        damage: 0,
        range: 0,
        fireRate: 0,
        color: '#ffffffff',
        projectileCount: 1,
        projectileSpeed: 1,
        width: 30,
        height: 30,
        image: '/img/grohl.png'
    }, 
    oppenheimer: {
        name: 'Oppenheimer',
        cost: 1,
        damage: 12,
        range: 120,
        fireRate: 1500,
        projectileSpeed: 6,
        projectileCount: 0,
        color: '#4a4a4a',
        image: '/img/nuke.png',
        width: 40,
        height: 40,
        pierce: 1
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
                tower.stunChance = Math.min(1, (tower.stunChance || 0) + 0.05);
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
                tower.refractionSplitCount = 2;
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
                tower.railBeamMode = 'laser';
            }
        },
        {
            id: 'mikubeam',
            tier: 6,
            name: 'Miku Miku Beam',
            description: 'Miku Miku Beeeeeeaaammmm! Improves damage, attack speed, and gives infinite pierce/range.',
            cost: 10000,
            image: '/img/miku.png',
            apply: (tower) => {
                tower.damage += 10;
                scaleFireRate(tower, 0.7, 60);
                tower.pierce = Infinity;
                tower.range = Infinity;
                tower.seeHidden = true;
                tower.railBeamMode = 'miku';
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
            description: 'A more robust frame that can handle increased stress. Increases damage and bullet count',
            cost: 1200,
            image: '/img/megaman.png',
            apply: (tower) => {
                tower.damage += 1;
                tower.projectileCount += 2;
                tower.range += 8;
            }
        },
        {
            id: 'shortCircuit',
            tier: 4,
            name: 'Short Circuit',
            description: 'A short circuit in the firing mechanism causes enhanced range and damage, but reduces fire rate.',
            cost: 2450,
            image: '/img/megaman.png',
            apply: (tower) => {
                tower.damage += 1;
                tower.range += 8;
                scaleFireRate(tower, 0.8, 100);
            }
        },
        {
            id: 'overdrive',
            tier: 5,
            name: 'Overdrive',
            description: 'Time to take this puppy into overdrive. Increased damage and pierce, and a faster fire rate.',
            cost: 5500,
            image: '/img/megaman.png',
            apply: (tower) => {
                tower.damage += 3;
                addPierce(tower, 2);
                scaleFireRate(tower, 0.7, 100);
            }
        },
        {
            id: 'plankton',
            tier: 6,
            name: 'Maximum Overdrive',
            description: 'Im shifting into MAXIMUM OVERDRIVE! Increased fire rate, range, and projectile count.',
            cost: 10000,
            image: '/img/planktonOverdrive.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.6, 70);
                tower.range += 20;
                tower.projectileCount *= 2;
            }
        }
    ],
    gambler: [
        {
            id: 'luckyCharm',
            tier: 1,
            name: 'Lucky Charm',
            description: 'Roll for a random buff/upgrade each round. ',
            cost: 50,
            image: '/img/pokerTable.jpg',
            //Randomly apply upgrades
            apply: (tower) => {
                const rolls = [
                    () => { tower.damage += 2; },
                    () => { tower.damage += 4; scaleFireRate(tower, 1.15, 90); },
                    () => { tower.range += 25; },
                    () => { tower.range += 45; },
                    () => { scaleFireRate(tower, 0.75, 90); },
                    () => { scaleFireRate(tower, 0.6, 75); },
                    () => { addPierce(tower, 2); },
                    () => { addPierce(tower, 4); },
                    () => { tower.projectileCount += 1; },
                    () => {
                        tower.projectileCount += 1;
                        tower.range += 12;
                    },
                    () => {
                        tower.damage += 2;
                        addPierce(tower, 1);
                    },
                    () => {
                        tower.seeHidden = true;
                        tower.range += 10;
                    },
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
            description: 'Improved hacking skills for a stronger payout at round start.',
            cost: 1325,
            image: '/img/redditMod.png',
            apply: (tower) => {
                tower.hackRewardMultiplier = (tower.hackRewardMultiplier || 1) + 0.35;
            }
        },
        {
            id: 'hackerKnowledge',
            tier: 2,
            name: 'Hacker Knowledge',
            description: 'Enhanced abilities allow for deeper system access. Make some more money per hack.',
            cost: 4000,
            image: '/img/redditMod.png',
            apply: (tower) => {
                tower.hackRewardMultiplier = (tower.hackRewardMultiplier || 1) + 0.5;
            }
        },
        {
            id: 'malwareExpert',
            tier: 3,
            name: 'Malware Expert',
            description: 'Advanced malware allows deeper exploits and doubles each round-start payout.',
            cost: 15000,
            image: '/img/redditMod.png',
            apply: (tower) => {
                tower.hackRewardMultiplier = (tower.hackRewardMultiplier || 1) * 2;
            }
        },
        {
            id: 'systemOverride',
            tier: 4,
            name: 'System Override',
            description: 'Time to make the big bucks! Override controls to triple each round-start payout.',
            cost: 30000,
            image: '/img/redditMod.png',
            apply: (tower) => {
                tower.hackRewardMultiplier = (tower.hackRewardMultiplier || 1) * 3;
            }
        },
        {
            id: 'merkman',
            tier: 5,
            name: 'The Merkman',
            description: 'Wait, I know that guy! How did he get here? Merkert will periodically remove specail states from enemies',
            cost: 65000,
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
                tower.summonSpeed = Math.max(1200, Math.round((tower.summonSpeed || 2500) * 0.92));
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
                tower.summonDamageMultiplier = (tower.summonDamageMultiplier || 1) + 0.2;
                tower.summonMoveSpeedMultiplier = (tower.summonMoveSpeedMultiplier || 1) + 0.1;
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
                tower.summonCount = (tower.summonCount || 1) + 1;
                tower.summonMoveSpeedMultiplier = (tower.summonMoveSpeedMultiplier || 1) + 0.1;
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
                tower.summonCount = (tower.summonCount || 1) * 2;
                tower.summonSpeed = Math.round((tower.summonSpeed || 2500) * 1.5);
            }
        },
        {
            id: 'chickenJockey',
            tier: 6,
            name: 'Chicken Jockey',
            description: 'Chicken Jockeys! Peck your enemies eyes out. Increased spawn count and speed with less summon speed.',
            cost: 10000,
            image: '/img/chickenJockey.png',
            apply: (tower) => {
                tower.summonCount = (tower.summonCount || 1) + 1;
                tower.summonMoveSpeedMultiplier = (tower.summonMoveSpeedMultiplier || 1) + 0.2;
                tower.summonSpeed = Math.max(1200, Math.round((tower.summonSpeed || 2500) * 0.75));
            }
        }
    ],
    bomber: [
        {
            id: 'heavyPayload',
            tier: 1,
            name: 'Heavy Payload',
            description: 'Big boom hehe. Increased area and damage.',
            cost: 650,
            image: '/img/bomb.png',
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
            image: '/img/bomb.png',
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
            image: '/img/bomb.png',
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
            image: '/img/bomb.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.85, 80);
                addPierce(tower, 2);
                tower.projectileSpeed += 0.2;
            }
        },
        {
            id: 'Boomer',
            tier: 5,
            name: 'Cluster Bomb',
            description: 'This old guy showed up to help. Fire a wave of 5 rockets with increased damage.',
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
            cost: 20000,
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
                tower.regenSpeed = Math.max(1000, Math.round((tower.regenSpeed || 5000) * 0.75));
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
            description: 'An enhanced barrel that increases fire speed and better precision.',
            cost: 1000,
            image: '/img/burst.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.9, 70);
                tightenSpread(tower, 0.75);
                tower.range += 4;
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
                tower.range += 2;
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
                scaleFireRate(tower, 0.9, 55);;
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
                tower.range += 10;
            }
        }
    ],
    wizard: [
        {
            id: 'spellweaving',
            tier: 1,
            name: 'Storm Weaving',
            description: 'Cast faster and unlock Ice Storm, Earthquake, and Arcane Surge.',
            cost: 4000,
            image: '/img/shadowWizard.png',
            apply: (tower) => {
                scaleFireRate(tower, 0.85, 80);
                tower.spellCastRate = Math.max(1800, Math.round((tower.spellCastRate || 7000) * 0.8));
                tower.supportCastRate = Math.max(4000, Math.round((tower.supportCastRate || 12000) * 0.9));
                tower.arcaneSurge = true;
                tower.iceStorm = true;
                tower.earthquake = true;
            }
        },
        {
            id: 'untoldPower',
            tier: 2,
            name: 'Untold Power',
            description: 'Youve called upon magic from beyond your realm unlocking new spells and increasing spell duration and power.+',
            cost: 6000,
            image: '/img/magic.png',
            apply: (tower) => {
                tower.damage += 1;
                tower.spellCastRate = Math.max(1700, Math.round((tower.spellCastRate || 7000) * 0.9));
                tower.supportCastRate = Math.max(3600, Math.round((tower.supportCastRate || 12000) * 0.8));
                tower.spellLength = (tower.spellLength || 2000) + 1500;
                tower.fog = true;
                tower.doubleStrike = true;
            }
        }
    ],
    silly: [
        {
            id: 'stickySilly',
            tier: 1,
            name: 'Sticky Silly',
            description: 'Enemies get stuck for longer and nearby enemies get caught in the mess.',
            cost: 350,
            image: '/img/sillyBilly.png',
            apply: (tower) => {
                tower.stunDuration = Math.max(2800, (tower.stunDuration || 0) + 700);
                tower.stunRadius = Math.max(tower.stunRadius || 0, 24);
            }
        },
        {
            id: 'gooSplash',
            tier: 2,
            name: 'Goo Splash',
            description: 'The stuck effect splashes to a wider area around the main target.',
            cost: 700,
            image: '/img/sillyBilly.png',
            apply: (tower) => {
                tower.stunRadius = (tower.stunRadius || 0) + 18;
                tower.range += 10;
            }
        },
        {
            id: 'toxicTickle',
            tier: 3,
            name: 'Toxic Tickle',
            description: 'Adds poison damage over time to every enemy the silly tower sticks.',
            cost: 1400,
            image: '/img/sillyBilly.png',
            apply: (tower) => {
                tower.poisonDamage = (tower.poisonDamage || 0) + 1;
                tower.poisonDuration = Math.max(tower.poisonDuration || 0, 3500);
                tower.poisonTickRate = Math.max(250, (tower.poisonTickRate || 500) - 100);
            }
        },
        {
            id: 'hazmatHysteria',
            tier: 4,
            name: 'Hazmat Hysteria',
            description: 'More poison damage and a larger stuck radius with a faster firing rhythm.',
            cost: 2900,
            image: '/img/sillyBilly.png',
            apply: (tower) => {
                tower.poisonDamage = (tower.poisonDamage || 0) + 2;
                tower.poisonDuration = Math.max(tower.poisonDuration || 0, 5000);
                tower.stunRadius = (tower.stunRadius || 0) + 24;
                scaleFireRate(tower, 0.85, 120);
            }
        },
        {
            id: 'laughingGas',
            tier: 5,
            name: 'Laughing Gas',
            description: 'Enemies stay stuck longer, poison harder, and the radius expands even more.',
            cost: 5200,
            image: '/img/sillyBilly.png',
            apply: (tower) => {
                tower.stunDuration = Math.max(tower.stunDuration || 0, 4500);
                tower.stunRadius = (tower.stunRadius || 0) + 20;
                tower.poisonDamage = (tower.poisonDamage || 0) + 2;
                tower.poisonTickRate = Math.max(180, (tower.poisonTickRate || 500) - 80);
            }
        },
        {
            id: 'ultimateSilly',
            tier: 6,
            name: 'Ultimate Silly Billy',
            description: 'Big sticky radius, strong poison, and constant enemy lockdown.',
            cost: 10000,
            image: '/img/sillyBilly.png',
            apply: (tower) => {
                tower.damage += 2;
                tower.stunDuration = Math.max(tower.stunDuration || 0, 5200);
                tower.stunRadius = (tower.stunRadius || 0) + 28;
                tower.poisonDamage = (tower.poisonDamage || 0) + 3;
                tower.poisonDuration = Math.max(tower.poisonDuration || 0, 6500);
                tower.poisonTickRate = Math.max(140, (tower.poisonTickRate || 500) - 120);
                scaleFireRate(tower, 0.8, 90);
            }
        }
    ],
    grohl: [
        {
            id: 'sacrifice',
            tier: 1,
            name: 'ULTIMATE POWER',
            description: `Is it worth the cost?`,
            cost: 'Everything you have and more!',
            image: '/img/grohl.png',
            apply: (tower) => {
                tower.damage = 5;
                tower.range = 1000000000000000;
                tower.fireRate = 500;
                tower.projectileCount = Math.max(1000, tower.projectileCount * 1000);
                if (!tower.spreadRadians || tower.spreadRadians <= 0) {
                    tower.spreadRadians = Math.PI / 18;
                }
                tower.seeHidden = true;
                tower.damageReinforced = true;
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
        this.burstShotDelay = def.burstShotDelay || 120;
        this.burstShotsRemaining = 0;
        this.burstTotalShots = 0;

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
        this.stunDuration = def.stunDuration || 0;
        this.stunRadius = def.stunRadius || 0;
        this.poisonDamage = def.poisonDamage || 0;
        this.poisonDuration = def.poisonDuration || 0;
        this.poisonTickRate = def.poisonTickRate || 0;

        this.fireball = !!def.fireball;
        this.arcaneSurge = !!def.arcaneSurge;
        this.iceStorm = !!def.iceStorm;
        this.earthquake = !!def.earthquake;
        this.fog = !!def.fog;
        this.doubleStrike = !!def.doubleStrike;
        this.spellCastRate = def.spellCastRate || 0;
        this.supportCastRate = def.supportCastRate || 0;
        this.spellLength = def.spellLength || 2000;
        this.spellPower = def.spellPower || 1;

        this.level = 1;
        this.appliedUpgradeIds = [];
        this.currentUpgradeImage = def.image || null;
        this.totalSpent = Number.isFinite(def.cost) ? def.cost : 0;
        this.totalHackedMoney = 0;

        this.fireCooldown = 0;
        this.spellCooldown = this.spellCastRate;
        this.supportCooldown = this.supportCastRate;
        this.hackCooldown = this.hackInterval;
        this.regenCooldown = this.regenSpeed;
        this.summonCooldown = this.summonSpeed;
        this.target = null;
        this.showRange = false;
    }

    getAvailableUpgrades() {
        const options = TOWER_UPGRADES[this.type] || [];
        return options
            .filter(upgrade => {
                if (upgrade.id === 'luckyCharm') return true;
                return !this.appliedUpgradeIds.includes(upgrade.id);
            })
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
        if (upgrade.id !== 'luckyCharm') {
            this.appliedUpgradeIds.push(upgrade.id);
        }
        this.totalSpent += Number.isFinite(upgrade.cost) ? upgrade.cost : 0;
        this.appliedUpgradeIds.push(upgrade.id);

        // 🎸 Special handling for Grohl's "Everything you have and more" upgrade
        if (this.type === 'grohl' && upgrade.id === 'sacrifice') {
            // Don't add the string cost to totalSpent
            this.totalSpent += 0;
        } else {
            this.totalSpent += Number.isFinite(upgrade.cost) ? upgrade.cost : 0;
        }

        if (upgrade.image) {
            this.currentUpgradeImage = upgrade.image;
        }
        this.level += 1;

        if (this.type === 'gambler' && this.level >= 10) {
            this.currentUpgradeImage = '/img/gamblerUpgrade.png';
        }
        return upgrade;
    }


    getSellValue() {
        return Math.floor(this.totalSpent * 0.63);
    }

    isMaxUpgradeLevel() {
        return this.getAvailableUpgrades().length === 0;
    }

    getMaxLevelImagePath() {
        if (this.type === 'gambler' && this.level >= 10) {
            return '/img/gamblerUpgrade.png';
        }

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

        if (this.type === 'sentinel' && !this.target) {
            this.burstShotsRemaining = 0;
            this.burstTotalShots = 0;
        }
    }

    /**
     * Fire bullets toward/around the current target.
     * Single-shot towers aim directly; multi-shot towers (projectileCount > 1)
     * fire projectiles evenly spread in a full 360° burst.
     * @param {Array} bullets - shared game bullets array
     */
    shoot(bullets) {
        if (!this.target || this.fireCooldown > 0) return false;
        const isSentinelBurst = this.type === 'sentinel';
        if (!isSentinelBurst) {
            this.fireCooldown = this.fireRate * (this.attackSpeedMultiplier || 1);
        } else if (this.burstShotsRemaining <= 0) {
            this.burstShotsRemaining = Math.max(1, this.projectileCount || 1);
            this.burstTotalShots = this.burstShotsRemaining;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const tx = this.target.x + (this.target.width || 0) / 2;
        const ty = this.target.y + (this.target.height || 0) / 2;

        const dx = tx - cx;
        const dy = ty - cy;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return false;

        const baseAngle = Math.atan2(dy, dx);
        const count = isSentinelBurst ? 1 : this.projectileCount;
        const hasConeSpread = count > 1 && this.spreadRadians > 0 && this.spreadRadians < (Math.PI * 2);
        const angleStep = count > 1
            ? (hasConeSpread ? this.spreadRadians / Math.max(1, count - 1) : (Math.PI * 2) / count)
            : 0;
        const startAngle = hasConeSpread ? (baseAngle - this.spreadRadians / 2) : 0;
        let sentinelShotAngle = baseAngle;
        if (isSentinelBurst && this.burstTotalShots > 1 && this.spreadRadians > 0 && this.spreadRadians < (Math.PI * 2)) {
            const burstStep = this.spreadRadians / Math.max(1, this.burstTotalShots - 1);
            const burstStart = baseAngle - this.spreadRadians / 2;
            const burstIndex = this.burstTotalShots - this.burstShotsRemaining;
            sentinelShotAngle = burstStart + (burstStep * burstIndex);
        }

        for (let i = 0; i < count; i++) {
            const angle = isSentinelBurst
                ? sentinelShotAngle
                : (count > 1
                    ? (hasConeSpread ? (startAngle + i * angleStep) : (i * angleStep))
                    : baseAngle);

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
            bullet.stunDuration = this.stunDuration || 0;
            bullet.stunRadius = this.stunRadius || 0;
            bullet.poisonDamage = this.poisonDamage || 0;
            bullet.poisonDuration = this.poisonDuration || 0;
            bullet.poisonTickRate = this.poisonTickRate || 0;
            bullet.clusterOnExplosion = !!this.clusterOnExplosion;
            bullet.clusterCount = this.clusterCount || 0;

            if (this.projectileLife > 0) {
                bullet.lifeRemaining = this.projectileLife * 1000;
            }

            const isRailLaser = this.type === 'railgun' && (this.railBeamMode === 'laser' || this.railBeamMode === 'miku');
            if (isRailLaser) {
                const isMikuBeam = this.railBeamMode === 'miku';
                const beamThickness = isMikuBeam ? 18 : 6;
                const beamLength = isMikuBeam ? 0 : 120;
                const beamLife = isMikuBeam ? 650 : 260;

                bullet.isRailBeam = true;
                bullet.isMikuBeam = isMikuBeam;
                bullet.beamThickness = beamThickness;
                bullet.beamLength = beamLength;

                bullet.width = beamThickness;
                bullet.height = beamThickness;
                bullet.lifeRemaining = Math.max(bullet.lifeRemaining || 0, beamLife);

                bullet.render = function (ctx) {
                    const centerX = this.x + this.width / 2;
                    const centerY = this.y + this.height / 2;
                    const velocityLength = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
                    const dirX = this.vx / velocityLength;
                    const dirY = this.vy / velocityLength;

                    let tailX = centerX - dirX * beamLength;
                    let tailY = centerY - dirY * beamLength;
                    let headX = centerX;
                    let headY = centerY;

                    if (isMikuBeam) {
                        const source = this.sourceTower;
                        const startX = source ? (source.x + source.width / 2) : centerX;
                        const startY = source ? (source.y + source.height / 2) : centerY;
                        const fullScreenLength = Math.hypot(ctx.canvas.width, ctx.canvas.height) + 180;
                        tailX = startX;
                        tailY = startY;
                        headX = startX + dirX * fullScreenLength;
                        headY = startY + dirY * fullScreenLength;
                    }

                    ctx.save();
                    ctx.lineCap = 'round';

                    ctx.strokeStyle = isMikuBeam
                        ? 'rgba(0, 255, 255, 0.35)'
                        : 'rgba(33, 150, 243, 0.35)';
                    ctx.lineWidth = beamThickness * 1.9;
                    ctx.beginPath();
                    ctx.moveTo(tailX, tailY);
                    ctx.lineTo(headX, headY);
                    ctx.stroke();

                    ctx.strokeStyle = isMikuBeam ? '#7cf7ff' : '#a8d7ff';
                    ctx.lineWidth = beamThickness;
                    ctx.beginPath();
                    ctx.moveTo(tailX, tailY);
                    ctx.lineTo(headX, headY);
                    ctx.stroke();

                    ctx.restore();
                };
            } else if (this.type === 'kid') {
                bullet.width = 12;
                bullet.height = 12;
                bullet.render = function (ctx) {
                    const centerX = this.x + this.width / 2;
                    const centerY = this.y + this.height / 2;
                    const angle = Math.atan2(this.vy || 0, this.vx || 1);

                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(angle);

                    ctx.strokeStyle = '#f1e6c8';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-4, 0);
                    ctx.lineTo(7, 0);
                    ctx.stroke();

                    ctx.fillStyle = '#ff7aa2';
                    ctx.beginPath();
                    ctx.arc(-7, 0, 7, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(-8.5, -2.5, 2, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                };
            } else if (this.type === 'wizard' && this.fireball) {
                bullet.width = 9;
                bullet.height = 9;
                bullet.lifeRemaining = Math.max(bullet.lifeRemaining || 0, 900);
                bullet.render = function (ctx) {
                    const cx = this.x + this.width / 2;
                    const cy = this.y + this.height / 2;

                    ctx.save();
                    ctx.fillStyle = 'rgba(255, 126, 41, 0.35)';
                    ctx.beginPath();
                    ctx.arc(cx, cy, this.width * 0.9, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#ff6a00';
                    ctx.beginPath();
                    ctx.arc(cx, cy, this.width * 0.58, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#ffe082';
                    ctx.beginPath();
                    ctx.arc(cx + 1.5, cy - 1.5, this.width * 0.25, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                };
            } else if (this.type === 'bomber') {
                bullet.width = 12;
                bullet.height = 12;
                bullet.render = function(ctx) {
                    const centerX = this.x + this.width / 2;
                    const centerY = this.y + this.height / 2;

                    ctx.save();
                    ctx.fillStyle = '#2f2f2f';
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, this.width * 0.48, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#ffb74d';
                    ctx.beginPath();
                    ctx.arc(centerX + 2, centerY - 4, 2.2, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(centerX + 1, centerY - 6);
                    ctx.lineTo(centerX + 4, centerY - 10);
                    ctx.stroke();
                    ctx.restore();
                };
            }

            // Special handling for bomber projectiles
            if (this.type === 'bomber') {
                bullet.isBomb = true;
                bullet.explosionArea = this.explosionArea;
                // Override vertical velocity for arc trajectory
                bullet.vy = -this.projectileSpeed * 0.7; // Goes up initially
                bullet.gravity = 0.015; // Gravity effect for arc
                bullet.maxFallSpeed = this.projectileSpeed * 1.2;
            }

            if (!isRailLaser && this.type !== 'bomber') {
                bullet.render = function(ctx) {
                    ctx.fillStyle = this.towerColor || '#ffffff';
                    ctx.beginPath();
                    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                };
            }

            bullets.push(bullet);
        }

        if (isSentinelBurst) {
            this.burstShotsRemaining = Math.max(0, this.burstShotsRemaining - 1);
            const burstDelay = Math.max(40, this.burstShotDelay || 120);
            if (this.burstShotsRemaining > 0) {
                this.fireCooldown = burstDelay * (this.attackSpeedMultiplier || 1);
            } else {
                this.fireCooldown = this.fireRate * (this.attackSpeedMultiplier || 1);
                this.burstTotalShots = 0;
            }
        }

        return true;
    }

    render(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Range ring
        if (this.showRange && Number.isFinite(this.range) && this.range > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, this.range, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Maxed towers use their upgrade icon on-canvas.
        const shouldDrawIcon = this.isMaxUpgradeLevel() || (this.type === 'gambler' && this.level >= 10);
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

        if (this.type === 'grohl') {
            // Dave Grohl needs not a gun. Just his Guitar🎸
            ctx.save();

            // Calculate angle to target (or default angle if no target)
            let angle = 0;
            if (this.target) {
                const tx = this.target.x + (this.target.width || 0) / 2;
                const ty = this.target.y + (this.target.height || 0) / 2;
                angle = Math.atan2(ty - cy, tx - cx);
            }

            // Position guitar on the edge of the tower
            const guitarDistance = this.width / 2 + 10;
            const guitarX = cx + Math.cos(angle) * guitarDistance;
            const guitarY = cy + Math.sin(angle) * guitarDistance;

            // Rotate the guitar to point at the target
            ctx.translate(guitarX, guitarY);
            ctx.rotate(angle + Math.PI / 2);

            // Guitar body (semi-hollow style with curves)
            ctx.fillStyle = '#87CEEB'; // Light blue (Pelham Blue)
            ctx.strokeStyle = '#4682B4'; // Darker blue outline
            ctx.lineWidth = 1.5;

            // Main body shape (wider, more curved)
            ctx.beginPath();
            ctx.ellipse(0, 2, 8, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Body binding (thin white outline)
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.ellipse(0, 2, 7.5, 11.5, 0, 0, Math.PI * 2);
            ctx.stroke();

            // F-holes (characteristic semi-hollow feature)
            ctx.fillStyle = '#000000';
            ctx.lineWidth = 1;

            // Left f-hole
            ctx.beginPath();
            ctx.ellipse(-3, 0, 1.2, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-3, -2, 0.8, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-3, 4, 0.8, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Right f-hole
            ctx.beginPath();
            ctx.ellipse(3, 0, 1.2, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(3, -2, 0.8, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(3, 4, 0.8, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pickups (two humbuckers)
            ctx.fillStyle = '#2F2F2F'; // Dark gray
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.5;

            // Neck pickup
            ctx.fillRect(-3, -4, 6, 2);
            ctx.strokeRect(-3, -4, 6, 2);

            // Bridge pickup
            ctx.fillRect(-3, 6, 6, 2);
            ctx.strokeRect(-3, 6, 6, 2);

            // Pickup pole pieces (small silver dots)
            ctx.fillStyle = '#C0C0C0';
            for (let pickup = 0; pickup < 2; pickup++) {
                const pickupY = pickup === 0 ? -3 : 7;
                for (let pole = 0; pole < 6; pole++) {
                    const poleX = -2.5 + (pole * 1);
                    ctx.beginPath();
                    ctx.arc(poleX, pickupY, 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Control knobs (4 knobs)
            ctx.fillStyle = '#FFD700'; // Gold knobs
            ctx.strokeStyle = '#B8860B';
            ctx.lineWidth = 0.5;

            const knobPositions = [
                { x: -4, y: 9 }, { x: -1, y: 9 },
                { x: 2, y: 9 }, { x: 5, y: 9 }
            ];

            knobPositions.forEach(pos => {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Knob indicator line
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 0.3;
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y - 0.5);
                ctx.lineTo(pos.x, pos.y - 0.8);
                ctx.stroke();
                ctx.strokeStyle = '#B8860B';
                ctx.lineWidth = 0.5;
            });

            // Toggle switch
            ctx.fillStyle = '#2F2F2F';
            ctx.fillRect(6, 4, 1, 2);
            ctx.strokeStyle = '#000000';
            ctx.strokeRect(6, 4, 1, 2);

            // Bridge and tailpiece
            ctx.fillStyle = '#C0C0C0'; // Chrome/silver
            ctx.strokeStyle = '#808080';
            ctx.lineWidth = 0.5;

            // Tune-o-matic bridge
            ctx.fillRect(-4, 10, 8, 1);
            ctx.strokeRect(-4, 10, 8, 1);

            // Stop tailpiece
            ctx.fillRect(-3, 12, 6, 1);
            ctx.strokeRect(-3, 12, 6, 1);

            // Guitar neck
            ctx.fillStyle = '#8B4513'; // Mahogany neck
            ctx.fillRect(-2, -15, 4, 17);
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.strokeRect(-2, -15, 4, 17);

            // Fretboard (darker)
            ctx.fillStyle = '#2F1B14'; // Ebony/rosewood
            ctx.fillRect(-1.8, -15, 3.6, 17);

            // Block inlays (pearl/white blocks)
            ctx.fillStyle = '#FFFAF0'; // Pearl white
            const inlayPositions = [-12, -8, -4];
            inlayPositions.forEach(y => {
                ctx.fillRect(-1.2, y - 0.5, 2.4, 1);
            });

            // Guitar strings
            ctx.strokeStyle = '#C0C0C0';
            ctx.lineWidth = 0.3;
            for (let i = 0; i < 6; i++) {
                const stringX = -1.5 + (i * 0.6);
                ctx.beginPath();
                ctx.moveTo(stringX, -15);
                ctx.lineTo(stringX, 13);
                ctx.stroke();
            }

            // Black headstock
            ctx.fillStyle = '#1C1C1C'; // Black headstock
            ctx.fillRect(-2.5, -18, 5, 4);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(-2.5, -18, 5, 4);

            // Epiphone logo (simplified white text)
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '3px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('E', 0, -15.5);

            // Tuning pegs (chrome)
            ctx.fillStyle = '#C0C0C0';
            for (let i = 0; i < 3; i++) {
                // Left side pegs
                ctx.beginPath();
                ctx.arc(-2, -17 + (i * 1.2), 0.5, 0, Math.PI * 2);
                ctx.fill();

                // Right side pegs
                ctx.beginPath();
                ctx.arc(2, -17 + (i * 1.2), 0.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Add rock energy effect when targeting
            // if (this.target) {
            //     ctx.strokeStyle = 'rgba(135, 206, 235, 0.8)'; // Blue energy to match guitar
            //     ctx.lineWidth = 2;
            //     ctx.beginPath();
            //     ctx.arc(0, 0, 14, 0, Math.PI * 2);
            //     ctx.stroke();

            //     // Electric sparks
            //     for (let i = 0; i < 8; i++) {
            //         const sparkAngle = (i * Math.PI * 2) / 8;
            //         ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // White electric sparks
            //         ctx.lineWidth = 1;
            //         ctx.beginPath();
            //         ctx.moveTo(Math.cos(sparkAngle) * 10, Math.sin(sparkAngle) * 10);
            //         ctx.lineTo(Math.cos(sparkAngle) * 16, Math.sin(sparkAngle) * 16);
            //         ctx.stroke();
            //     }
            // }

            ctx.restore();
        } else if (this.target) {
            // Normal barrel rendering for other towers...
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
