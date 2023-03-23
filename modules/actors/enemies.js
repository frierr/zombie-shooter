import { createZombieModel, drawBlood } from "../graphics.js";
import { objectsOverlapPlayer } from "../basics.js";

const zombie_default_hp = 50;
const zombie_damaged_hp = 15;
const zombie_move_speed = 5;
const zombie_damage = 10;
const zombie_damage_rate = 60;

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
    constructor(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        this.hp = zombie_default_hp;
        this.speed = zombie_move_speed;
        this.damage = zombie_damage;
        this.damage_rate = zombie_damage_rate;
        this.model = createZombieModel(x, y);
    }
    move(player) {
        //get dx/dy - to player location
        //calculate angle - dx and dy
        var dx = this.pos.x - player.pos.x;
        var dy = this.pos.y - player.pos.y;
        //normalise
        const sum = Math.abs(dx) + Math.abs(dy);
        dx = (-1) * dx / sum;
        dy = (-1) * dy / sum;
        this.pos.x += dx * this.speed;
        this.pos.y += dy * this.speed;
        this.model.style.left = (this.pos.x - 15) + "px";
        this.model.style.top = (this.pos.y - 15) + "px";
        this.#fixDamageRate();
        this.#look(player);
    }
    #fixDamageRate() {
        if (this.damage_rate < zombie_damage_rate) {
            this.damage_rate++;
        }
    }
    #look(player) {
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
    receiveDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            //dead
            drawBlood(this.pos.x, this.pos.y, 0);
        } else {
            //damaged
            drawBlood(this.pos.x, this.pos.y, 1);
            if(this.hp >= zombie_damaged_hp) {
                this.model.style.backgroundImage = "url(./data/enemies/zombie_half.png)";
            } else {
                this.model.style.backgroundImage = "url(./data/enemies/zombie_min.png)";
            }
        }
    }
    isAlive() {
        return this.hp > 0;
    }
}

export function spawnNewEnemy() {
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
    return new Zombie(x1, y1);
}