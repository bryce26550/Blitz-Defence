// Wave Management System
class WaveManager {
    constructor() {
        this.waves = {
            1: [Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy],
            2: [Enemy, Enemy, Enemy, Enemy, Sprinter, Enemy, Enemy, Enemy, Enemy, Sprinter, Enemy, Enemy, Enemy, Enemy, Sprinter],
            3: [Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Sprinter, Tank, Enemy, Enemy, Sprinter, Tank],
            4: [Tank, Tank, Enemy, Tank, Sprinter, Tank, Tank, Enemy, Tank, Sprinter, Tank, Tank, Enemy, Tank, Sprinter, Tank],
            // Add more waves as needed
        };
    }

    getWave(waveNumber) {
        return this.waves[waveNumber] || this.waves[1]; // Default to wave 1 if not found
    }

    hasWave(waveNumber) {
        return this.waves.hasOwnProperty(waveNumber);
    }
}
