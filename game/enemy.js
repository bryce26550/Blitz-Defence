class EnemyBase {
    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.width = opts.width ?? 30;
        this.height = opts.height ?? 30;
        this.speed = opts.speed ?? 1;
        this.hp = opts.hp ?? 1;
        this.maxHp = this.hp;
        this.damage = opts.damage ?? 1;
        this.worth = opts.worth ?? 1;

        this.color = opts.color ?? '#ff4444';
        this.innerColor = opts.innerColor ?? '#ffffff';
        this.coreColor = opts.coreColor ?? '#ff0000';

        this.hidden = false;
        this.fortified = false;
        this.armorBroken = false;
        this.glitched = false;
        this.isGlitching = false;
        this.glitchTimer = 0;
        this.glitchCooldown = 2000;
        this.glitchDuration = 500;
    }

    update(deltaTime) {
        updateEnemyWithGlitch(this, deltaTime);
    }

    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1;
    }

    followPath(deltaTime) {
        if (!this.path || this.currentWaypoint >= this.path.length) {
            const baseCenterX = 650;
            const baseCenterY = 400;
            const enemyCenterX = this.x + this.width / 2;
            const enemyCenterY = this.y + this.height / 2;

            const dx = baseCenterX - enemyCenterX;
            const dy = baseCenterY - enemyCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= 30) {
                if (window.game) {
                    window.game.takeDamage(this.damage);
                    window.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                }
                this.hp = 0;
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 16;
                this.y += (dy / distance) * this.speed * deltaTime / 16;
            }
            return;
        }

        const target = this.path[this.currentWaypoint];
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;
        const dx = target.x - enemyCenterX;
        const dy = target.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            this.currentWaypoint++;
        } else {
            this.x += (dx / distance) * this.speed * deltaTime / 16;
            this.y += (dy / distance) * this.speed * deltaTime / 16;
        }
    }

    takeDamage(damage = 1, isExplosive = false) {
        if (this.glitched && this.isGlitching) return;

        if (this.fortified && !this.armorBroken) {
            if (isExplosive || damage >= 5) {
                this.armorHp -= damage;
                if (this.armorHp <= 0) {
                    this.armorBroken = true;
                    this.fortified = false;
                }
            }
            return;
        }

        this.hp -= damage;
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        ctx.fillStyle = (this.glitched && this.isGlitching)
            ? getRandomGlitchColor()
            : this.color;

        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.innerColor;
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);

        ctx.fillStyle = this.coreColor;
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Enemy1 extends EnemyBase {
    constructor(x, y) {
        super(x, y, {
            speed: 1.5,
            hp: 1,
            damage: 5,
            worth: 5,
            color: '#ff4444',
            innerColor: '#ffffff',
            coreColor: '#ff0000'
        });
    }
}

class Enemy2 extends EnemyBase {
    constructor(x, y) {
        super(x, y, {
            speed: 1.6,
            hp: 2,
            damage: 10,
            worth: 10,
            color: '#ff7f44ff',
            innerColor: '#ffffff',
            coreColor: '#ff7300ff'
        });
    }
}

class Enemy3 extends EnemyBase {
    constructor(x, y) {
        super(x, y, {
            speed: 1.75,
            hp: 3,
            damage: 15,
            worth: 15,
            color: '#4aff44ff',
            innerColor: '#ffffff',
            coreColor: '#2bff00ff'
        });
    }
}

class Tank1 extends EnemyBase {
    constructor(x, y) {
        super(x, y, {
            width: 44,
            height: 40,
            speed: 0.75,
            hp: 5,
            damage: 25,
            worth: 75,
            color: '#5c5c5c',
            innerColor: '#707070',
            coreColor: '#9a9a9a'
        });
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        ctx.fillStyle = (this.glitched && this.isGlitching) ? getRandomGlitchColor() : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Simplified multi-layer plating (based on Tank3)
        ctx.fillStyle = this.innerColor;
        ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);

        // Small central core
        ctx.fillStyle = this.coreColor;
        ctx.fillRect(this.x + 12, this.y + 10, this.width - 24, this.height - 20);

