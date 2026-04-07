// Maps and Path Management System
class MapManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Initialize test paths
        this.testPaths = this.createTestPaths();

        // Create maps array
        this.maps = [
            this.testPaths,           // All Paths
            this.testPaths.straight,  // Straight only
            this.testPaths.zigzag,    // Zigzag
            this.testPaths.corner,    // Corner
            this.testPaths.spiral1,   // Spiral paths
            this.testPaths.corners    // Corner path
        ];

        // Current map tracking
        this.currentMapIndex = 0;
        this.currentMap = this.testPaths;

        // Base position (center of canvas)
        this.basePosition = {
            x: this.canvasWidth / 2 - 30,
            y: this.canvasHeight / 2 - 30
        };
    }

    createTestPaths() {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        return {
            straight: [
                { x: 0, y: 400 },
                { x: 650, y: 400 }
            ],
            zigzag: [
                { x: 0, y: 200 },      // Start at left edge, upper area
                { x: 200, y: 300 },    // Zig down-right
                { x: 400, y: 150 },    // Zag up-right  
                { x: 600, y: 350 },    // Zig down-right
                { x: 800, y: 200 },    // Zag up-right
                { x: 1000, y: 400 },   // Zig down-right
                { x: 650, y: 400 }     // Final destination at center
            ],
            corner: [
                { x: 1300, y: 400 },   // Start from right edge
                { x: 1000, y: 400 },   // Straight left
                { x: 1000, y: 200 },   // Sharp turn up
                { x: 800, y: 200 },    // Straight left
                { x: 800, y: 600 },    // Sharp turn down
                { x: 650, y: 600 },    // Straight left
                { x: 650, y: 400 }     // Sharp turn to center
            ],

            // One massive spiral covering the entire canvas
            spiral1: this.generateMassiveSpiral(),

            // Spiral 2 - starts from bottom-right area, spirals clockwise to center  
            // spiral2: this.generateClockwiseSpiral(1150, 700, centerX, centerY, 5),

            // Corner path following the pattern you specified
            corners: this.generateCornerPath()
        };
    }

