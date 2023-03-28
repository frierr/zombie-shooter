import { createPlayerModel, createPlayerGraphics, updatePlayerAppearance } from "../graphics.js";
import { fireBulletSpread, fireProjectile, fireRocket } from "./projectiles.js";
import { displayPlayerWeapon, displayPlayerAmmo, displayPlayerHP, displayLog } from "../interface.js";

const player_default_hp = 100;
const player_default_ammo = 40;
const angled_var = Math.sqrt(2) / 2;
const move_speed = 9;
const gun_fire_rate = 60 / 3; //gun bpm
const gun_bullet_speed = 20;
const gun_bullet_damage = 30;
const ar_fire_rate = 60 / 10; //ar bpm
const ar_bullet_speed = 40;
const ar_bullet_damage = 10;
const item_health_value = 30;
const melee_cooldown = 60 * 3;
const melee_radius = 20;
const rifle_fire_rate = 60 * 1.5;
const rifle_bullet_speed = 60;
const rifle_bullet_damage = 60;
const rifle_bullet_penetration = 3;
const shotgun_fire_rate = 60 / 2;
const shotgun_bullet_speed = 20;
const shotgun_bullet_damage = 5;
const shotgun_bullet_spread = 15;
const rocket_fire_rate = 60 * 5;
const rocket_speed = 30;
const rocket_damage = 500;
const rocket_ttl = 30;

export class Player {
    pos = {
        x: 0,
        y: 0
    };
    personality;
    model;
    hp;
    maxhp;
    inv;
    inv_selected;
    cooldown;
    speed;
    melee_cd;
    melee;
    constructor() {
        this.pos.x = document.body.getBoundingClientRect().width / 2;
        this.pos.y = document.body.getBoundingClientRect().height / 2;
        this.model = createPlayerModel(this.pos);
        this.personality = new Personality(this.model);
        this.hp = player_default_hp + (this.personality.isMale ? 10 : 0);
        this.maxhp = player_default_hp + (this.personality.isMale ? 10 : 0);
        this.inv = [["Handgun", player_default_ammo]];
        this.inv_selected = 0;
        this.cooldown = 0;
        this.speed = move_speed + (this.personality.isMale ? 0 : 2);
        this.melee_cd = 0;
        this.melee = 0;
    }
    isAlive() {
        return this.hp > 0;
    }
    look(mouseX, mouseY) {
        if (this.model) {
            //turn model in mouse direction
            const angle = Math.atan2(this.pos.y - mouseY, this.pos.x - mouseX) * 180 / Math.PI;
            this.model.style.transform = "rotate(" + angle + "deg)";
        }
    }
    move(keys_pressed) {
        //get direction
        const Xaxis = 0 + (keys_pressed[1] ? -1 : 0) + (keys_pressed[3] ? 1 : 0);
        const Yaxis = 0 + (keys_pressed[0] ? -1 : 0) + (keys_pressed[2] ? 1 : 0);
        if (Xaxis != 0 || Yaxis != 0) {
            //do movement
            if (Xaxis != 0) {
                if (Yaxis != 0) {
                    this.pos.x = this.pos.x + Xaxis * this.speed * angled_var;
                    this.pos.y = this.pos.y + Yaxis * this.speed * angled_var;
                } else {
                    this.pos.x = this.pos.x + Xaxis * this.speed;
                }
            } else {
                this.pos.y = this.pos.y + Yaxis * this.speed;
            }
            //correct position
            if (this.pos.x < 0) {
                this.pos.x = 0;
            } else if (this.pos.x > document.body.getBoundingClientRect().width) {
                this.pos.x = document.body.getBoundingClientRect().width;
            }
            if (this.pos.y < 0) {
                this.pos.y = 0;
            } else if (this.pos.y > document.body.getBoundingClientRect().height) {
                this.pos.y = document.body.getBoundingClientRect().height;
            }
            this.updateModelPos();
        }
    }
    updateModelPos() {
        this.model.style.left = (this.pos.x - 15) + "px";
        this.model.style.top = (this.pos.y - 15) + "px";
    }
    tickCooldown() {
        this.cooldown--;
        this.cooldown = Math.max(0, this.cooldown);
        this.melee_cd--;
        this.melee_cd = Math.max(0, this.melee_cd);
        if(this.melee_cd == melee_cooldown - 5) {
            this.melee = 0;
        }
    }
    attack(mouseX, mouseY) {
        switch (this.inv[this.inv_selected][0]) {
            case "AR":
                return this.#spawnARProjectiles(mouseX, mouseY);
            case "Rifle":
                return this.#spawnRifleProjectiles(mouseX, mouseY);
            case "Shotgun":
                return this.#spawnShotgunProjectiles(mouseX, mouseY);
            case "Bazooka":
                return this.#spawnRocketProjectiles(mouseX, mouseY);
            default:
                return this.#spawnGunProjectiles(mouseX, mouseY);
        }
    }
    #spawnGunProjectiles(mouseX, mouseY) {
        this.inv[this.inv_selected][1]--;
        this.cooldown = gun_fire_rate;
        return fireProjectile(this.pos.x, this.pos.y, mouseX, mouseY, gun_bullet_speed, gun_bullet_damage, 0);
    }
    #spawnARProjectiles(mouseX, mouseY) {
        this.inv[this.inv_selected][1]--;
        this.cooldown = ar_fire_rate;
        return fireProjectile(this.pos.x, this.pos.y, mouseX, mouseY, ar_bullet_speed, ar_bullet_damage, 0);
    }
    #spawnRifleProjectiles(mouseX, mouseY) {
        this.inv[this.inv_selected][1]--;
        this.cooldown = rifle_fire_rate;
        return fireProjectile(this.pos.x, this.pos.y, mouseX, mouseY, rifle_bullet_speed, rifle_bullet_damage, rifle_bullet_penetration);
    }
    #spawnShotgunProjectiles(mouseX, mouseY) {
        this.inv[this.inv_selected][1]--;
        this.cooldown = shotgun_fire_rate;
        return fireBulletSpread(this.pos.x, this.pos.y, mouseX, mouseY, shotgun_bullet_speed, shotgun_bullet_damage, shotgun_bullet_spread);
    }
    #spawnRocketProjectiles(mouseX, mouseY) {
        this.inv[this.inv_selected][1]--;
        this.cooldown = rocket_fire_rate;
        return fireRocket(this.pos.x, this.pos.y, mouseX, mouseY, rocket_speed, rocket_damage, rocket_ttl);
    }
    receiveItem(item_received) {
        switch(item_received) {
            case "AR":
                this.inv.push(["AR", 100]);
                this.inv_selected++;
                this.personality.appearance[0] = this.inv_selected;
                this.personality.updateAppearance();
                displayPlayerWeapon(this.inv[this.inv_selected]);
                displayLog("AR!", this.pos);
                break;
            case "Rifle":
                this.inv.push(["Rifle", 15]);
                this.inv_selected++;
                this.personality.appearance[0] = this.inv_selected;
                this.personality.updateAppearance();
                displayPlayerWeapon(this.inv[this.inv_selected]);
                displayLog("Rifle!", this.pos);
                break;
            case "Shotgun":
                this.inv.push(["Shotgun", 15]);
                this.inv_selected++;
                this.personality.appearance[0] = this.inv_selected;
                this.personality.updateAppearance();
                displayPlayerWeapon(this.inv[this.inv_selected]);
                displayLog("Shotgun!", this.pos);
                break;
            case "Bazooka":
                this.inv.push(["Bazooka", 1]);
                this.inv_selected++;
                this.personality.appearance[0] = this.inv_selected;
                this.personality.updateAppearance();
                displayPlayerWeapon(this.inv[this.inv_selected]);
                displayLog("Bazooka!", this.pos);
                break;
            case "Ammo":
                switch (this.inv[this.inv_selected][0]) {
                    case "Handgun":
                        this.inv[this.inv_selected][1] += 20;
                        break;
                    case "AR":
                        this.inv[this.inv_selected][1] += 50;
                        break;
                    case "Rifle":
                        this.inv[this.inv_selected][1] += 10;
                        break;
                    case "Shotgun":
                        this.inv[this.inv_selected][1] += 10;
                        break;
                    case "Bazooka":
                        this.inv[this.inv_selected][1] += 1;
                        break;
                    default:
                        break;
                }
                displayPlayerAmmo(this.inv[this.inv_selected][1]);
                displayLog("+AMMO!", this.pos);
                break;
            case "Health":
                this.hp += item_health_value;
                if (this.hp > this.maxhp) {
                    this.maxhp == this.hp;
                }
                displayPlayerHP(this.hp, this.maxhp);
                displayLog("+HP!", this.pos);
                break;
            default:
                break;
        };
    }
    takeDamage(damage) {
        this.hp = Math.max(0, this.hp - damage);
        displayPlayerHP(this.hp, this.maxhp);
        displayLog("OUCH", this.pos);
    }
    changeWeapon() {
        this.inv_selected++;
        if (this.inv_selected >= this.inv.length) {
            this.inv_selected = 0;
        }
        this.cooldown = 0;
        this.personality.appearance[0] = this.inv_selected;
        this.personality.updateAppearance();
        displayPlayerWeapon(this.inv[this.inv_selected]);
    }
    meleeAttack() {
        if(this.melee_cd <= 0) {
            this.melee = melee_radius;
            this.melee_cd = melee_cooldown;
        }
    }
}

