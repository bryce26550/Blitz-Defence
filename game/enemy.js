class Enemy1 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 1.5;
        this.hp = 1;
        this.damage = 5;
        this.worth = 5;
    }

    update(deltaTime) {
        updateEnemyWithGlitch(this, deltaTime);
    }

    // Add to each enemy class
    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1; // Start heading to waypoint 1 (0 is spawn)
        this.pathProgress = 0;
    }

    // Update their movement logic to follow path instead of straight down
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

            // Check if enemy reached the base (within 30 pixels of center)
            if (distance <= 30) {
                // Deal damage to base and mark enemy for removal
                if (window.game) {
                    window.game.takeDamage(this.damage);
                    window.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                }
                this.hp = 0; // Mark for removal
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 16;
                this.y += (dy / distance) * this.speed * deltaTime / 16;
            }
            return;
        }

        // Move toward current waypoint (keep enemy center on path)
        const target = this.path[this.currentWaypoint];
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;

        const dx = target.x - enemyCenterX;
        const dy = target.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Reached waypoint, move to next
            this.currentWaypoint++;
        } else {
            // Move toward waypoint (this moves the enemy's top-left corner)
            this.x += (dx / distance) * this.speed * deltaTime / 16;
            this.y += (dy / distance) * this.speed * deltaTime / 16;
        }
    }


    // Replace the existing takeDamage method in each enemy class with this enhanced version:
    takeDamage(damage = 1, isExplosive = false) {
        // Handle glitched enemies
        if (this.glitched && this.isGlitching) {
            console.log('Glitched enemy is invulnerable - damage ignored!');
            return; // No damage during glitch phase
        }

        // Handle fortified enemies
        if (this.fortified && !this.armorBroken) {
            // Armor only takes damage from explosive/high damage attacks
            if (isExplosive || damage >= 5) {
                this.armorHp -= damage;
                console.log(`Armor took ${damage} damage. Armor HP: ${this.armorHp}`);

                if (this.armorHp <= 0) {
                    this.armorBroken = true;
                    this.fortified = false; // Remove fortified status
                    console.log('Armor broken! Enemy is now vulnerable to all damage.');
                }
            } else {
                console.log(`Damage ${damage} too low to penetrate armor (need 5+ or explosive)`);
                return; // No damage to armored enemy
            }
        } else {
            // Normal damage
            this.hp -= damage;
        }
    }



    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        if (this.glitched && this.isGlitching) {
            ctx.fillStyle = getRandomGlitchColor();
        } else {
            ctx.fillStyle = '#ff4444';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 20, 20);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 10, this.y + 10, 10, 10);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Enemy2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 1.6;
        this.hp = 2;
        this.damage = 10;
        this.worth = 10;
    }

    update(deltaTime) {
        updateEnemyWithGlitch(this, deltaTime);
    }

    // Add to each enemy class
    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1; // Start heading to waypoint 1 (0 is spawn)
        this.pathProgress = 0;
    }

    // Update their movement logic to follow path instead of straight down
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

            // Check if enemy reached the base (within 30 pixels of center)
            if (distance <= 30) {
                // Deal damage to base and mark enemy for removal
                if (window.game) {
                    window.game.takeDamage(this.damage);
                    window.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                }
                this.hp = 0; // Mark for removal
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 16;
                this.y += (dy / distance) * this.speed * deltaTime / 16;
            }
            return;
        }

        // Move toward current waypoint (keep enemy center on path)
        const target = this.path[this.currentWaypoint];
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;

        const dx = target.x - enemyCenterX;
        const dy = target.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Reached waypoint, move to next
            this.currentWaypoint++;
        } else {
            // Move toward waypoint (this moves the enemy's top-left corner)
            this.x += (dx / distance) * this.speed * deltaTime / 16;
            this.y += (dy / distance) * this.speed * deltaTime / 16;
        }
    }


    // Replace the existing takeDamage method in each enemy class with this enhanced version:
    takeDamage(damage = 1, isExplosive = false) {
        // Handle glitched enemies
        if (this.glitched && this.isGlitching) {
            console.log('Glitched enemy is invulnerable - damage ignored!');
            return; // No damage during glitch phase
        }

        // Handle fortified enemies
        if (this.fortified && !this.armorBroken) {
            // Armor only takes damage from explosive/high damage attacks
            if (isExplosive || damage >= 5) {
                this.armorHp -= damage;
                console.log(`Armor took ${damage} damage. Armor HP: ${this.armorHp}`);

                if (this.armorHp <= 0) {
                    this.armorBroken = true;
                    this.fortified = false; // Remove fortified status
                    console.log('Armor broken! Enemy is now vulnerable to all damage.');
                }
            } else {
                console.log(`Damage ${damage} too low to penetrate armor (need 5+ or explosive)`);
                return; // No damage to armored enemy
            }
        } else {
            // Normal damage
            this.hp -= damage;
        }
    }



    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        if (this.glitched && this.isGlitching) {
            ctx.fillStyle = getRandomGlitchColor();
        } else {
            ctx.fillStyle = '#ff7f44ff';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 20, 20);
        ctx.fillStyle = '#ff7300ff';
        ctx.fillRect(this.x + 10, this.y + 10, 10, 10);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Enemy3 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 1.75;
        this.hp = 3;
        this.damage = 15;
        this.worth = 15;
    }

    update(deltaTime) {
        updateEnemyWithGlitch(this, deltaTime);
    }

    // Add to each enemy class
    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1; // Start heading to waypoint 1 (0 is spawn)
        this.pathProgress = 0;
    }

    // Update their movement logic to follow path instead of straight down
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

            // Check if enemy reached the base (within 30 pixels of center)
            if (distance <= 30) {
                // Deal damage to base and mark enemy for removal
                if (window.game) {
                    window.game.takeDamage(this.damage);
                    window.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                }
                this.hp = 0; // Mark for removal
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 16;
                this.y += (dy / distance) * this.speed * deltaTime / 16;
            }
            return;
        }

        // Move toward current waypoint (keep enemy center on path)
        const target = this.path[this.currentWaypoint];
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;

        const dx = target.x - enemyCenterX;
        const dy = target.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Reached waypoint, move to next
            this.currentWaypoint++;
        } else {
            // Move toward waypoint (this moves the enemy's top-left corner)
            this.x += (dx / distance) * this.speed * deltaTime / 16;
            this.y += (dy / distance) * this.speed * deltaTime / 16;
        }
    }


    // Replace the existing takeDamage method in each enemy class with this enhanced version:
    takeDamage(damage = 1, isExplosive = false) {
        // Handle glitched enemies
        if (this.glitched && this.isGlitching) {
            console.log('Glitched enemy is invulnerable - damage ignored!');
            return; // No damage during glitch phase
        }

        // Handle fortified enemies
        if (this.fortified && !this.armorBroken) {
            // Armor only takes damage from explosive/high damage attacks
            if (isExplosive || damage >= 5) {
                this.armorHp -= damage;
                console.log(`Armor took ${damage} damage. Armor HP: ${this.armorHp}`);

                if (this.armorHp <= 0) {
                    this.armorBroken = true;
                    this.fortified = false; // Remove fortified status
                    console.log('Armor broken! Enemy is now vulnerable to all damage.');
                }
            } else {
                console.log(`Damage ${damage} too low to penetrate armor (need 5+ or explosive)`);
                return; // No damage to armored enemy
            }
        } else {
            // Normal damage
            this.hp -= damage;
        }
    }



    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        if (this.glitched && this.isGlitching) {
            ctx.fillStyle = getRandomGlitchColor();
        } else {
            ctx.fillStyle = '#4aff44ff';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 20, 20);
        ctx.fillStyle = '#2bff00ff';
        ctx.fillRect(this.x + 10, this.y + 10, 10, 10);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Tank {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 40;
        this.speed = .75;
        this.hp = 5;
        this.maxHp = this.hp;
        this.damage = 25;
        this.worth = 75;
    }

    update(deltaTime) {
        updateEnemyWithGlitch(this, deltaTime);
    }


    // Add to each enemy class
    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1; // Start heading to waypoint 1 (0 is spawn)
        this.pathProgress = 0;
    }

    // Update their movement logic to follow path instead of straight down
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

            // Check if enemy reached the base (within 30 pixels of center)
            if (distance <= 30) {
                // Deal damage to base and mark enemy for removal
                if (window.game) {
                    window.game.takeDamage(this.damage);
                    window.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                }
                this.hp = 0; // Mark for removal
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 16;
                this.y += (dy / distance) * this.speed * deltaTime / 16;
            }
            return;
        }

        // Move toward current waypoint (keep enemy center on path)
        const target = this.path[this.currentWaypoint];
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;

        const dx = target.x - enemyCenterX;
        const dy = target.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Reached waypoint, move to next
            this.currentWaypoint++;
        } else {
            // Move toward waypoint (this moves the enemy's top-left corner)
            this.x += (dx / distance) * this.speed * deltaTime / 16;
            this.y += (dy / distance) * this.speed * deltaTime / 16;
        }
    }



    // Replace the existing takeDamage method in each enemy class with this enhanced version:
    takeDamage(damage = 1, isExplosive = false) {
        // Handle glitched enemies
        if (this.glitched && this.isGlitching) {
            console.log('Glitched enemy is invulnerable - damage ignored!');
            return; // No damage during glitch phase
        }

        // Handle fortified enemies
        if (this.fortified && !this.armorBroken) {
            // Armor only takes damage from explosive/high damage attacks
            if (isExplosive || damage >= 5) {
                this.armorHp -= damage;
                console.log(`Armor took ${damage} damage. Armor HP: ${this.armorHp}`);

                if (this.armorHp <= 0) {
                    this.armorBroken = true;
                    this.fortified = false; // Remove fortified status
                    console.log('Armor broken! Enemy is now vulnerable to all damage.');
                }
            } else {
                console.log(`Damage ${damage} too low to penetrate armor (need 5+ or explosive)`);
                return; // No damage to armored enemy
            }
        } else {
            // Normal damage
            this.hp -= damage;
        }
    }


    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        if (this.glitched && this.isGlitching) {
            ctx.fillStyle = getRandomGlitchColor();
        } else {
            ctx.fillStyle = '#666666';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x, this.y + this.height - 8, this.width, 8);
        ctx.fillRect(this.x, this.y, this.width, 8);

        ctx.fillStyle = '#555555';
        ctx.fillRect(this.x + 15, this.y + 10, 20, 20);

        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x + 22, this.y + 30, 6, 15);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Sprinter1 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.speed = 4;
        this.hp = 1;
        this.maxHp = this.hp;
        this.damage = 15;
        this.worth = 25;

    }

    update(deltaTime) {
        updateEnemyWithGlitch(this, deltaTime);
    }

    // Add to each enemy class
    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1; // Start heading to waypoint 1 (0 is spawn)
        this.pathProgress = 0;
    }

    // Update their movement logic to follow path instead of straight down
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

            // Check if enemy reached the base (within 30 pixels of center)
            if (distance <= 30) {
                // Deal damage to base and mark enemy for removal
                if (window.game) {
                    window.game.takeDamage(this.damage);
                    window.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                }
                this.hp = 0; // Mark for removal
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 16;
                this.y += (dy / distance) * this.speed * deltaTime / 16;
            }
            return;
        }

        // Move toward current waypoint (keep enemy center on path)
        const target = this.path[this.currentWaypoint];
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;

        const dx = target.x - enemyCenterX;
        const dy = target.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Reached waypoint, move to next
            this.currentWaypoint++;
        } else {
            // Move toward waypoint (this moves the enemy's top-left corner)
            this.x += (dx / distance) * this.speed * deltaTime / 16;
            this.y += (dy / distance) * this.speed * deltaTime / 16;
        }
    }

    // Replace the existing takeDamage method in each enemy class with this enhanced version:
    takeDamage(damage = 1, isExplosive = false) {
        // Handle glitched enemies
        if (this.glitched && this.isGlitching) {
            console.log('Glitched enemy is invulnerable - damage ignored!');
            return; // No damage during glitch phase
        }

        // Handle fortified enemies
        if (this.fortified && !this.armorBroken) {
            // Armor only takes damage from explosive/high damage attacks
            if (isExplosive || damage >= 5) {
                this.armorHp -= damage;
                console.log(`Armor took ${damage} damage. Armor HP: ${this.armorHp}`);

                if (this.armorHp <= 0) {
                    this.armorBroken = true;
                    this.fortified = false; // Remove fortified status
                    console.log('Armor broken! Enemy is now vulnerable to all damage.');
                }
            } else {
                console.log(`Damage ${damage} too low to penetrate armor (need 5+ or explosive)`);
                return; // No damage to armored enemy
            }
        } else {
            // Normal damage
            this.hp -= damage;
        }
    }


    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        if (this.isDashing) {
            ctx.fillStyle = '#ff66ff';
        } else if (this.dashTimer > this.dashCooldown - 1000) {
            ctx.fillStyle = '#ffaaff';
        } else {
            ctx.fillStyle = '#ff00ea';
        }

        if (this.glitched && this.isGlitching) {
            ctx.fillStyle = getRandomGlitchColor();
        }

        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.isDashing) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x - 10 - i * 5, this.y + 5 + i * 5);
                ctx.lineTo(this.x - 5 - i * 5, this.y + 10 + i * 5);
                ctx.stroke();
            }
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 15, 15);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 10, this.y + 10, 5, 5);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Sprinter2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.speed = 4.5;
        this.hp = 3;
        this.maxHp = this.hp;
        this.damage = 25;
        this.worth = 50;

    }

    update(deltaTime) {
        updateEnemyWithGlitch(this, deltaTime);
    }

    // Add to each enemy class
    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1; // Start heading to waypoint 1 (0 is spawn)
        this.pathProgress = 0;
    }

    // Update their movement logic to follow path instead of straight down
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

            // Check if enemy reached the base (within 30 pixels of center)
            if (distance <= 30) {
                // Deal damage to base and mark enemy for removal
                if (window.game) {
                    window.game.takeDamage(this.damage);
                    window.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                }
                this.hp = 0; // Mark for removal
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 16;
                this.y += (dy / distance) * this.speed * deltaTime / 16;
            }
            return;
        }

        // Move toward current waypoint (keep enemy center on path)
        const target = this.path[this.currentWaypoint];
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;

        const dx = target.x - enemyCenterX;
        const dy = target.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Reached waypoint, move to next
            this.currentWaypoint++;
        } else {
            // Move toward waypoint (this moves the enemy's top-left corner)
            this.x += (dx / distance) * this.speed * deltaTime / 16;
            this.y += (dy / distance) * this.speed * deltaTime / 16;
        }
    }

    // Replace the existing takeDamage method in each enemy class with this enhanced version:
    takeDamage(damage = 1, isExplosive = false) {
        // Handle glitched enemies
        if (this.glitched && this.isGlitching) {
            console.log('Glitched enemy is invulnerable - damage ignored!');
            return; // No damage during glitch phase
        }

        // Handle fortified enemies
        if (this.fortified && !this.armorBroken) {
            // Armor only takes damage from explosive/high damage attacks
            if (isExplosive || damage >= 5) {
                this.armorHp -= damage;
                console.log(`Armor took ${damage} damage. Armor HP: ${this.armorHp}`);

                if (this.armorHp <= 0) {
                    this.armorBroken = true;
                    this.fortified = false; // Remove fortified status
                    console.log('Armor broken! Enemy is now vulnerable to all damage.');
                }
            } else {
                console.log(`Damage ${damage} too low to penetrate armor (need 5+ or explosive)`);
                return; // No damage to armored enemy
            }
        } else {
            // Normal damage
            this.hp -= damage;
        }
    }


    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        if (this.isDashing) {
            ctx.fillStyle = '#6670ffff';
        } else if (this.dashTimer > this.dashCooldown - 1000) {
            ctx.fillStyle = '#acaaffff';
        } else {
            ctx.fillStyle = '#1100ffff';
        }

        if (this.glitched && this.isGlitching) {
            ctx.fillStyle = getRandomGlitchColor();
        }

        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.isDashing) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x - 10 - i * 5, this.y + 5 + i * 5);
                ctx.lineTo(this.x - 5 - i * 5, this.y + 10 + i * 5);
                ctx.stroke();
            }
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 15, 15);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 10, this.y + 10, 5, 5);

        renderFortifiedArmor(ctx, this);
        renderGlitchOverlay(ctx, this);
        ctx.globalAlpha = originalAlpha;
    }
}

