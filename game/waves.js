// Wave Management System
class WaveManager {
    constructor() {
        this.waves = {
            1: [Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy, Enemy],
            2: [Enemy, Enemy, Shooter, Shooter],
            3: [Enemy, Sprinter, Tank, Shooter, Shooter],
            4: [Tank, Tank, Tank, Sprinter, Shooter, Shooter],
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
