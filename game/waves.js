// Wave Management System
class WaveManager {
    constructor() {
        this.waves = {
            1: [Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy],
            2: [Enemy, Enemy, Enemy, Enemy, Sprinter, Enemy, Enemy, Enemy, Enemy, Sprinter, Enemy, Enemy, Enemy, Enemy, Sprinter],
            3: [Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Sprinter, Tank],
            4: [Tank, Tank, Enemy, Tank, Sprinter, Tank, Tank, Enemy, Tank, Sprinter, Tank, Tank, Enemy, Tank, Sprinter, Tank],

            5: [Enemy, Enemy, Enemy, Sprinter, Enemy, Enemy, Sprinter, Enemy, Enemy, Tank, Enemy, Sprinter],
            6: [Enemy, Sprinter, Enemy, Sprinter, Tank, Enemy, Sprinter, Enemy, Tank, Enemy, Sprinter, Enemy, Tank],
            7: [Tank, Enemy, Sprinter, Tank, Enemy, Sprinter, Tank, Enemy, Sprinter, Tank, Enemy, Sprinter],
            8: [Tank, Tank, Sprinter, Enemy, Tank, Sprinter, Enemy, Tank, Sprinter, Enemy, Tank, Sprinter],
            9: [Tank, Sprinter, Tank, Sprinter, Tank, Enemy, Tank, Sprinter, Tank, Enemy, Tank, Sprinter],
            10: [Tank, Tank, Tank, Sprinter, Enemy, Tank, Tank, Sprinter, Enemy, Tank, Tank, Sprinter],

            11: [Enemy, Enemy, Sprinter, Sprinter, Tank, Enemy, Sprinter, Tank, Enemy, Sprinter, Tank],
            12: [Sprinter, Sprinter, Tank, Tank, Enemy, Sprinter, Tank, Enemy, Sprinter, Tank, Enemy],
            13: [Tank, Tank, Sprinter, Sprinter, Tank, Enemy, Tank, Sprinter, Tank, Enemy, Tank],
            14: [Tank, Sprinter, Tank, Sprinter, Tank, Tank, Enemy, Tank, Sprinter, Tank, Tank],
            15: [Tank, Tank, Tank, Sprinter, Sprinter, Tank, Tank, Enemy, Tank, Sprinter, Tank],

            16: [Sprinter, Sprinter, Sprinter, Tank, Tank, Enemy, Tank, Sprinter, Tank, Enemy, Tank],
            17: [Tank, Tank, Sprinter, Sprinter, Tank, Tank, Sprinter, Tank, Tank, Enemy, Tank],
            18: [Tank, Sprinter, Tank, Sprinter, Tank, Sprinter, Tank, Tank, Tank, Enemy, Tank],
            19: [Tank, Tank, Tank, Sprinter, Tank, Sprinter, Tank, Tank, Tank, Sprinter, Tank],

            20: [Enemy, Enemy, Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Enemy, Enemy, Boss],

            21: [Tank, Sprinter, Tank, Enemy, Boss, Tank, Sprinter, Tank, Enemy, Tank],
            22: [Tank, Tank, Sprinter, Boss, Tank, Tank, Sprinter, Tank, Enemy, Tank],
            23: [Tank, Sprinter, Tank, Tank, Boss, Tank, Sprinter, Tank, Tank, Enemy],
            24: [Tank, Tank, Tank, Sprinter, Boss, Tank, Tank, Sprinter, Tank, Tank],
            25: [Tank, Sprinter, Tank, Tank, Tank, Boss, Tank, Tank, Sprinter, Tank],

            26: [Sprinter, Tank, Boss, Tank, Tank, Sprinter, Tank, Tank, Boss, Tank],
            27: [Tank, Tank, Sprinter, Tank, Boss, Tank, Tank, Sprinter, Tank, Boss],
            28: [Tank, Sprinter, Tank, Tank, Tank, Boss, Tank, Tank, Tank, Boss],
            29: [Tank, Tank, Tank, Sprinter, Boss, Tank, Tank, Tank, Sprinter, Boss],
            30: [Tank, Tank, Tank, Tank, Tank, Boss, Tank, Tank, Tank, Boss],

            31: [Boss, Tank, Sprinter, Tank, Tank, Boss, Tank, Tank, Sprinter, Tank],
            32: [Tank, Boss, Tank, Sprinter, Tank, Tank, Boss, Tank, Tank, Sprinter],
            33: [Boss, Tank, Tank, Tank, Sprinter, Boss, Tank, Tank, Tank, Sprinter],
            34: [Tank, Boss, Tank, Tank, Tank, Boss, Tank, Tank, Tank, Sprinter],
            35: [Boss, Tank, Tank, Tank, Tank, Boss, Tank, Tank, Tank, Tank],

            36: [Boss, Tank, Sprinter, Boss, Tank, Tank, Boss, Tank, Sprinter, Tank],
            37: [Boss, Tank, Tank, Boss, Tank, Tank, Boss, Tank, Tank, Sprinter],
            38: [Boss, Boss, Tank, Sprinter, Tank, Boss, Tank, Tank, Boss, Tank],
            39: [Boss, Boss, Tank, Tank, Sprinter, Boss, Tank, Tank, Boss, Tank],

            40: [Boss, Boss, Sprinter, Boss, Boss, Tank, Boss, Boss, Sprinter, Boss, Boss, Tank],
        };
    }

    getWave(waveNumber) {
        return this.waves[waveNumber] || this.waves[1]; // Default to wave 1 if not found
    }

    hasWave(waveNumber) {
        return this.waves.hasOwnProperty(waveNumber);
    }

    getTotalWaves() {
        let count = 0;
        for (const waveNumber in this.waves) {
            const wave = this.waves[waveNumber];
            if (Array.isArray(wave) && wave.length > 0) {
                count++;
            }
        }
        return count;
    }
}
