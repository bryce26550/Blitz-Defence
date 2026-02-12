class Enemy {
    constructor(x, y, multiplier = 1) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 1 * multiplier;
        this.hp = Math.ceil(1 * multiplier);
        this.contactDamage = Math.ceil(1 * multiplier);
    }

    update(deltaTime) {
        this.followPath(deltaTime);
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


    takeDamage(damage = 1) {
        this.hp -= damage;
    }


    render(ctx) {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 20, 20);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 10, this.y + 10, 10, 10);
    }
}

class Shooter {
    constructor(x, y, multiplier = 1) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 0.8 * multiplier;
        this.hp = Math.ceil(1 * multiplier);
        this.contactDamage = Math.ceil(2 * multiplier);
    }

    // Add to each enemy class
    setPath(waypoints) {
        this.path = waypoints;
        this.currentWaypoint = 1; // Start heading to waypoint 1 (0 is spawn)
        this.pathProgress = 0;
    }

    update(deltaTime) {
        this.followPath(deltaTime);
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


    takeDamage(damage = 1) {
        this.hp -= damage;
    }


    render(ctx) {
        ctx.fillStyle = '#4444ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y + 5, 20, 20);
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(this.x + 12, this.y + 25, 6, 8);
    }
}

class Tank {
    constructor(x, y, multiplier = 1) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 40;
        this.speed = 0.3 * multiplier;
        this.hp = Math.ceil(5 * multiplier);
        this.maxHp = Math.ceil(this.hp * multiplier);
        this.contactDamage = Math.ceil(2 * multiplier);
    }

    update(deltaTime) {
        this.followPath(deltaTime);
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



    takeDamage(damage = 1) {
        this.hp -= damage;
    }

    render(ctx) {
        ctx.fillStyle = '#666666';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x, this.y + this.height - 8, this.width, 8);
        ctx.fillRect(this.x, this.y, this.width, 8);

        ctx.fillStyle = '#555555';
        ctx.fillRect(this.x + 15, this.y + 10, 20, 20);

        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x + 22, this.y + 30, 6, 15);

        // Health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 8, this.width, 4);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - 8, (this.hp / this.maxHp) * this.width, 4);
    }
}

class Sprinter {
    constructor(x, y, multiplier = 1) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.speed = 4 * multiplier;
        this.hp = Math.ceil(1 * multiplier);
        this.maxHp = Math.ceil(1 * multiplier);
        this.contactDamage = Math.ceil(1 * multiplier);

    }

    update(deltaTime) {
        this.followPath(deltaTime);
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




    takeDamage(damage = 1) {
        this.hp -= damage;
    }

    render(ctx) {
        if (this.isDashing) {
            ctx.fillStyle = '#ff66ff';
        } else if (this.dashTimer > this.dashCooldown - 1000) {
            ctx.fillStyle = '#ffaaff';
        } else {
            ctx.fillStyle = '#ff00ea';
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
        ctx.fillRect(this.x + 10, this.y + 8, 5, 5);
    }
}