// Generate one massive clockwise spiral starting from the edge of the screen
generateMassiveSpiral() {
    const points = [];
    const centerX = this.canvasWidth / 2;   // 650
    const centerY = this.canvasHeight / 2;  // 400
    const turns = 4; // Good number of turns for visibility
    const totalPoints = turns * 40; // Smooth spiral
    
    // Use the smaller dimension to ensure the spiral fits, but start from the edge
    const maxRadius = Math.min(this.canvasWidth / 2, this.canvasHeight / 2); // 400 (height/2)
    
    for (let i = 0; i <= totalPoints; i++) {
        const progress = i / totalPoints;
        
        // Clockwise spiral starting from maximum radius (edge) spiraling inward
        const angle = progress * turns * 2 * Math.PI;
        
        // Start at full radius (edge) and spiral inward to center
        const radiusProgress = 1 - progress; // Start at 1 (edge), end at 0 (center)
        const radius = maxRadius * radiusProgress;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        points.push({ x: Math.round(x), y: Math.round(y) });
    }
    
    // Ensure we end exactly at center
    points[points.length - 1] = { x: centerX, y: centerY };
    
    return points;
}


    // Generate corner path with off-screen segments (enemies only visible at corners)
    generateCornerPath() {
        const cornerOffset = 90;
        const offScreen = 200; // Distance off-screen

        return [
            // Start off-screen top-left
            { x: -offScreen, y: 90 },

            // Enter screen approaching first corner
            { x: 0, y: 90 },
            { x: 90, y: 90 },
            { x: 90, y: 0 },

            // Exit off-screen and travel to top-right corner off-screen
            { x: 90, y: -offScreen },
            { x: 1210, y: -offScreen },

            // Enter screen at top-right corner
            { x: 1210, y: 0 },
            { x: 1210, y: 90 },
            { x: 1300, y: 90 },

            // Exit off-screen and travel to bottom-right corner off-screen
            { x: 1300 + offScreen, y: 90 },
            { x: 1300 + offScreen, y: 710 },

            // Enter screen at bottom-right corner
            { x: 1300, y: 710 },
            { x: 1210, y: 710 },
            { x: 1210, y: 800 },

            // Exit off-screen and travel to bottom-left corner off-screen
            { x: 1210, y: 800 + offScreen },
            { x: 90, y: 800 + offScreen },

            // Enter screen at bottom-left corner
            { x: 90, y: 800 },
            { x: 90, y: 710 },
            { x: 0, y: 710 },

            // Exit off-screen to complete the loop
            { x: -offScreen, y: 710 }
        ];
    }





    // Cycle to next map
    cycleMap() {
        this.currentMapIndex = (this.currentMapIndex + 1) % this.maps.length;
        this.currentMap = this.maps[this.currentMapIndex];
        console.log('Switched to map index:', this.currentMapIndex);
        return this.currentMapIndex;
    }

    // Get available paths for the current map
    getAvailablePaths() {
        if (this.currentMapIndex === 0) {
            // All paths available
            return ['straight', 'zigzag', 'corner', 'spiral1', 'spiral2', 'corners'];
        } else if (this.currentMapIndex === 1) {
            return ['straight'];
        } else if (this.currentMapIndex === 2) {
            return ['zigzag', 'straight'];
        } else if (this.currentMapIndex === 3) {
            return ['corner', 'straight'];
        } else if (this.currentMapIndex === 4) {
            return ['spiral1'];
        } else if (this.currentMapIndex === 5) {
            return ['corners'];
        }
        return ['straight']; // fallback
    }

    // Get current map name for display
    getCurrentMapName() {
        const mapNames = ['All Paths', 'Straight', 'Zigzag', 'Corner', 'Spirals', 'Corners'];
        return mapNames[this.currentMapIndex];
    }

    // Get a specific path by name
    getPath(pathName) {
        return this.testPaths[pathName];
    }

    // Get spawn position for a path (first waypoint)
    getSpawnPosition(pathName) {
        const path = this.getPath(pathName);
        return { x: path[0].x, y: path[0].y };
    }

    // Get the full path waypoints
    getPathWaypoints(pathName) {
        return this.getPath(pathName);
    }

    getTrackMode() {
        // Define track modes for each map
        const trackModes = {
            0: 'perEnemy',  // All Paths - rotate per enemy
            1: 'single',    // Straight - single path only
            2: 'perWave',   // Zigzag - rotate per wave  
            3: 'perEnemy'   // Corner - rotate per enemy
        };

        return trackModes[this.currentMapIndex] || 'single';
    }

    // Render all paths based on current map selection
    renderPaths(ctx) {
        ctx.lineWidth = 10;

        if (this.currentMapIndex === 0) {
            // Show all paths
            this.renderAllPaths(ctx);
        } else if (this.currentMapIndex === 1) {
            // Show only straight path
            this.renderStraightPath(ctx);
        } else if (this.currentMapIndex === 2) {
            // Show only zigzag path
            this.renderZigzagPath(ctx);
        } else if (this.currentMapIndex === 3) {
            // Show only corner path
            this.renderCornerPath(ctx);
        } else if (this.currentMapIndex === 4) {
            // Show spiral paths
            this.renderSpiralPath(ctx);
        } else if (this.currentMapIndex === 5) {
            // Show corner path
            this.renderCornersPath(ctx);
        }
    }


    renderAllPaths(ctx) {
        // Render straight path
        if (this.testPaths.straight) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(this.testPaths.straight[0].x, this.testPaths.straight[0].y);
            ctx.lineTo(this.testPaths.straight[1].x, this.testPaths.straight[1].y);
            ctx.stroke();
        }

        // Render zigzag path
        if (this.testPaths.zigzag) {
            ctx.strokeStyle = 'rgba(0, 26, 255, 1)';
            ctx.beginPath();
            ctx.moveTo(this.testPaths.zigzag[0].x, this.testPaths.zigzag[0].y);
            for (let i = 1; i < this.testPaths.zigzag.length; i++) {
                ctx.lineTo(this.testPaths.zigzag[i].x, this.testPaths.zigzag[i].y);
            }
            ctx.stroke();
        }

        // Render corner path
        if (this.testPaths.corner) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
            ctx.beginPath();
            ctx.moveTo(this.testPaths.corner[0].x, this.testPaths.corner[0].y);
            for (let i = 1; i < this.testPaths.corner.length; i++) {
                ctx.lineTo(this.testPaths.corner[i].x, this.testPaths.corner[i].y);
            }
            ctx.stroke();
        }
    }

    renderStraightPath(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(this.testPaths.straight[0].x, this.testPaths.straight[0].y);
        ctx.lineTo(this.testPaths.straight[1].x, this.testPaths.straight[1].y);
        ctx.stroke();
    }

    renderZigzagPath(ctx) {
        if (this.testPaths.zigzag) {
            ctx.strokeStyle = 'rgba(0, 26, 255, 1)';
            ctx.beginPath();
            ctx.moveTo(this.testPaths.zigzag[0].x, this.testPaths.zigzag[0].y);
            for (let i = 1; i < this.testPaths.zigzag.length; i++) {
                ctx.lineTo(this.testPaths.zigzag[i].x, this.testPaths.zigzag[i].y);
            }
            ctx.stroke();
        }


        if (this.testPaths.straight) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(this.testPaths.straight[0].x, this.testPaths.straight[0].y);
            ctx.lineTo(this.testPaths.straight[1].x, this.testPaths.straight[1].y);
            ctx.stroke();
        }
    }

    renderCornerPath(ctx) {
        if (this.testPaths.corner) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
            ctx.beginPath();
            ctx.moveTo(this.testPaths.corner[0].x, this.testPaths.corner[0].y);
            for (let i = 1; i < this.testPaths.corner.length; i++) {
                ctx.lineTo(this.testPaths.corner[i].x, this.testPaths.corner[i].y);
            }
            ctx.stroke();
        }

        if (this.testPaths.straight) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(this.testPaths.straight[0].x, this.testPaths.straight[0].y);
            ctx.lineTo(this.testPaths.straight[1].x, this.testPaths.straight[1].y);
            ctx.stroke();
        }
    }

    renderSpiralPath(ctx) {
        // Render the massive spiral with a hypnotic gradient effect
        if (this.testPaths.spiral1) {
            ctx.lineWidth = 12; // Thicker line for better visibility

            for (let i = 1; i < this.testPaths.spiral1.length; i++) {
                // Create a hypnotic color gradient from outer to inner
                const progress = i / this.testPaths.spiral1.length;
                const hue = (progress * 360 + 180) % 360; // Color wheel effect
                const alpha = 0.4 + (0.6 * progress); // Fade in toward center

                ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;

                ctx.beginPath();
                ctx.moveTo(this.testPaths.spiral1[i - 1].x, this.testPaths.spiral1[i - 1].y);
                ctx.lineTo(this.testPaths.spiral1[i].x, this.testPaths.spiral1[i].y);
                ctx.stroke();
            }
        }
    }



    renderCornersPath(ctx) {
        if (this.testPaths.corners) {
            ctx.strokeStyle = 'rgba(255, 0, 255, 1)';
            ctx.lineWidth = 10;
            ctx.beginPath();

            // Draw the full path including off-screen segments
            ctx.moveTo(this.testPaths.corners[0].x, this.testPaths.corners[0].y);
            for (let i = 1; i < this.testPaths.corners.length; i++) {
                const point = this.testPaths.corners[i];
                ctx.lineTo(point.x, point.y);

                // Change color for on-screen vs off-screen segments
                if (point.x >= 0 && point.x <= 1300 && point.y >= 0 && point.y <= 800) {
                    ctx.strokeStyle = 'rgba(255, 0, 255, 1)'; // Bright for on-screen
                } else {
                    ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)'; // Dim for off-screen
                }
            }
            ctx.stroke();
        }
    }


    // Render the base (destination)
    renderBase(ctx) {
        // Draw the grey square base at the center
        ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
        ctx.fillRect(this.basePosition.x, this.basePosition.y, 60, 60);

        // Add a border
        ctx.strokeStyle = 'rgba(64, 64, 64, 1.0)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.basePosition.x, this.basePosition.y, 60, 60);
    }

    // Optional: Display current map name on screen
    renderMapName(ctx) {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
    }
}
