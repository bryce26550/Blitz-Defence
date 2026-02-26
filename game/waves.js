// Wave Management System
class WaveManager {
    constructor() {
        this.waves = {
            1: [Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy],
            2: [Enemy, Enemy, Enemy, Enemy, Sprinter, Enemy, Enemy, Enemy, Enemy, Sprinter, Enemy, Enemy, Enemy, Enemy, Sprinter],
            3: [Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Sprinter, Tank],
            4: [Tank, Tank, Enemy, Tank, Sprinter, Tank, Tank, Enemy, Tank, Sprinter, Tank, Tank, Enemy, Tank, Sprinter, Tank],
            // 5: [],            
            // 6: [],            
            // 7: [],            
            // 8: [],            
            // 9: [],            
            // 10: [],            
            // 11: [],            
            // 12: [],            
            // 13: [],            
            // 14: [],            
            // 15: [],            
            // 16: [],            
            // 17: [],            
            // 18: [],            
            // 19: [],            
            // 20: [],            
            // 21: [],            
            // 22: [],            
            // 23: [],            
            // 24: [],            
            // 25: [],            
            // 26: [],            
            // 27: [],            
            // 28: [],            
            // 29: [],            
            // 30: [],            
            // 31: [],            
            // 32: [],            
            // 33: [],            
            // 34: [],            
            // 35: [],            
            // 36: [],            
            // 37: [],            
            // 38: [],            
            // 39: [],            
            // 40: [],            
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
