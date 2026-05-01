// Wave Management System
class WaveManager {
    constructor() {
        this.maxWave = 41;
        this.waves = {};

        for (let wave = 1; wave <= this.maxWave; wave++) {
            this.waves[wave] = this.buildWave(wave);
        }
    }

    composeWave(counts) {
        const roster = [
            [Smith, counts.smith || 0],
            [Boss3, counts.boss3 || 0],
            [Boss2, counts.boss2 || 0],
            [Boss1, counts.boss1 || 0],
            [Tank3, counts.tank3 || 0],
            [Tank2, counts.tank2 || 0],
            [Tank1, counts.tank1 || 0],
            [Sprinter3, counts.sprinter3 || 0],
            [Sprinter2, counts.sprinter2 || 0],
            [Sprinter1, counts.sprinter1 || 0],
            [Enemy3, counts.enemy3 || 0],
            [Enemy2, counts.enemy2 || 0],
            [Enemy1, counts.enemy1 || 0]
        ];

        const wave = [];
        let hasRemaining = true;

        while (hasRemaining) {
            hasRemaining = false;
            for (let i = 0; i < roster.length; i++) {
                const pair = roster[i];
                if (pair[1] > 0) {
                    wave.push(pair[0]);
                    pair[1]--;
                    hasRemaining = true;
                }
            }
        }

        return wave;
    }

    buildWave(wave) {
        // Phase 1 (1-10): onboarding and early ramp
        if (wave <= 10) {
            const counts = {
                enemy1: 10 + wave,
                enemy2: Math.max(0, wave - 2),
                enemy3: 0,
                tank1: wave >= 6 ? Math.floor((wave - 4) / 3) : 0,
                tank2: 0,
                tank3: 0,
                sprinter1: Math.floor((wave - 1) / 2),
                sprinter2: 0,
                sprinter3: 0,
                boss1: 0,
                boss2: 0,
                boss3: 0,
                smith: 0
            };
            return this.composeWave(counts);
        }

        // Phase 2 (11-19): transition to mixed mid-tier pressure
        if (wave <= 19) {
            const p = wave - 10;
            const counts = {
                enemy1: Math.max(2, 12 - p),
                enemy2: 6 + p,
                enemy3: Math.max(0, p - 3),
                tank1: 1 + Math.floor((p + 1) / 3),
                tank2: Math.max(0, Math.floor((p - 2) / 2)),
                tank3: 0,
                sprinter1: 3 + Math.floor(p / 2),
                sprinter2: Math.max(0, Math.floor((p - 3) / 2)),
                sprinter3: 0,
                boss1: 0,
                boss2: 0,
                boss3: 0,
                smith: 0
            };
            return this.composeWave(counts);
        }

        // Phase 3 (20-29): boss era starts, one boss each wave
        if (wave <= 29) {
            const p = wave - 20;
            const counts = {
                enemy1: 2,
                enemy2: 6,
                enemy3: 6 + p,
                tank1: 2 + Math.floor((p + 1) / 3),
                tank2: 1 + Math.floor((p + 1) / 2),
                tank3: 0,
                sprinter1: 2 + Math.floor(p / 3),
                sprinter2: 2 + Math.floor(p / 2),
                sprinter3: 0,
                boss1: wave >= 25 ? 2 : 1,
                boss2: wave >= 27 ? 1 : 0,
                boss3: 0,
                smith: 0
            };
            return this.composeWave(counts);
        }

        // Phase 4 (30-35): elite-heavy waves, occasional double-boss
        if (wave <= 35) {
            const p = wave - 30;
            const counts = {
                enemy1: 0,
                enemy2: 4,
                enemy3: 10 + p,
                tank1: 2 + Math.floor((p + 1) / 2),
                tank2: 3 + Math.floor(p / 2),
                tank3: Math.max(0, Math.floor((p - 2) / 2)),
                sprinter1: 1,
                sprinter2: 5 + Math.floor(p / 2),
                sprinter3: Math.max(0, Math.floor((p - 3) / 3)),
                boss1: 1,
                boss2: 2 + Math.floor(p / 3),
                boss3: Math.max(0, Math.floor((p - 4) / 3)),
                smith: 0
            };
            return this.composeWave(counts);
        }

        // Phase 5 (36-40): final escalation
        if (wave <= 40) {
            const p = wave - 35;
            const counts = {
                enemy1: 0,
                enemy2: 2,
                enemy3: 12 + p * 2,
                tank1: 1,
                tank2: 4 + p,
                tank3: 3 + p,
                sprinter1: 0,
                sprinter2: 7 + p,
                sprinter3: 3 + Math.floor(p / 2),
                boss1: 1,
                boss2: 2 + p,
                boss3: 1 + Math.floor(p / 2),
                smith: 0
            };
            return this.composeWave(counts);
        }

        // Phase 6 (41): Final boss
        if (wave === 41) {
            const counts = {
                enemy1: 0,
                enemy2: 0,
                enemy3: 0,
                tank1: 0,
                tank2: 0,
                tank3: 0,
                sprinter1: 0,
                sprinter2: 0,
                sprinter3: 0,
                boss1: 0,
                boss2: 0,
                boss3: 0,
                smith: 1
            };
            return this.composeWave(counts);
        }
    }

    getWave(waveNumber) {
        return this.waves[waveNumber] || this.waves[1]; // Default to wave 1 if not found
    }

    hasWave(waveNumber) {
        return this.waves.hasOwnProperty(waveNumber);
    }

    getTotalWaves() {
        return this.maxWave - 1;
    }
}
