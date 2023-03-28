import { createZombieModel, createFastZombieModel, createJugZombieModel, createJumperZombieModel, drawBlood } from "../graphics.js";
import { objectsOverlapPlayer, objectsOverlapOther } from "../basics.js";

const zombie_default_hp = 50;
const zombie_damaged_hp = 15;
const zombie_move_speed = 4;
const zombie_damage = 10;
const zombie_damage_rate = 60;
const jumper_recover_ticks = 60 * 3;
const jumper_airtime = 60 * 1.5;
const stunned_time = 60;

class Zombie {
    pos = {
        x: 0,
        y: 0
    };
    hp;
    speed;
    damage;
    damage_rate;
    model;
    immune = false;
    stunned = stunned_time;
    constructor(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        this.damage = zombie_damage;
        this.damage_rate = zombie_damage_rate;
    }
    move(player) {
        if (this.stunned >= stunned_time) {
            var d = this.#getAngleToTarget(player);
            this.pos.x += d[0] * this.speed;
            this.pos.y += d[1] * this.speed;
            this.#updateModelToCurrentLocation();
            this.look(player);
        }
        this.fixDamageRate();
    }
    #updateModelToCurrentLocation() {
        this.model.style.left = (this.pos.x - 15) + "px";
        this.model.style.top = (this.pos.y - 15) + "px";
    }
    #getAngleToTarget(object) {
        //get dx/dy - to target
        //calculate angle - dx and dy
        var dx = this.pos.x - object.pos.x;
        var dy = this.pos.y - object.pos.y;
        //normalise
        const sum = Math.abs(dx) + Math.abs(dy);
        dx = (-1) * dx / sum;
        dy = (-1) * dy / sum;
        return [dx, dy];
    }
    fixDamageRate() {
        if (this.damage_rate < zombie_damage_rate) {
            this.damage_rate++;
        }
        if (this.stunned < stunned_time) {
            this.stunned++;
        }
    }
    look(player) {
        if (this.model) {
            //turn model in player direction
            const angle = Math.atan2(this.pos.y - player.pos.y, this.pos.x - player.pos.x) * 180 / Math.PI;
            this.model.style.transform = "rotate(" + angle + "deg)";
        }
    }
    playerCollision(player) {
        if (objectsOverlapPlayer(this, player) && this.damage_rate >= zombie_damage_rate) {
            this.damage_rate = 0;
            player.takeDamage(this.damage);
        }
    }
    playerMeleeCollision(player) {
        if (objectsOverlapOther(this, player, -player.melee)) {
            this.pushAwayFrom(player, player.melee);
            this.stunned = 0;
        }
    }
    pushAwayFrom(object, distance) {
        var d = this.#getAngleToTarget(object);
        this.pos.x += d[0] * -distance;
        this.pos.y += d[1] * -distance;
        this.#updateModelToCurrentLocation();
    }
    receiveDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            //dead
            drawBlood(this.pos.x, this.pos.y, 0);
        } else {
            //damaged
            drawBlood(this.pos.x, this.pos.y, 1);
            this.#showDamage();
        }
    }
    #showDamage() {
        if(this.hp >= zombie_damaged_hp) {
            this.model.style.backgroundImage = "url(./data/enemies/zombie_half.png)";
        } else {
            this.model.style.backgroundImage = "url(./data/enemies/zombie_min.png)";
        }
    }
    isAlive() {
        return this.hp > 0;
    }
}

class BasicZombie extends Zombie {
    constructor(x, y) {
        super(x, y);
        this.speed = zombie_move_speed;
        this.hp = zombie_default_hp;
        this.model = createZombieModel(x, y);
    }
}

class FastZombie extends Zombie {
    constructor(x, y) {
        super(x, y);
        this.speed = zombie_move_speed * 2;
        this.hp = zombie_default_hp * 0.75;
        this.model = createFastZombieModel(x, y);
    }
    #showDamage() {
        if(this.hp >= zombie_damaged_hp) {
            this.model.style.backgroundImage = "url(./data/enemies/fast_zombie_half.png)";
        } else {
            this.model.style.backgroundImage = "url(./data/enemies/fast_zombie_min.png)";
        }
    }
}