class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = .5;
        this.hp = 100;
        this.damage = 50;
        this.worth = 2500;
    }

    update(deltaTime) {
        updateEnemyWithGlitch(this, deltaTime);
    }

    // Add to each enemy class
    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1; // Start heading to waypoint 1 (0 is spawn)
        this.pathProgress = 0;
    }

    // Update their movement logic to follow path instead of straight down
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

            // Check if enemy reached the base (within 30 pixels of center)
            if (distance <= 30) {
                // Deal damage to base and mark enemy for removal
                if (window.game) {
                    window.game.takeDamage(this.damage);
                    window.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                }
                this.hp = 0; // Mark for removal
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed * deltaTime / 16;
                this.y += (dy / distance) * this.speed * deltaTime / 16;
            }
            return;
        }

        // Move toward current waypoint (keep enemy center on path)
        const target = this.path[this.currentWaypoint];
        const enemyCenterX = this.x + this.width / 2;
        const enemyCenterY = this.y + this.height / 2;

        const dx = target.x - enemyCenterX;
        const dy = target.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Reached waypoint, move to next
            this.currentWaypoint++;
        } else {
            // Move toward waypoint (this moves the enemy's top-left corner)
            this.x += (dx / distance) * this.speed * deltaTime / 16;
            this.y += (dy / distance) * this.speed * deltaTime / 16;
        }
    }


    // Replace the existing takeDamage method in each enemy class with this enhanced version:
    takeDamage(damage = 1, isExplosive = false) {
        // Handle glitched enemies
        if (this.glitched && this.isGlitching) {
            console.log('Glitched enemy is invulnerable - damage ignored!');
            return; // No damage during glitch phase
        }

        // Handle fortified enemies
        if (this.fortified && !this.armorBroken) {
            // Armor only takes damage from explosive/high damage attacks
            if (isExplosive || damage >= 5) {
                this.armorHp -= damage;
                console.log(`Armor took ${damage} damage. Armor HP: ${this.armorHp}`);

                if (this.armorHp <= 0) {
                    this.armorBroken = true;
                    this.fortified = false; // Remove fortified status
                    console.log('Armor broken! Enemy is now vulnerable to all damage.');
                }
            } else {
                console.log(`Damage ${damage} too low to penetrate armor (need 5+ or explosive)`);
                return; // No damage to armored enemy
            }
        } else {
            // Normal damage
            this.hp -= damage;
        }
    }


    render(ctx) {
        const originalAlpha = beginEnhancedEnemyRender(ctx, this);

        if (this.glitched && this.isGlitching) {
            ctx.fillStyle = getRandomGlitchColor();
        } else {
            ctx.fillStyle = '#2b2b2bff';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 40, 40);
        ctx.fillStyle = '#1d1d1dff';
        ctx.fillRect(this.x + 10, this.y + 10, 30, 30);

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
                // Deal massive damage and mark for removal
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