        // Simple treads
        ctx.fillStyle = '#3e3e3e';
        ctx.fillRect(this.x, this.y + 6, 4, this.height - 12);
        ctx.fillRect(this.x + this.width - 4, this.y + 6, 4, this.height - 12);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Tank2 extends EnemyBase {
    constructor(x, y) {
        super(x, y, {
            width: 48,
            height: 46,
            speed: 0.65,
            hp: 8,
            damage: 35,
            worth: 125,
            color: '#52585b',
            innerColor: '#6a6f72',
            coreColor: '#393f42'
        });
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        ctx.fillStyle = (this.glitched && this.isGlitching) ? getRandomGlitchColor() : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // One bold outer plate
        ctx.fillStyle = this.innerColor;
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
        
        // Armor band across middle
        ctx.fillStyle = '#4a5054';
        ctx.fillRect(this.x + 6, this.y + Math.floor(this.height / 2) - 4, this.width - 12, 8);
        
        // Reinforced central chamber
        ctx.fillStyle = this.coreColor;
        ctx.fillRect(this.x + 14, this.y + 12, this.width - 28, this.height - 24);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Tank3 extends EnemyBase {
    constructor(x, y) {
        super(x, y, {
            width: 50,
            height: 50,
            speed: 0.55,
            hp: 12,
            damage: 50,
            worth: 200,
            color: '#5c5c5c',
            innerColor: '#777777',
            coreColor: '#555555'
        });
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        if (this.glitched && this.isGlitching) {
            ctx.fillStyle = getRandomGlitchColor();
        } else {
            ctx.fillStyle = '#5c5c5c';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Tank3 design: Multi-layered fortress with rotating spikes
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Outer armor plating
        ctx.fillStyle = '#707070';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

        // Inner reinforced core
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, this.height - 16);

        // Center chamber
        ctx.fillStyle = '#888888';
        ctx.fillRect(this.x + 14, this.y + 14, this.width - 28, this.height - 28);

        // Spike protrusions at cardinal directions
        ctx.fillStyle = '#606060';
        ctx.fillRect(this.x + 20, this.y - 3, 10, 5); // Top spike
        ctx.fillRect(this.x + 20, this.y + this.height - 2, 10, 5); // Bottom spike
        ctx.fillRect(this.x - 3, this.y + 20, 5, 10); // Left spike
        ctx.fillRect(this.x + this.width - 2, this.y + 20, 5, 10); // Right spike

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Sprinter1 extends EnemyBase {
    constructor(x, y) {
        super(x, y, {
            width: 25,
            height: 25,
            speed: 4,
            hp: 1,
            damage: 15,
            worth: 25,
            color: '#ff00ea',
            innerColor: '#ffffff',
            coreColor: '#000000'
        });
        this.dashTimer = 0;
        this.dashCooldown = 2000;
        this.isDashing = false;
    }

    update(deltaTime) {
        updateEnemyWithGlitch(this, deltaTime);
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        if (this.isDashing) ctx.fillStyle = '#ff66ff';
        else if (this.dashTimer > this.dashCooldown - 1000) ctx.fillStyle = '#ffaaff';
        else ctx.fillStyle = '#ff00ea';

        if (this.glitched && this.isGlitching) ctx.fillStyle = getRandomGlitchColor();

        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 15, 15);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 10, this.y + 10, 5, 5);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Sprinter2 extends Sprinter1 {
    constructor(x, y) {
        super(x, y);
        this.speed = 4.5;
        this.hp = 3;
        this.maxHp = this.hp;
        this.damage = 25;
        this.worth = 50;
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        // Brighter, more saturated magenta
        if (this.isDashing) {
            ctx.fillStyle = '#3336ffff';
        } else if (this.dashTimer > this.dashCooldown - 1000) {
            ctx.fillStyle = '#6966ffff';
        } else {
            ctx.fillStyle = '#0400ffff';
        }

        if (this.glitched && this.isGlitching) ctx.fillStyle = getRandomGlitchColor();

        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 15, 15);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 10, this.y + 10, 5, 5);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Sprinter3 extends Sprinter2 {
    constructor(x, y) {
        super(x, y);
        this.speed = 5.2;
        this.hp = 4;
        this.maxHp = this.hp;
        this.damage = 35;
        this.worth = 75;
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        // Deep violet/electric purple
        if (this.isDashing) {
            ctx.fillStyle = '#eeff00ff';
        } else if (this.dashTimer > this.dashCooldown - 1000) {
            ctx.fillStyle = '#fbff00ff';
        } else {
            ctx.fillStyle = '#ffee00ff';
        }

        if (this.glitched && this.isGlitching) ctx.fillStyle = getRandomGlitchColor();

        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 15, 15);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 10, this.y + 10, 5, 5);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Boss1 extends EnemyBase {
    constructor(x, y) {
        super(x, y, {
            width: 52,
            height: 52,
            speed: 0.5,
            hp: 140,
            damage: 55,
            worth: 3000,
            color: '#22272b',
            innerColor: '#5b6a6eff',
            coreColor: '#00d1ff'
        });
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        // Outer shell
        ctx.fillStyle = (this.glitched && this.isGlitching) ? getRandomGlitchColor() : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Thick framed plating
        ctx.fillStyle = '#15181a';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);

        // Glowing inner panel
        ctx.fillStyle = this.innerColor;
        ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, this.height - 16);

        // Bright core / eye centered
        ctx.fillStyle = this.coreColor;
        ctx.fillRect(this.x + Math.floor(this.width / 2) - 6, this.y + Math.floor(this.height / 2) - 6, 12, 12);
        ctx.fillStyle = '#07202a';
        ctx.fillRect(this.x + Math.floor(this.width / 2) - 3, this.y + Math.floor(this.height / 2) - 3, 6, 6);

        // Single centered horn / crown bit (one above the boss)
        const centerX = this.x + Math.floor(this.width / 2);
        ctx.fillStyle = '#2b2f31';
        ctx.fillRect(centerX - 4, this.y - 4, 8, 10); // narrow centered horn

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Boss2 extends Boss1 {
    constructor(x, y) {
        super(x, y);
        this.width = 55;
        this.height = 55;
        this.speed = 0.6;
        this.hp = 180;
        this.maxHp = this.hp;
        this.damage = 75;
        this.worth = 4000;
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        ctx.fillStyle = this.glitched && this.isGlitching ? getRandomGlitchColor() : '#5b1010';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Crimson armored face
        ctx.fillStyle = '#2d0505';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);

        // Chest core
        ctx.fillStyle = '#b31f1f';
        ctx.fillRect(this.x + 10, this.y + 10, 35, 35);
        ctx.fillStyle = '#ffd1d1';
        ctx.fillRect(this.x + 19, this.y + 19, 17, 17);
        ctx.fillStyle = '#330000';
        ctx.fillRect(this.x + 24, this.y + 24, 7, 7);

        // Horns / spikes
        ctx.fillStyle = '#7a0f0f';
        ctx.fillRect(this.x + 5, this.y - 4, 8, 10);
        ctx.fillRect(this.x + this.width - 13, this.y - 4, 8, 10);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Boss3 extends Boss1 {
    constructor(x, y) {
        super(x, y);
        this.width = 60;
        this.height = 60;
        this.speed = 0.7;
        this.hp = 275;
        this.maxHp = this.hp;
        this.damage = 100;
        this.worth = 6000;
    }

    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        ctx.fillStyle = this.glitched && this.isGlitching ? getRandomGlitchColor() : '#5a4300';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Gold/black royal frame
        ctx.fillStyle = '#1a1200';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);

        // Bright core
        ctx.fillStyle = '#d4a000';
        ctx.fillRect(this.x + 8, this.y + 8, 44, 44);
        ctx.fillStyle = '#fff2a6';
        ctx.fillRect(this.x + 18, this.y + 18, 24, 24);
        ctx.fillStyle = '#2a1700';
        ctx.fillRect(this.x + 26, this.y + 26, 8, 8);

        // Crown spikes
        ctx.fillStyle = '#f0c84b';
        ctx.fillRect(this.x + 8, this.y - 5, 8, 12);
        ctx.fillRect(this.x + 26, this.y - 8, 8, 15);
        ctx.fillRect(this.x + 44, this.y - 5, 8, 12);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Smith {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;  // Larger than normal boss
        this.height = 100;
        this.speed = 0.65;   // Slower but menacing
        this.hp = 100000;     // Massive health pool
        this.maxHp = 100000;
        this.damage = 999;  // Instant kill if it reaches base
        this.worth = 0;     // No money reward - this is about survival

        // Load the smith image
        this.image = new Image();
        this.image.src = '/img/smith.png';
        this.imageLoaded = false;

        this.image.onload = () => {
            this.imageLoaded = true;
            console.log('Smith image loaded successfully');
        };

        this.image.onerror = () => {
            console.error('Failed to load Smith image');
        };

        // Final boss properties
        this.isFinalBoss = true;
        this.name = "Smith - The Final Boss";
        this.reachedBase = false;

        console.log('Smith - The Final Boss has awakened!');
    }

    update(deltaTime) {
        // Smith doesn't get enhanced properties - he's already terrifying enough
        this.followPath(deltaTime);
    }

    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1;
        this.pathProgress = 0;
    }

    followPath(deltaTime) {
        if (!this.path || this.currentWaypoint >= this.path.length) {
            // No path or reached end, move toward base
            const baseCenterX = 650;
            const baseCenterY = 400;
            const enemyCenterX = this.x + this.width / 2;
            const enemyCenterY = this.y + this.height / 2;

            const dx = baseCenterX - enemyCenterX;
            const dy = baseCenterY - enemyCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if enemy reached the base (within 50 pixels for larger boss)
            if (distance <= 50) {
                this.reachedBase = true;
                if (window.game) {
                    window.game.finalBossReachedBase = true;
                    window.game.gameOver();
                    window.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                }
                this.hp = 0;
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 16;
                this.y += (dy / distance) * this.speed * deltaTime / 16;
            }
            return;
        }

        // Move toward current waypoint
        const target = this.path[this.currentWaypoint];
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;

        const dx = target.x - enemyCenterX;
        const dy = target.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) { // Larger threshold for bigger boss
            this.currentWaypoint++;
        } else {
            this.x += (dx / distance) * this.speed * deltaTime / 16;
            this.y += (dy / distance) * this.speed * deltaTime / 16;
        }
    }

    takeDamage(damage = 1, isExplosive = false) {
        // Smith takes normal damage - no special resistances
        this.hp -= damage;
        console.log(`Smith took ${damage} damage! HP: ${this.hp}/${this.maxHp}`);
    }

    render(ctx) {
        // Save context for potential transformations
        ctx.save();

        // Calculate how much bigger we want the image
        const imageScale = 2.5; // Make image 2x bigger
        const imageWidth = this.width * imageScale;
        const imageHeight = this.height * imageScale;

        // Calculate offset to keep image centered on boss position
        const offsetX = (imageWidth - this.width) / 2;
        const offsetY = (imageHeight - this.height) / 2;

        // Draw the smith image (larger but centered)
        ctx.drawImage(
            this.image,
            this.x - offsetX,    // Move left by half the extra width
            this.y - offsetY,    // Move up by half the extra height
            imageWidth,          // 2x width
            imageHeight          // 2x height
        );

        ctx.restore();
    }
}

class Hayden extends Boss {
    constructor(x, y) {
        super(x, y);
        this.width = 100;
        this.height = 100;
        this.speed = 1.35;
        this.hp = 120000;
        this.maxHp = 120000;
        this.damage = 999;
        this.worth = 2500;
        this.isStunImmune = false;
        this.name = 'Hayden the True Final Boss';
        this.spinAngle = 0;
        this.spinTimer = 0;
        this.spinSpeed = 0;
        this.nextSpinAt = Date.now() + 1200 + Math.random() * 1800;
        this.tauntTimer = 0;
        this.tauntMessage = '';
        this.nextTauntAt = Date.now() + 700 + Math.random() * 1200;

        this.image = new Image();
        this.image.src = '/img/hayden.png';
        this.imageLoaded = false;

        this.image.onload = () => {
            this.imageLoaded = true;
            console.log('Hayden image loaded successfully');
        };

        this.image.onerror = () => {
            console.error('Failed to load Hayden image');
        };

        this.isHayden = true;
        this.isFinalBoss = false;
        this.name = 'Hayden the True Final Boss';
        this.reachedBase = false;

        console.log('Hayden has entered the battlefield!');
    }

    update(deltaTime) {
        const now = Date.now();

        if (this.spinTimer > 0) {
            this.spinTimer -= deltaTime;
            this.spinAngle += this.spinSpeed * deltaTime;
            if (this.spinTimer <= 0) {
                this.spinTimer = 0;
                this.spinSpeed = 0;
            }
        } else if (now >= this.nextSpinAt) {
            this.spinTimer = 850 + Math.random() * 650;
            this.spinSpeed = 0.0025 + Math.random() * 0.0015;
            this.nextSpinAt = now + 2200 + Math.random() * 3200;
        }

        if (this.tauntTimer > 0) {
            this.tauntTimer -= deltaTime;
            if (this.tauntTimer <= 0) {
                this.tauntTimer = 0;
                this.tauntMessage = '';
            }
        } else if (now >= this.nextTauntAt) {
            this.tauntMessage = 'no teacher no crazy';
            this.tauntTimer = 1400;
            this.nextTauntAt = now + 2600 + Math.random() * 2600;
            console.log('Hayden says: no teacher no crazy');
        }

        this.followPath(deltaTime);
    }

    renderTauntBubble(ctx) {
        if (!this.tauntMessage) return;

        ctx.save();
        ctx.font = 'bold 16px Arial';
        const text = this.tauntMessage;
        const padding = 10;
        const textWidth = ctx.measureText(text).width;
        const bubbleWidth = textWidth + padding * 2;
        const bubbleHeight = 28;
        const bubbleX = this.x + this.width / 2 - bubbleWidth / 2;
        const bubbleY = this.y - bubbleHeight - 10;

        ctx.fillStyle = 'rgba(12, 24, 58, 0.92)';
        ctx.strokeStyle = '#69a7ff';
        ctx.lineWidth = 2;
        ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);

        ctx.fillStyle = '#d7ecff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, this.x + this.width / 2, bubbleY + bubbleHeight / 2 + 1);
        ctx.restore();
    }

    render(ctx) {
        ctx.save();

        const imageScale = 2.5;
        const imageWidth = this.width * imageScale;
        const imageHeight = this.height * imageScale;
        const offsetX = (imageWidth - this.width) / 2;
        const offsetY = (imageHeight - this.height) / 2;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.translate(centerX, centerY);
        if (this.spinTimer > 0) {
            ctx.rotate(this.spinAngle);
        }

        ctx.drawImage(
            this.image,
            -offsetX,
            -offsetY,
            imageWidth,
            imageHeight
        );

        ctx.restore();
        this.renderTauntBubble(ctx);
    }
}


function getRandomGlitchColor() {
    const glitchColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000'];
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
}

function beginEnhancedEnemyRender(ctx, enemy) {
    const originalAlpha = ctx.globalAlpha;
    if (enemy.hidden) {
        ctx.globalAlpha = 0.3;
    }
    return originalAlpha;
}

function renderFortifiedArmor(ctx, enemy) {
    if (!enemy.fortified || enemy.armorBroken) return;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(enemy.x - 2, enemy.y - 2, enemy.width + 4, 4);
    ctx.fillRect(enemy.x - 2, enemy.y + enemy.height - 2, enemy.width + 4, 4);
    ctx.fillRect(enemy.x - 2, enemy.y, 4, enemy.height);
    ctx.fillRect(enemy.x + enemy.width - 2, enemy.y, 4, enemy.height);

    ctx.fillStyle = 'rgba(128, 128, 128, 0.9)';
    ctx.fillRect(enemy.x - 2, enemy.y - 2, 6, 6);
    ctx.fillRect(enemy.x + enemy.width - 4, enemy.y - 2, 6, 6);
    ctx.fillRect(enemy.x - 2, enemy.y + enemy.height - 4, 6, 6);
    ctx.fillRect(enemy.x + enemy.width - 4, enemy.y + enemy.height - 4, 6, 6);
}

function renderGlitchOverlay(ctx, enemy) {
    if (!enemy.glitched) return;

    if (Math.random() < 0.3) {
        ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
        const offsetX = (Math.random() - 0.5) * 4;
        const offsetY = (Math.random() - 0.5) * 4;
        ctx.fillRect(enemy.x + offsetX, enemy.y + offsetY, enemy.width, enemy.height);
    }
}

function updateEnemyWithGlitch(enemy, deltaTime) {
    if (enemy.glitched) {
        enemy.glitchTimer = (enemy.glitchTimer || 0) + deltaTime;

        if (!enemy.isGlitching && enemy.glitchTimer >= (enemy.glitchCooldown || 2000)) {
            enemy.isGlitching = true;
            enemy.glitchTimer = 0;
        } else if (enemy.isGlitching && enemy.glitchTimer >= (enemy.glitchDuration || 500)) {
            enemy.isGlitching = false;
            enemy.glitchTimer = 0;
            enemy.glitchCooldown = 2000 + Math.random() * 1000;
        }
    }

    const speedMultiplier = (enemy.glitched && enemy.isGlitching) ? 2.5 : 1;
    const originalSpeed = enemy.speed;
    enemy.speed = originalSpeed * speedMultiplier;
    enemy.followPath(deltaTime);
    enemy.speed = originalSpeed;
}

// Enhanced Enemy Properties System
function applyEnemyEnhancements(enemy, waveNumber) {
    // Calculate chances based on wave progression
    const baseChance = Math.min(0.15, (waveNumber - 15) * 0.008); // Starts at 0%, caps at 15%

    // Fortified chance (slightly higher for tanks)
    const fortifiedChance = enemy.constructor.name === 'Tank' ? baseChance * 1.5 : baseChance;

    // Hidden chance (higher for sprinters)
    const hiddenChance = enemy.constructor.name.includes('Sprinter') ? baseChance * 1.2 : baseChance;

    // Glitch chance (equal for all)
    const glitchChance = baseChance;

    // Apply Fortified
    if (Math.random() < fortifiedChance) {
        makeEnemyFortified(enemy);
    }

    // Apply Hidden (only if not fortified - they're mutually exclusive for visual clarity)
    else if (Math.random() < hiddenChance) {
        makeEnemyHidden(enemy);
    }

    // Apply Glitch (can combine with others)
    if (Math.random() < glitchChance) {
        makeEnemyGlitched(enemy);
    }

    return enemy;
}

// Fortified Enhancement
function makeEnemyFortified(enemy) {
    enemy.fortified = true;
    enemy.originalHp = enemy.hp;
    enemy.armorHp = Math.ceil(enemy.hp * 0.5); // Armor has 50% of base HP
    enemy.armorBroken = false;

    console.log(`${enemy.constructor.name} spawned with Fortified armor (${enemy.armorHp} armor HP)`);
}

// Hidden Enhancement  
function makeEnemyHidden(enemy) {
    enemy.hidden = true;
    enemy.alpha = 0.3; // Semi-transparent

    console.log(`${enemy.constructor.name} spawned with Hidden stealth`);
}

// Glitch Enhancement
function makeEnemyGlitched(enemy) {
    enemy.glitched = true;
    enemy.glitchTimer = 0;
    enemy.glitchCooldown = 2000 + Math.random() * 1000; // 2-3 seconds between glitches
    enemy.isGlitching = false;
    enemy.glitchDuration = 500; // 0.5 seconds of invulnerability

    console.log(`${enemy.constructor.name} spawned with Glitch instability`);
}
