import { createBulletModel } from "../graphics.js";

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
    constructor (x, y, dx, dy, speed, damage) {
        this.pos.x = x;
        this.pos.y = y;
        this.dir.dx = dx;
        this.dir.dy = dy;
        this.speed = speed;
        this.damage = damage;
        this.model = createBulletModel(x, y);
    };
    move() {
        this.pos.x += this.dir.dx * this.speed;
        this.pos.y += this.dir.dy * this.speed;
        this.model.style.left = (this.pos.x - 2) + "px";
        this.model.style.top = (this.pos.y - 2) + "px";
    };
    checkBounds() {
        if ((this.pos.x < 0 || this.pos.x > document.body.getBoundingClientRect().width) || (this.pos.y < 0 || this.pos.y > document.body.getBoundingClientRect().height)){
            return false;
        } else {
            return true;
        }
    };
}

export function fireProjectile(x1, y1, x2, y2, bullet_speed, bullet_damage) {
    //calculate angle - dx and dy
    var dx = x1 - x2;
    var dy = y1 - y2;
    //normalise
    const sum = Math.abs(dx) + Math.abs(dy);
    dx = (-1) * dx / sum;
    dy = (-1) * dy / sum;
    //create projectile
    return new Bullet(x1, y1, dx, dy, bullet_speed, bullet_damage);
}