class JuggernautZombie extends Zombie {
    constructor(x, y) {
        super(x, y);
        this.speed = zombie_move_speed / 2;
        this.hp = zombie_default_hp * 4;
        this.damage = zombie_damage * 2;
        this.damage_rate = zombie_damage_rate * 2;
        this.model = createJugZombieModel(x, y);
    }
    receiveDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            //dead
            drawBlood(this.pos.x, this.pos.y, 9);
        } else {
            //damaged
            drawBlood(this.pos.x, this.pos.y, 1);
            this.#showDamage();
        }
    }
    #showDamage() {
        //full hp - 200
        //damaged 1 - 150, damaged 2 - 120, 90, 45, 15
        if(this.hp >= zombie_damaged_hp * 10) {
            this.model.style.backgroundImage = "url(./data/enemies/jug_zombie_damaged_1.png)";
        } else if (this.hp >= zombie_damaged_hp * 8) {
            this.model.style.backgroundImage = "url(./data/enemies/jug_zombie_damaged_2.png)";
        } else if (this.hp >= zombie_damaged_hp * 6) {
            this.model.style.backgroundImage = "url(./data/enemies/jug_zombie_damaged_3.png)";
        } else if (this.hp >= zombie_damaged_hp * 3) {
            this.model.style.backgroundImage = "url(./data/enemies/jug_zombie_damaged_4.png)";
        } else if (this.hp >= zombie_damaged_hp) {
            this.model.style.backgroundImage = "url(./data/enemies/jug_zombie_damaged_5.png)";
        } else {
            this.model.style.backgroundImage = "url(./data/enemies/jug_zombie_min.png)";
        }
    }
}

class JumperZombie extends Zombie {
    recover;
    airtime;
    dx;
    dy;
    constructor(x, y) {
        super(x, y);
        this.speed = zombie_move_speed * 3;
        this.hp = zombie_default_hp * 2;
        this.damage = zombie_damage * 100;
        this.damage_rate = zombie_damage_rate * 10;
        this.model = createJumperZombieModel(x, y);
        this.recover = jumper_recover_ticks;
        this.airtime = 0;
        this.dx = 0;
        this.dy = 0;
    }
    move(player) {
        this.immune = false;
        if (this.airtime <= jumper_airtime) {
            this.immune = true;
            //move in air
            this.pos.x += this.dx * this.speed;
            this.pos.y += this.dy * this.speed;
            this.model.style.left = (this.pos.x - 15) + "px";
            this.model.style.top = (this.pos.y - 15) + "px";
            this.airtime++;
        } else if (this.recover >= jumper_recover_ticks) {
            //do jump
            this.dx = this.pos.x - player.pos.x;
            this.dy = this.pos.y - player.pos.y;
            const sum = Math.abs(this.dx) + Math.abs(this.dy);
            this.dx = (-1) * this.dx / sum;
            this.dy = (-1) * this.dy / sum;
            this.airtime = 0;
            this.recover = 0;
            this.look(player);
        } else {
            this.recover++;
            this.look(player);
        }
        this.fixDamageRate();
    }
    #showDamage() {
        if(this.hp >= zombie_damaged_hp) {
            this.model.style.backgroundImage = "url(./data/enemies/jumper_zombie_half.png)";
        } else {
            this.model.style.backgroundImage = "url(./data/enemies/jumper_zombie_min.png)";
        }
    }
}

export function spawnNewEnemy(type) {
    //enemy spawn should be out of bounds
    const selector = Math.round(Math.random() * 3);
    var x1 = 0, y1 = 0;
    switch(selector) {
        case 0: //north
            x1 = Math.random() * document.body.getBoundingClientRect().width;
            y1 = -100;
            break;
        case 1: //south
            x1 = Math.random() * document.body.getBoundingClientRect().width;
            y1 = document.body.getBoundingClientRect().height + 100;
            break;
        case 2: //west
            x1 = -100;
            y1 = Math.random() * document.body.getBoundingClientRect().height;
            break;
        case 3: //east
            x1 = document.body.getBoundingClientRect().width + 100;
            y1 = Math.random() * document.body.getBoundingClientRect().height;
            break;
        default:
            break;
    }
    switch(type) {
        case 1:
            return new FastZombie(x1, y1);
        case 2:
            return new JuggernautZombie(x1, y1);
        case 3:
            return new JumperZombie(x1, y1);
        default:
            return new BasicZombie(x1, y1);
    }
}