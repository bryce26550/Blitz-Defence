// Maps and Path Management System
class MapManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Load Eye of Ender background image
        this.eyeOfEnderImage = new Image();
        this.eyeOfEnderImage.src = 'img/Eye.jpg';
        this.eyeImageLoaded = false;

        // Load Vortex background image
        this.vortexImage = new Image();
        this.vortexImage.src = 'img/Vortex1.jpg'; // Fixed: was missing .src
        this.vortexImageLoaded = false;

        this.eyeOfEnderImage.onload = () => {
            this.eyeImageLoaded = true;
            console.log('Eye of Ender image loaded successfully');
        };

        this.eyeOfEnderImage.onerror = () => {
            console.error('Failed to load Eye of Ender image');
        };

        this.vortexImage.onload = () => {
            this.vortexImageLoaded = true;
            console.log('Vortex image loaded successfully');
        };

        this.vortexImage.onerror = () => {
            console.error('Failed to load Vortex image');
        };

        // Initialize test paths
        this.testPaths = this.createTestPaths();

        // Create maps array
        this.maps = [
            this.testPaths,             // 0: All Paths
            this.testPaths.spiral,      // 1: Spiral path
            this.testPaths.corners,     // 2: 4Corners path
            this.testPaths.mirroredTop, // 3: Mirrored paths
            this.testPaths,             // 4: Circut
            this.testPaths,             // 5: Eye Spy
            this.testPaths,             // 6: ??? (Random)
            this.testPaths,             // 7: Vortex
            this.testPaths,             // 8: Phantom
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
            spiral: this.generateMassiveSpiral(),


            // 4Corner path that have the enemies spending most of their time off screen
            corners: this.generateCornerPath(),

            // Mirrored paths
            mirroredTop: [
                { x: 50, y: -10 },           // Top-left start
                { x: 50, y: 150 }, // First turn
                { x: 250, y: 150 }, // Strait
                { x: 800, y: 600 }, // End Diagonal
                { x: 1200, y: 600 }, //
                { x: 1200, y: 750 }, // More waypoints...
                { x: 1050, y: 750 }, // More waypoints...
                { x: 1050, y: centerY }, // More waypoints...
                { x: centerX, y: centerY }        // End at center
            ],
            mirroredBottom: [
                { x: 50, y: 810 },    // Bottom-left start  
                { x: 50, y: 650 },    // Mirrored waypoints
                { x: 250, y: 650 }, // More waypoints...
                { x: 800, y: 200 },    // End Diagonal
                { x: 1200, y: 200 },    // End Diagonal
                { x: 1200, y: 50 },    // End Diagonal
                { x: 1050, y: 50 },    // End Diagonal
                { x: 1050, y: centerY },    // End Diagonal
                { x: centerX, y: centerY }           // End at center
            ],

            // Eye Spy Paths
            eyeSpyOuter: this.generateEyeSpyOuter(),
            eyeSpyInner: this.generateEyeSpyInner(),

            // Random Paths
            randomPaths: this.generateRandomPaths(),

            // Vortex Paths 
            vortexNorth: this.generateVortexPath('north'),
            vortexNorthEast: this.generateVortexPath('northeast'),
            vortexEast: this.generateVortexPath('east'),
            vortexSouthEast: this.generateVortexPath('southeast'),
            vortexSouth: this.generateVortexPath('south'),
            vortexSouthWest: this.generateVortexPath('southwest'),
            vortexWest: this.generateVortexPath('west'),
            vortexNorthWest: this.generateVortexPath('northwest'),

            // Phantom paths - deceptive overlapping paths
            phantomTop: this.generatePhantomPath('top'),
            phantomBottom: this.generatePhantomPath('bottom'),
            phantomFakes: this.generatePhantomFakePaths(),


        };
    }

    // Generate one massive clockwise spiral starting from the edge of the screen
    generateMassiveSpiral() {
        const points = [];
        const centerX = this.canvasWidth / 2;   // 650
        const centerY = this.canvasHeight / 2;  // 400
        const turns = 5; // Good number of turns for visibility
        const totalPoints = turns * 40; // Smooth spiral

        // Use the smaller dimension to ensure the spiral fits, but start from the edge
        const maxRadius = Math.min(this.canvasWidth / 1.2, this.canvasHeight / 1.2); // 400 (height/2)

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
        const offScreen = 100; // Distance off-screen

        return [
            // Start off-screen top-left
            { x: -offScreen, y: 150 },

            // Enter screen approaching first corner
            { x: 0, y: 150 },
            { x: 150, y: 150 },
            { x: 150, y: 0 },

            // Exit off-screen and travel to top-right corner off-screen
            { x: 150, y: -offScreen },
            { x: 1150, y: -offScreen },

            // Enter screen at top-right corner
            { x: 1150, y: 0 },
            { x: 1150, y: 150 },
            { x: 1300, y: 150 },

            // Exit off-screen and travel to bottom-right corner off-screen
            { x: 1300 + offScreen, y: 150 },
            { x: 1300 + offScreen, y: 650 },

            // Enter screen at bottom-right corner
            { x: 1300, y: 650 },
            { x: 1150, y: 650 },
            { x: 1150, y: 800 },

            // Exit off-screen and travel to bottom-left corner off-screen
            { x: 1150, y: 800 + offScreen },
            { x: 150, y: 800 + offScreen },

            // Enter screen at bottom-left corner
            { x: 150, y: 800 },
            { x: 150, y: 650 },
            { x: 0, y: 650 },

            // Exit off-screen to complete the loop
            { x: -offScreen, y: 650 },
            { x: -offScreen, y: this.canvasHeight / 2 },
            { x: this.canvasWidth / 2, y: this.canvasHeight / 2 }
        ];
    }

    // Custom path selection for Cricut map
    getCricutPaths() {
        // This will be called from your game's wave system
        // For now, return all available paths
        return ['corners', 'mirroredTop', 'mirroredBottom'];
    }

    // Method to determine which paths to use based on wave number
    getCricutPathsForWave(waveNumber) {
        if (waveNumber % 2 === 1) {
            // Odd waves: Use 4Corners
            return ['corners'];
        } else {
            // Even waves: Use Mirrored paths
            return ['mirroredTop', 'mirroredBottom'];
        }
    }

    // Generate outer circle path (counter-clockwise)
    generateEyeSpyOuter() {
        const centerX = this.canvasWidth / 2 - 3;
        const centerY = this.canvasHeight / 2;
        const radius = Math.min(this.canvasWidth, this.canvasHeight) * 0.47; // 30% for better proportions

        const points = [];
        const numPoints = 48; // Smooth circle

        for (let i = 0; i <= numPoints; i++) {
            // Counter-clockwise: start at top, go left
            const angle = (i / numPoints) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(-angle) * radius;
            const y = centerY + Math.sin(-angle) * radius;
            points.push({ x: Math.round(x), y: Math.round(y) });
        }

        return points;
    }

    // Generate inner oval pupil (clockwise)
    generateEyeSpyInner() {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const ovalWidth = 70;   // Horizontal radius
        const ovalHeight = 145;  // Vertical radius (taller for pupil shape)

        const points = [];
        const numPoints = 32; // Smooth oval

        for (let i = 0; i <= numPoints; i++) {
            // Clockwise: start at top, go right
            const angle = (i / numPoints) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * ovalWidth;
            const y = centerY + Math.sin(angle) * ovalHeight;
            points.push({ x: Math.round(x), y: Math.round(y) });
        }

        return points;
    }

    // Add this method after your other generation methods:
    generateRandomPaths() {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        // Random number of paths (1-5)
        const numPaths = Math.floor(Math.random() * 5) + 1;
        const paths = {};

        // Generate each random path
        for (let pathIndex = 0; pathIndex < numPaths; pathIndex++) {
            const pathName = `random${pathIndex}`;
            const points = [];

            // Random starting point on border
            const startPoint = this.getRandomBorderPoint();
            points.push(startPoint);

            // Random number of waypoints (2-6)
            const numWaypoints = Math.floor(Math.random() * 5) + 2;

            // Generate random waypoints across the screen
            for (let i = 0; i < numWaypoints; i++) {
                const progress = (i + 1) / (numWaypoints + 1); // Progress toward center

                // Random point, but generally moving toward center
                const randomX = Math.random() * this.canvasWidth;
                const randomY = Math.random() * this.canvasHeight;

                // Blend with movement toward center for more natural paths
                const targetX = startPoint.x + (centerX - startPoint.x) * progress;
                const targetY = startPoint.y + (centerY - startPoint.y) * progress;

                // Mix random with directed movement (70% directed, 30% random)
                const finalX = targetX * 0.7 + randomX * 0.3;
                const finalY = targetY * 0.7 + randomY * 0.3;

                points.push({
                    x: Math.round(Math.max(50, Math.min(this.canvasWidth - 50, finalX))),
                    y: Math.round(Math.max(50, Math.min(this.canvasHeight - 50, finalY)))
                });
            }

            // Always end at center
            points.push({ x: centerX, y: centerY });

            paths[pathName] = points;
        }

        return paths;
    }

    // Helper method to get random border starting points
    getRandomBorderPoint() {
        const border = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left

        switch (border) {
            case 0: // Top border
                return { x: Math.random() * this.canvasWidth, y: 0 };
            case 1: // Right border
                return { x: this.canvasWidth, y: Math.random() * this.canvasHeight };
            case 2: // Bottom border
                return { x: Math.random() * this.canvasWidth, y: this.canvasHeight };
            case 3: // Left border
                return { x: 0, y: Math.random() * this.canvasHeight };
            default:
                return { x: 0, y: this.canvasHeight / 2 };
        }
    }

    generateVortexPath(startDirection) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const outerRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.35;
        const innerRadius = 30;

        const points = [];

        // Define starting positions for 8 directions
        const startPositions = {
            north: { x: centerX, y: 0, angle: -Math.PI / 2 },
            northeast: { x: this.canvasWidth, y: 0, angle: -Math.PI / 4 },
            east: { x: this.canvasWidth, y: centerY, angle: 0 },
            southeast: { x: this.canvasWidth, y: this.canvasHeight, angle: Math.PI / 4 },
            south: { x: centerX, y: this.canvasHeight, angle: Math.PI / 2 },
            southwest: { x: 0, y: this.canvasHeight, angle: 3 * Math.PI / 4 },
            west: { x: 0, y: centerY, angle: Math.PI },
            northwest: { x: 0, y: 0, angle: -3 * Math.PI / 4 }
        };

        const start = startPositions[startDirection];
        points.push({ x: start.x, y: start.y });

        // Create smooth curved approach - ALL CURVES GO CLOCKWISE
        const approachPoints = 15;
        const targetX = centerX + Math.cos(start.angle) * outerRadius;
        const targetY = centerY + Math.sin(start.angle) * outerRadius;

        for (let i = 1; i <= approachPoints; i++) {
            const progress = i / approachPoints;
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

            // Control point offset - ALWAYS clockwise (subtract π/4 for consistent direction)
            const controlDistance = Math.max(this.canvasWidth, this.canvasHeight) * 0.25;
            const controlAngle = start.angle - Math.PI / 4; // Consistent clockwise curve
            const controlX = centerX + Math.cos(controlAngle) * controlDistance;
            const controlY = centerY + Math.sin(controlAngle) * controlDistance;

            // Quadratic Bézier curve
            const t = easedProgress;
            const x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * targetX;
            const y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * targetY;

            points.push({ x: Math.round(x), y: Math.round(y) });
        }

        // Travel around the outer circle (1.25 full revolutions) - CLOCKWISE
        const totalRevolutions = 1.25;
        const circlePoints = Math.round(36 * totalRevolutions);

        for (let i = 1; i <= circlePoints; i++) {
            // Clockwise rotation (positive angle increment)
            const angle = start.angle + (i / (circlePoints / totalRevolutions)) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * outerRadius;
            const y = centerY + Math.sin(angle) * outerRadius;
            points.push({ x: Math.round(x), y: Math.round(y) });
        }

        // Inward spiral to center - CLOCKWISE
        const spiralPoints = 24;
        const currentAngle = start.angle + (totalRevolutions * 2 * Math.PI);

        for (let i = 1; i <= spiralPoints; i++) {
            const progress = i / spiralPoints;

            // Clockwise spiral inward (positive angle increment)
            const angle = currentAngle + (progress * Math.PI * 0.5); // Half turn as we spiral in
            const radius = outerRadius * (1 - progress) + innerRadius * progress;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            points.push({ x: Math.round(x), y: Math.round(y) });
        }

        // Final point at center
        points.push({ x: centerX, y: centerY });

        return points;
    }

    generatePhantomPath(variant) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const offScreen = 150;

        if (variant === 'top') {
            // Real path: Start -> zigzag -> split -> end
            return [
                // Start from left edge
                { x: 0, y: centerY },
                { x: 550, y: centerY },
                { x: 550, y: centerY - 100 },
                { x: 750, y: centerY - 100 },
                { x: 750, y: centerY },
                { x: this.canvasWidth + offScreen, y: centerY },
                { x: this.canvasWidth + offScreen, y: this.canvasHeight + offScreen},
                { x: centerX, y: this.canvasHeight + offScreen},
                { x: centerX, y: centerY},

            ];
        } else {
            // Real path: Split -> loop around -> end
            return [
                // Start from split point  
                { x: 0, y: centerY },
                { x: 550, y: centerY },
                { x: 550, y: centerY + 100 },
                { x: 750, y: centerY + 100 },
                { x: 750, y: centerY },
                { x: this.canvasWidth + offScreen, y: centerY },
                { x: this.canvasWidth + offScreen, y: this.canvasHeight + offScreen},
                { x: centerX, y: this.canvasHeight + offScreen},
                { x: centerX, y: centerY},
            ];
        }
    }

    // Generate fake paths that closely shadow the real paths
    generatePhantomFakePaths() {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        return {
            // Fake path 1: Shadows the early zigzag but doesn't connect to split
            fakeEarly: [
                { x: 0, y: centerY },
                { x: 200, y: centerY  }, // Slightly offset from real path
                { x: 200, y: 150 },
                { x: 350, y: 150 },
                { x: 350, y: 650 },
                { x: 500, y: 650 },
                { x: 500, y: centerY },
                { x: centerX, y: centerY },
                { x: 800, y: centerY },
                { x: 800, y: 650 },
                { x: 950, y: 650 },
                { x: 950, y: 150 },
                { x: 1100, y: 150 },
                { x: 1100, y: centerY },
                { x: 1300, y: centerY },
            ]
        };
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
            return ['straight', 'zigzag', 'corner'];
        } else if (this.currentMapIndex === 1) {
            return ['spiral'];
        } else if (this.currentMapIndex === 2) {
            return ['corners'];
        } else if (this.currentMapIndex === 3) {
            return ['mirroredTop', 'mirroredBottom'];
        } else if (this.currentMapIndex === 4) {
            return this.getCricutPaths();
        } else if (this.currentMapIndex === 5) {
            return ['eyeSpyOuter', 'eyeSpyInner'];
        } else if (this.currentMapIndex === 6) {
            // Return all random paths that were generated
            const randomPaths = [];
            for (const pathName in this.testPaths.randomPaths) {
                randomPaths.push(pathName); // Just "random0", "random1", etc.
            }
            return randomPaths;
        } else if (this.currentMapIndex === 7) {
            return [
                'vortexNorth', 'vortexNorthEast', 'vortexEast', 'vortexSouthEast',
                'vortexSouth', 'vortexSouthWest', 'vortexWest', 'vortexNorthWest'
            ];
        } else if (this.currentMapIndex === 8) {
            return ['phantomTop', 'phantomBottom'];
        }

        return ['straight']; // fallback
    }

    // Get current map name for display
    getCurrentMapName() {
        const mapNames = ['3 Ways', 'Spirals', '4Corners', 'Mirrored', 'Cricut', 'Eye Spy', '???', 'Vortex', 'Empty Space'];
        return mapNames[this.currentMapIndex];
    }

    // Get a specific path by name
    getPath(pathName) {
        // Check if it's a random path
        if (pathName.startsWith('random') && this.testPaths.randomPaths) {
            return this.testPaths.randomPaths[pathName];
        }

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
            1: 'single',    // Spiral - single path
            2: 'single',     // 4Corners - single path
            3: 'perEnemy',  // Mirrored - rotate per enemy
            4: 'cricut',    // Cricut - custom hybrid mode
            5: 'perWave',   // Eye Spy - alternate between outer and inner
            6: 'perEnemy', // ??? - rotate through random paths
            7: 'perEnemy', // Vortex - rotate through 4 directions
            8: 'perEnemy', // Phantom - alternate between paths
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
            // Show Spiral path
            this.renderSpiralPath(ctx);
        } else if (this.currentMapIndex === 2) {
            // Show 4Corner paths
            this.renderCornersPath(ctx);
        } else if (this.currentMapIndex === 3) {
            // Show mirrored paths with overlaps
            this.renderMirroredTop(ctx);
            this.renderMirroredBottom(ctx);
            this.highlightPathOverlaps(ctx);
        } else if (this.currentMapIndex === 4) {
            // Show Cricute paths (4Corners + Mirrored with overlaps)
            this.renderCornersPath(ctx);
            this.renderMirroredTop(ctx);
            this.renderMirroredBottom(ctx);
            this.highlightPathOverlaps(ctx);
        } else if (this.currentMapIndex === 5) {
            this.renderEyeSpyPath(ctx);
        } else if (this.currentMapIndex === 6) {
            // Show random paths
            this.renderRandomPaths(ctx);
        } else if (this.currentMapIndex === 7) {
            // Show Vortex paths with gradient
            this.renderVortexPaths(ctx);
        } else if (this.currentMapIndex === 8) {
            // Show Phantom paths with deception
            this.renderPhantomPaths(ctx);
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

    renderSpiralPath(ctx) {
        // Render the massive spiral with a hypnotic gradient effect
        if (this.testPaths.spiral) {
            ctx.lineWidth = 12; // Thicker line for better visibility

            for (let i = 1; i < this.testPaths.spiral.length; i++) {
                // Create a hypnotic color gradient from outer to inner
                const progress = i / this.testPaths.spiral.length;
                const hue = (progress * 360 + 180) % 360; // Color wheel effect
                const alpha = 0.4 + (0.6 * progress); // Fade in toward center

                ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;

                ctx.beginPath();
                ctx.moveTo(this.testPaths.spiral[i - 1].x, this.testPaths.spiral[i - 1].y);
                ctx.lineTo(this.testPaths.spiral[i].x, this.testPaths.spiral[i].y);
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

    // Helper function to check orientation of three points
    getOrientation(p1, p2, p3) {
        const value = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);

        if (value === 0) return 0; // collinear
        return (value > 0) ? 1 : 2; // clockwise or counterclockwise
    }

    // Helper function to check if two line segments intersect
    lineSegmentsIntersect(line1Start, line1End, line2Start, line2End) {
        const o1 = this.getOrientation(line1Start, line1End, line2Start);
        const o2 = this.getOrientation(line1Start, line1End, line2End);
        const o3 = this.getOrientation(line2Start, line2End, line1Start);
        const o4 = this.getOrientation(line2Start, line2End, line1End);

        // General case: segments intersect if orientations are different
        if (o1 !== o2 && o3 !== o4) {
            return true;
        }

        // Special cases for collinear points (when orientation = 0)
        if (o1 === 0 && this.pointOnSegment(line1Start, line2Start, line1End)) return true;
        if (o2 === 0 && this.pointOnSegment(line1Start, line2End, line1End)) return true;
        if (o3 === 0 && this.pointOnSegment(line2Start, line1Start, line2End)) return true;
        if (o4 === 0 && this.pointOnSegment(line2Start, line1End, line2End)) return true;

        return false;
    }


    // Find the actual intersection point of two line segments
    getIntersectionPoint(line1Start, line1End, line2Start, line2End) {
        // First check if they actually intersect
        if (!this.lineSegmentsIntersect(line1Start, line1End, line2Start, line2End)) {
            return null;
        }

        const x1 = line1Start.x, y1 = line1Start.y;
        const x2 = line1End.x, y2 = line1End.y;
        const x3 = line2Start.x, y3 = line2Start.y;
        const x4 = line2End.x, y4 = line2End.y;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return null; // Parallel lines

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }

    // Check if two segments are identical (complete overlap)
    segmentsCompletelyOverlap(seg1Start, seg1End, seg2Start, seg2End) {
        return (seg1Start.x === seg2Start.x && seg1Start.y === seg2Start.y &&
            seg1End.x === seg2End.x && seg1End.y === seg2End.y) ||
            (seg1Start.x === seg2End.x && seg1Start.y === seg2End.y &&
                seg1End.x === seg2Start.x && seg1End.y === seg2Start.y);
    }


    // Check if point q lies on segment pr (when they're collinear)
    pointOnSegment(p, q, r) {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    }

    renderMirroredPathsWithOverlaps(ctx) {
        // First, render both paths normally
        this.renderMirroredTop(ctx);
        this.renderMirroredBottom(ctx);

        // Then find and highlight overlaps
        this.highlightPathOverlaps(ctx);
    }

    highlightPathOverlaps(ctx) {
        const topPath = this.testPaths.mirroredTop;
        const bottomPath = this.testPaths.mirroredBottom;

        // Check each segment of top path against each segment of bottom path
        for (let i = 0; i < topPath.length - 1; i++) {
            for (let j = 0; j < bottomPath.length - 1; j++) {
                const topSegment = [topPath[i], topPath[i + 1]];
                const bottomSegment = [bottomPath[j], bottomPath[j + 1]];

                // Check for complete overlap first
                if (this.segmentsCompletelyOverlap(topSegment[0], topSegment[1], bottomSegment[0], bottomSegment[1])) {
                    // Draw entire segment in purple
                    ctx.strokeStyle = 'rgba(150, 0, 250, 1)'; // Purple color
                    ctx.lineWidth = 12; // Slightly thicker to cover both paths
                    ctx.beginPath();
                    ctx.moveTo(topSegment[0].x, topSegment[0].y);
                    ctx.lineTo(topSegment[1].x, topSegment[1].y);
                    ctx.stroke();
                    continue; // Skip intersection check for this pair
                }

                // Check for intersection (X-crossing)
                const intersection = this.getIntersectionPoint(
                    topSegment[0], topSegment[1],
                    bottomSegment[0], bottomSegment[1]
                );

                if (intersection) {
                    // Draw purple highlight at intersection
                    this.drawOverlapHighlight(ctx, topSegment, bottomSegment, intersection);
                }
            }
        }
    }


    drawOverlapHighlight(ctx, topSegment, bottomSegment, intersection) {
        const purpleLength = 25; // How far from intersection to make purple (in pixels)

        ctx.strokeStyle = 'rgba(150, 0, 250, 1)'; // Purple color
        ctx.lineWidth = 12; // Same thickness as original paths

        // Calculate purple portion of top segment
        const topPurpleSegment = this.calculatePurpleSegment(topSegment[0], topSegment[1], intersection, purpleLength);
        if (topPurpleSegment) {
            ctx.beginPath();
            ctx.moveTo(topPurpleSegment.start.x, topPurpleSegment.start.y);
            ctx.lineTo(topPurpleSegment.end.x, topPurpleSegment.end.y);
            ctx.stroke();
        }

        // Calculate purple portion of bottom segment  
        const bottomPurpleSegment = this.calculatePurpleSegment(bottomSegment[0], bottomSegment[1], intersection, purpleLength);
        if (bottomPurpleSegment) {
            ctx.beginPath();
            ctx.moveTo(bottomPurpleSegment.start.x, bottomPurpleSegment.start.y);
            ctx.lineTo(bottomPurpleSegment.end.x, bottomPurpleSegment.end.y);
            ctx.stroke();
        }
    }

    calculatePurpleSegment(segmentStart, segmentEnd, intersection, purpleLength) {
        // Calculate the direction and length of the segment
        const dx = segmentEnd.x - segmentStart.x;
        const dy = segmentEnd.y - segmentStart.y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);

        if (segmentLength === 0) return null;

        // Unit vector along the segment
        const unitX = dx / segmentLength;
        const unitY = dy / segmentLength;

        // Calculate start and end of purple section
        let purpleStart = {
            x: intersection.x - unitX * purpleLength,
            y: intersection.y - unitY * purpleLength
        };

        let purpleEnd = {
            x: intersection.x + unitX * purpleLength,
            y: intersection.y + unitY * purpleLength
        };

        // Clamp to segment boundaries
        // Check if purple section extends beyond segment start
        const distToStart = Math.sqrt((intersection.x - segmentStart.x) ** 2 + (intersection.y - segmentStart.y) ** 2);
        if (distToStart < purpleLength) {
            purpleStart = segmentStart;
        }

        // Check if purple section extends beyond segment end
        const distToEnd = Math.sqrt((intersection.x - segmentEnd.x) ** 2 + (intersection.y - segmentEnd.y) ** 2);
        if (distToEnd < purpleLength) {
            purpleEnd = segmentEnd;
        }

        return { start: purpleStart, end: purpleEnd };
    }




    renderMirroredTop(ctx) {
        if (this.testPaths.mirroredTop) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 1)'; // Red for top path
            ctx.lineWidth = 10;
            ctx.beginPath();

            // Draw the full path including off-screen segments
            ctx.moveTo(this.testPaths.mirroredTop[0].x, this.testPaths.mirroredTop[0].y);
            for (let i = 1; i < this.testPaths.mirroredTop.length; i++) {
                const point = this.testPaths.mirroredTop[i];
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
    }

    renderMirroredBottom(ctx) {
        if (this.testPaths.mirroredBottom) {
            ctx.strokeStyle = 'rgba(0, 0, 255, 1)'; // Blue for bottom path
            ctx.lineWidth = 10;
            ctx.beginPath();

            // Draw the full path including off-screen segments
            ctx.moveTo(this.testPaths.mirroredBottom[0].x, this.testPaths.mirroredBottom[0].y);
            for (let i = 1; i < this.testPaths.mirroredBottom.length; i++) {
                const point = this.testPaths.mirroredBottom[i];
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
    }

    renderEyeSpyPath(ctx) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        // Draw the Eye of Ender background image
        if (this.eyeImageLoaded) {
            const imageSize = Math.min(this.canvasWidth, this.canvasHeight) * 0.9; // 90% of canvas
            const imageX = centerX - imageSize / 2 - 5;
            const imageY = centerY - imageSize / 2;

            ctx.drawImage(this.eyeOfEnderImage, imageX, imageY, imageSize, imageSize);
        }

        // Draw the outer path on top (counter-clockwise)
        if (this.testPaths.eyeSpyOuter) {
            ctx.strokeStyle = 'rgba(26, 0, 43, 0.8)'; // White path for visibility
            ctx.lineWidth = 8;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;

            ctx.beginPath();
            ctx.moveTo(this.testPaths.eyeSpyOuter[0].x, this.testPaths.eyeSpyOuter[0].y);
            for (let i = 1; i < this.testPaths.eyeSpyOuter.length; i++) {
                ctx.lineTo(this.testPaths.eyeSpyOuter[i].x, this.testPaths.eyeSpyOuter[i].y);
            }
            ctx.stroke();

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }

        // Draw the inner path on top (clockwise)
        if (this.testPaths.eyeSpyInner) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)'; // Yellow path for contrast
            ctx.lineWidth = 6;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;

            ctx.beginPath();
            ctx.moveTo(this.testPaths.eyeSpyInner[0].x, this.testPaths.eyeSpyInner[0].y);
            for (let i = 1; i < this.testPaths.eyeSpyInner.length; i++) {
                ctx.lineTo(this.testPaths.eyeSpyInner[i].x, this.testPaths.eyeSpyInner[i].y);
            }
            ctx.stroke();

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
    }

    renderRandomPaths(ctx) {
        if (!this.testPaths.randomPaths) return;

        // Array of random colors for the paths
        const colors = [
            'rgba(255, 100, 100, 1)', // Red
            'rgba(100, 255, 100, 1)', // Green  
            'rgba(100, 100, 255, 1)', // Blue
            'rgba(255, 255, 100, 1)', // Yellow
            'rgba(255, 100, 255, 1)', // Magenta
            'rgba(100, 255, 255, 1)', // Cyan
            'rgba(255, 150, 100, 1)', // Orange
        ];

        let colorIndex = 0;

        // Render each random path
        for (const pathName in this.testPaths.randomPaths) {
            const path = this.testPaths.randomPaths[pathName];
            if (path && path.length > 0) {
                ctx.strokeStyle = colors[colorIndex % colors.length];
                ctx.lineWidth = 8;
                ctx.beginPath();

                ctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) {
                    ctx.lineTo(path[i].x, path[i].y);
                }
                ctx.stroke();

                colorIndex++;
            }
        }
    }

    renderVortexPaths(ctx) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        // Draw the Vortex background image
        if (this.vortexImageLoaded) {
            const imageSize = Math.min(this.canvasWidth, this.canvasHeight) * 1.3;
            const imageX = centerX - imageSize / 2;
            const imageY = centerY - imageSize / 2;

            ctx.drawImage(this.vortexImage, imageX, imageY, imageSize, imageSize);
        }

        const pathNames = [
            'vortexNorth', 'vortexNorthEast', 'vortexEast', 'vortexSouthEast',
            'vortexSouth', 'vortexSouthWest', 'vortexWest', 'vortexNorthWest'
        ];

        pathNames.forEach(pathName => {
            const path = this.testPaths[pathName];
            if (!path || path.length < 2) return;

            // Render path with gradient - lighter colors to show on dark background
            for (let i = 1; i < path.length; i++) {
                const progress = i / (path.length - 1);

                // Brighter gradient for visibility on dark vortex background
                const lightness = 80 - (progress * 30); // 80% to 50% lightness
                const saturation = 70 + (progress * 20); // 70% to 90% saturation

                ctx.strokeStyle = `hsl(200, ${saturation}%, ${lightness}%)`; // Cyan-blue hue
                ctx.lineWidth = 6;
                ctx.shadowColor = 'rgba(100, 200, 255, 0.5)';
                ctx.shadowBlur = 3;

                ctx.beginPath();
                ctx.moveTo(path[i - 1].x, path[i - 1].y);
                ctx.lineTo(path[i].x, path[i].y);
                ctx.stroke();
            }

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        });
    }

    renderPhantomPaths(ctx) {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        // 🎯 STEP 1: Draw PROMINENT fake paths (main focus - these should be obvious)
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'rgba(160, 160, 160, 1.0)'; // Bright gray - very visible
        ctx.lineCap = 'round';

        // Fake early zigzag path
        const fakeEarly = this.testPaths.phantomFakes.fakeEarly;
        if (fakeEarly && fakeEarly.length > 1) {
            ctx.beginPath();
            ctx.moveTo(fakeEarly[0].x, fakeEarly[0].y);
            for (let i = 1; i < fakeEarly.length; i++) {
                ctx.lineTo(fakeEarly[i].x, fakeEarly[i].y);
            }
            ctx.stroke();
        }

        // Fake loop path
        const fakeLoop = this.testPaths.phantomFakes.fakeLoop;
        if (fakeLoop && fakeLoop.length > 1) {
            ctx.beginPath();
            ctx.moveTo(fakeLoop[0].x, fakeLoop[0].y);
            for (let i = 1; i < fakeLoop.length; i++) {
                ctx.lineTo(fakeLoop[i].x, fakeLoop[i].y);
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
