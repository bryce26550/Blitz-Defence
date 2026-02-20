class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 0.3;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.shootCooldown = 0;
        this.shootCooldownMax = 200;
        this.damage = 1;
        this.bulletSpeed = 0.5;
        this.pierce = 1;
        this.ricochet = false;
        this.ricochetBounces = 0;
        this.multiShot = 1;
        this.lifeSteal = false;
        this.lockIn = false
        this.lockInDistance = 0

        // Customization - 10 colors
        this.shellColorChoices = ['#00ff00', '#00aaffff', '#8c00ffff', '#00ffffff', '#ff6600', '#ff0000ff', '#ff69b4', '#9370db', '#ffd700', '#4d4d4dff'];
        this.colorIndex = 0;
        this.color = this.shellColorChoices[this.colorIndex];

        // Body shape (outer shell) - 7 shapes
        this.bodyShapeIndex = 2; // Default to square
        this.bodyShapeNames = ['Triangle', 'Circle', 'Square', 'Star', 'Diamond', 'Hexagon', 'Cross'];

        // Inner shape (white inner design) - 7 shapes  
        this.innerShapeIndex = 0; // Default to triangle
        this.innerShapeNames = ['Triangle', 'Circle', 'Square', 'Star', 'Diamond', 'Hexagon', 'Cross'];

        // Legacy compatibility
        this.shapeIndex = this.innerShapeIndex;
        this.shapeNames = this.innerShapeNames;
    }

    update(deltaTime) {
        this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);

    }

    shoot(bullets, tx, ty) {
        this.shootTo(bullets, tx, ty);
    }

    shootTo(bullets, tx, ty) {
        if (this.shootCooldown > 0) return;
        this.shootCooldown = this.shootCooldownMax;

        tx = tx === undefined ? this.x + this.width / 2 : tx;
        ty = ty === undefined ? this.y - 10 : ty;

        const dx = tx - (this.x + this.width / 2);
        const dy = ty - (this.y + this.height / 2);
        const baseAngle = Math.atan2(dy, dx);

        const spreadAngle = this.multiShot > 1 ? 0.25 : 0;
        const startAngle = baseAngle - (this.multiShot - 1) * spreadAngle / 2;

        for (let i = 0; i < this.multiShot; i++) {
            const angle = startAngle + i * spreadAngle;
            const speed = this.bulletSpeed;
            const bullet = new Bullet(this.x + this.width / 2 - 2, this.y + this.height / 2, true);
            bullet.damage = this.damage;
            bullet.pierce = this.pierce;
            bullet.ricochet = this.ricochet;
            bullet.lockIn = this.lockIn;
            bullet.ricochetBounces = this.ricochet ? (this.ricochetBounces || 2) : 0;
            bullet.vx = Math.cos(angle) * speed;
            bullet.vy = Math.sin(angle) * speed;
            bullets.push(bullet);
            this.game.playSound('playerShot');

        }
    }

    cycleShellColor() {
        this.colorIndex = (this.colorIndex + 1) % this.shellColorChoices.length;
        this.color = this.shellColorChoices[this.colorIndex];
    }

    cycleBodyShape() {
        this.bodyShapeIndex = (this.bodyShapeIndex + 1) % 7;
    }

    cycleInnerShape() {
        this.innerShapeIndex = (this.innerShapeIndex + 1) % 7;
        this.shapeIndex = this.innerShapeIndex; // legacy compatibility
    }

    // Legacy method
    cycleShape() {
        this.cycleInnerShape();
    }


    // Draw the body shape (colored outer shell)
    drawBodyShape(ctx) {
        ctx.fillStyle = this.color;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const size = Math.min(this.width, this.height);

        switch (this.bodyShapeIndex) {
            case 0: // Triangle
                ctx.beginPath();
                ctx.moveTo(centerX, this.y + 2);
                ctx.lineTo(this.x + 2, this.y + this.height - 2);
                ctx.lineTo(this.x + this.width - 2, this.y + this.height - 2);
                ctx.closePath();
                ctx.fill();
                break;

            case 1: // Circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 2: // Square
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;

            case 3: // Star
                this.drawStar(ctx, centerX, centerY, 5, size / 2 - 2, size / 4);
                break;

            case 4: // Diamond
                ctx.beginPath();
                ctx.moveTo(centerX, this.y + 2);
                ctx.lineTo(this.x + this.width - 2, centerY);
                ctx.lineTo(centerX, this.y + this.height - 2);
                ctx.lineTo(this.x + 2, centerY);
                ctx.closePath();
                ctx.fill();
                break;

            case 5: // Hexagon
                this.drawPolygon(ctx, centerX, centerY, 6, size / 2 - 2);
                break;

            case 6: // Cross
                const crossSize = size / 3;
                ctx.fillRect(centerX - crossSize / 2, this.y + 2, crossSize, this.height - 4);
                ctx.fillRect(this.x + 2, centerY - crossSize / 2, this.width - 4, crossSize);
                break;
        }
    }

    // Draw the inner shape (white inner design)
    drawInnerShape(ctx, centerX, centerY, size) {
        ctx.fillStyle = '#ffffff';

        switch (this.innerShapeIndex) { // Changed from this.innerShapeIndex to this.innerShapeIndex
            case 0: // Triangle
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - size / 2);
                ctx.lineTo(centerX - size / 2, centerY + size / 2);
                ctx.lineTo(centerX + size / 2, centerY + size / 2);
                ctx.closePath();
                ctx.fill();
                break;

            case 1: // Circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 2: // Square
                ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
                break;

            case 3: // Star
                this.drawStar(ctx, centerX, centerY, 5, size / 2, size / 4);
                break;

            case 4: // Diamond
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - size / 2);
                ctx.lineTo(centerX + size / 2, centerY);
                ctx.lineTo(centerX, centerY + size / 2);
                ctx.lineTo(centerX - size / 2, centerY);
                ctx.closePath();
                ctx.fill();
                break;

            case 5: // Hexagon
                this.drawPolygon(ctx, centerX, centerY, 6, size / 2);
                break;

            case 6: // Cross
                const crossSize = size / 3;
                ctx.fillRect(centerX - crossSize / 2, centerY - size / 2, crossSize, size);
                ctx.fillRect(centerX - size / 2, centerY - crossSize / 2, size, crossSize);
                break;
        }
    }

    // Helper methods for complex shapes
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    drawPolygon(ctx, cx, cy, sides, radius) {
        const angle = 2 * Math.PI / sides;
        ctx.beginPath();
        ctx.moveTo(cx + radius * Math.cos(0), cy + radius * Math.sin(0));

        for (let i = 1; i <= sides; i++) {
            ctx.lineTo(cx + radius * Math.cos(i * angle), cy + radius * Math.sin(i * angle));
        }

        ctx.closePath();
        ctx.fill();
    }

    render(ctx) {
        // Draw body shape (colored outer part)
        this.drawBodyShape(ctx);

        // Draw inner shape (white inner part)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        this.drawInnerShape(ctx, centerX, centerY, 18);
    }
}

class Bullet {
    constructor(x, y, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = isPlayer ? -0.5 : 0.3;
        this.vx = 0;
        this.vy = this.speed;
        this.damage = 1;
        this.pierce = 1;
        this.ricochet = false;
        this.ricochetBounces = 0;
        this.isPlayer = isPlayer;
    }

    update(deltaTime) {
        if (this.vx !== 0 || this.vy !== this.speed) {
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        } else {
            this.y += this.speed * deltaTime;
        }
    }

    render(ctx) {
        ctx.fillStyle = this.isPlayer ? '#ffff00' : '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.life = 1000;
        this.maxLife = 1000;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= deltaTime;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.fillRect(this.x, this.y, 3, 3);
    }
}
