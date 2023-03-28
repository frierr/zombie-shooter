import { createBulletModel, createRocketModel, createExplosionModel, drawExplosion } from "../graphics.js";

class Bullet {
    pos = {
        x: 0,
        y: 0
    };
    dir = {
        dx: 0,
        dy: 0
    };
    speed;
    damage;
    model;
    ttl;
    constructor (x, y, dx, dy, speed, damage, ttl) {
        this.pos.x = x;
        this.pos.y = y;
        this.dir.dx = dx;
        this.dir.dy = dy;
        this.speed = speed;
        this.damage = damage;
        this.ttl = ttl;
        this.model = createBulletModel(x, y);
    }
    move() {
        this.pos.x += this.dir.dx * this.speed;
        this.pos.y += this.dir.dy * this.speed;
        this.model.style.left = (this.pos.x - 2) + "px";
        this.model.style.top = (this.pos.y - 2) + "px";
    }
    checkBounds() {
        if ((this.pos.x < 0 || this.pos.x > document.body.getBoundingClientRect().width) || (this.pos.y < 0 || this.pos.y > document.body.getBoundingClientRect().height)){
            return false;
        } else {
            return true;
        }
    }
}

class Rocket extends Bullet {
    live;
    explosion_damage;
    exploded;
    constructor (x, y, dx, dy, speed, damage, ttl) {
        super(x, y, dx, dy, speed, damage, ttl);
        this.ttl = 0;
        this.live = ttl;
        this.damage = 0;
        this.explosion_damage = damage;
        this.exploded = false;
        this.model.remove();
        this.model = createRocketModel(x, y);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        this.model.style.transform = "rotate(" + angle + "deg)";
    }
    move() {
        if (this.exploded) {
            this.live--;
            if (this.live == 0) {
                this.remove();
            }
        } else {
            this.pos.x += this.dir.dx * this.speed;
            this.pos.y += this.dir.dy * this.speed;
            this.model.style.left = (this.pos.x - 2) + "px";
            this.model.style.top = (this.pos.y - 2) + "px";
            this.live--;
            if (this.live == 0) {
                this.explode();
            }
        }
    }
    explode() {
        this.exploded = true;
        this.speed = 0;
        this.model.remove();
        this.model = createExplosionModel(this.pos.x, this.pos.y);
        this.damage = this.explosion_damage;
        this.ttl = 99999;
        this.live = 1;
        drawExplosion(this.pos.x, this.pos.y);
    }
    remove() {
        this.ttl = 0;
        this.live = 90;
        this.pos.x = -1000;
    }
}

export function fireProjectile(x1, y1, x2, y2, bullet_speed, bullet_damage, ttl) {
    const d = getNormalisedDifference(x1, y1, x2, y2);
    //create projectile
    return [new Bullet(x1, y1, d[0], d[1], bullet_speed, bullet_damage, ttl)];
}

export function fireBulletSpread(x1, y1, x2, y2, bullet_speed, bullet_damage, spread) {
    const spread_step = spread / 3;
    const steps = 7;
    const d = getNormalisedDifference(x1, y1, x2, y2);
    var angle = Math.atan2(d[1], d[0]) * 180 / Math.PI;
    var bullets = [];
    const r2 = d[0] * d[0] + d[1] * d[1];
    const r = fastRoot(r2, fastRoot(r2, Math.max(Math.abs(d[0]), Math.abs(d[1]))));
    angle += spread;
    for (var i = 0; i < steps; i++) {
        bullets.push(new Bullet(x1, y1, r * Math.cos((angle * Math.PI) / 180), r * Math.sin((angle * Math.PI) / 180), bullet_speed, bullet_damage, 0));
        angle -= spread_step;
    }
    return bullets;
}

export function fireRocket(x1, y1, x2, y2, speed, damage, ttl) {
    const d = getNormalisedDifference(x1, y1, x2, y2);
    return [new Rocket(x1, y1, d[0], d[1], speed, damage, ttl)];
}

function getNormalisedDifference(x1, y1, x2, y2) {
    //calculate angle - dx and dy
    var dx = x1 - x2;
    var dy = y1 - y2;
    //normalise
    return normalise(dx, dy);
}

function normalise(dx, dy) {
    const sum = Math.abs(dx) + Math.abs(dy);
    dx = (-1) * dx / sum;
    dy = (-1) * dy / sum;
    return [dx, dy];
}

function fastRoot(number, approximation) {
    return 0.5 * (number / approximation + approximation);
}