class Personality {
    isMale;
    name;
    surname;
    appearance;
    graphics;
    constructor(model) {
        this.isMale = (Math.random() > 0.5);
        this.name = (this.isMale ? Personality.getMaleName() : Personality.getFemaleName());
        this.surname = Personality.getSurname();
        this.appearance = [
            0, //weapon to display, 0 - handgun, 1 - ar
            Math.round(Math.random() * 5), //body, 0 - 5
            Math.round(Math.random() * 3), //hairstyle, 0 - 3
            Math.round(Math.random() * 3) //hair colour, 0 - 3
        ];
        this.graphics = createPlayerGraphics(model);
        this.updateAppearance();
    }
    static getMaleName() {
        const names = [
            "Dylan",
            "Rhys",
            "Ieuan",
            "Gethin",
            "Bryn",
            "Carwyn",
            "Dewi",
            "Efan",
            "Emyr",
            "Gwyn"
        ];
        return names[Math.floor(Math.random() * names.length)];
    }
    static getFemaleName() {
        const names = [
            "Angharad",
            "Bethan",
            "Catrin",
            "Eira",
            "Ffion",
            "Glesni",
            "Gwyneth",
            "Lowri",
            "Nia",
            "Rhiannon"
        ];
        return names[Math.floor(Math.random() * names.length)];
    }
    static getSurname() {
        const surnames = [
            "Jones",
            "Williams",
            "Davies",
            "Evans",
            "Thomas",
            "Lewis",
            "Hughes",
            "Morgan",
            "Owen",
            "Edwards",
            "James",
            "Powell",
            "Phillips",
            "Rees",
            "Richards",
            "Griffiths",
            "Price",
            "Morris",
            "Jenkins",
            "Lloyd"
        ];
        return surnames[Math.floor(Math.random() * surnames.length)];
    }
    updateAppearance() {
        updatePlayerAppearance(this.graphics, this.isMale, this.appearance);
    }
}