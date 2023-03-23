import { Player } from "./actors/player.js";
import { Statistics } from "./statistics.js";
import { sleep } from "./basics.js";
import { displayPlayerAmmo, tickLog, displayPlayerKills } from "./interface.js";
import { spawnNewEnemy } from "./actors/enemies.js";
import { spawnNewItem } from "./actors/items.js";
import { objectsOverlap } from "./basics.js";

const game_tick = 1000 / 60; //game logic updates at 60fps

export class Game {
    player;
    statistics;
    isPaused;
    projectiles;
    enemies;
    items;
    constructor() {
        this.player = new Player();
        this.statistics = new Statistics();
        this.isPaused = true;
        this.projectiles = [];
        this.enemies = [];
        this.items = [];
    }
    togglePause() {
        this.isPaused = !this.isPaused;
    }
    changePlayerWeapon() {
        this.player.changeWeapon();
    }
    async play() {
        this.isPaused = false;
        while(this.player.isAlive()){
            if(!this.isPaused) {
                //do game logic
                this.statistics.time++;
                this.#handlePlayer();
                this.#handleProjectiles();
                this.#handleEnemies();
                this.#handleItems();
                //handle timings of enemy spawns/item spawns/etc depending on difficulty
                if (this.statistics.time % 60 == 0) {
                    this.#difficultyTimings(Math.floor(this.statistics.time / 60));
                }
                tickLog();
            }
            await sleep(game_tick);
        }
    }
    #handlePlayer() {
        this.player.look(mouseX, mouseY);
        this.player.move(keys_pressed);
        this.player.tickCooldown();
    }
    #handleProjectiles() {
        if(mouse_down && this.player.cooldown == 0 && this.player.inv[this.player.inv_selected][1] > 0) {
            this.projectiles.push(this.player.attack(mouseX, mouseY));
            displayPlayerAmmo(this.player.inv[this.player.inv_selected][1]);
            this.statistics.accuracy.fired++;
        }
        var temp_proj = [];
        for (var i = 0; i < this.projectiles.length; i++) {
            if(this.projectiles[i].checkBounds()) {
                this.projectiles[i].move();
                temp_proj.push(this.projectiles[i]);
            } else {
                this.projectiles[i].model.remove();
            }
        }
        this.projectiles = temp_proj;
    }
    #handleEnemies() {
        var temp_enemies = [];
        for (var i = 0; i < this.enemies.length; i++) {
            //check enemies collisions
            var damage_count = [];
            for (var j = 0; j < this.projectiles.length; j++) {
                if (objectsOverlap(this.enemies[i], this.projectiles[j])){
                    damage_count.push(j);
                    this.statistics.accuracy.hit++;
                }
            }
            if (damage_count.length > 0) {
                //calculate damage
                var damage = 0;
                for (var k = 0; k < damage_count.length; k++) {
                    damage += this.projectiles[damage_count[k]].damage;
                }
                this.enemies[i].receiveDamage(damage);
                //remove projectiles
                var temp = [];
                for (var k = 0; k < damage_count.length; k++) {
                    for (var j = 0; j < this.projectiles.length; j++) {
                        if (damage_count[k] != j) {
                            temp.push(this.projectiles[j]);
                        } else {
                            this.projectiles[j].model.remove();
                        }
                    }
                }
                this.projectiles = temp;
            }
            if (this.enemies[i].isAlive()) {
                //check player collision
                this.enemies[i].playerCollision(this.player);
                this.enemies[i].move(this.player);
                temp_enemies.push(this.enemies[i]);
            } else {
                this.statistics.kills++;
                displayPlayerKills(this.statistics.kills);
                this.enemies[i].model.remove();
            }
        }
        this.enemies = temp_enemies;
    }
    #handleItems() {
        var temp_items = [];
        for (var i = 0; i < this.items.length; i++) {
            //check item collisions
            if(!this.items[i].playerCollision(this.player)) {
                temp_items.push(this.items[i]);
            }
        }
        this.items = temp_items;
    }
    #difficultyTimings(timing) {
        if (this.#updateDifficultyLevel(timing)) {
            //difficulty changed
            diff_stats[0] = diff_stats[1];
            diff_stats[2] = false;
            diff_stats[3] = 0;
            diff_stats[4] = 0;
            diff_stats[5] = 0;
            //check special action
            if (difficulty[diff_stats[1]][4]) {
                //do special action
                switch (diff_stats[1]) {
                    case 1:
                        //medium difficulty - AR spawn
                        this.items.push(spawnNewItem("AR"));
                        break;
                    default:
                        break;
                }
                diff_stats[2] = true;
            }
        }
        //do enemy spawn
        for (var i = 0; i < difficulty[diff_stats[1]][0]; i++) {
            this.enemies.push(spawnNewEnemy());
        }
        //do item spawn
        if (diff_stats[4] == difficulty[diff_stats[1]][2]) {
            this.items.push(spawnNewItem(difficulty[diff_stats[1]][3][diff_stats[5]]));
            diff_stats[5]++;
            if (diff_stats[5] >= difficulty[diff_stats[1]][3].length) {
                diff_stats[5] = 0;
            }
            diff_stats[4] = 0;
        } else {
            diff_stats[4]++;
        }
    }
    #updateDifficultyLevel(timing) {
        if(timing <= 10) {
            diff_stats[1] = 0;
        } else if (timing <= 30) {
            diff_stats[1] = 1;
        } else {
            diff_stats[1] = 2;
        }
        return diff_stats[1] != diff_stats[0];
    }
}

    //difficulty levels:
    //easy 0 - 10 sec:
    //          1 enemy every second
    //          no item spawn
    //medium 11 - 30 sec:
    //          immediate AR spawn
    //          2 enemy every second
    //          item spawn every 5 seconds (ammo, ammo, ammo, health)
    //hard 31+ sec:
    //          3 enemies per second
    //          item spawn every 3 seconds (ammo, ammo, ammo, ammo, health)
const difficulty = [
    //enemies amount, enemy type (ar) {for future compatibility}, item timing, item type (ar), special action
    [1, [0], 99, ["Ammo"], false],
    [2, [0], 5, ["Ammo", "Ammo", "Ammo", "Health"], true],
    [3, [0], 3, ["Ammo", "Ammo", "Ammo", "Ammo", "Health"], false]
];
//previous difficulty, current difficulty, special action done, enemy array, item timing, item array
var diff_stats = [0, 0, false, 0, 0, 0];

/*
CONTROLS
*/

var mouseX = 0, mouseY = 0;
window.onmousemove = function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

var mouse_down = false;
window.onmousedown = function() {
    mouse_down = true;
}

window.onmouseup = function() {
    mouse_down = false;
}

var keys_pressed = [false, false, false, false]; //W A S D
document.addEventListener('keydown', (event) => {
    switch (event.code) {
    case "KeyW":
        keys_pressed[0] = true;
        break;
    case "KeyA":
        keys_pressed[1] = true;
        break;
    case "KeyS":
        keys_pressed[2] = true;
        break;
    case "KeyD":
        keys_pressed[3] = true;
        break;
    default:
        return;
    }
});

document.addEventListener('keyup', (event) => {
	switch (event.code) {
    case "KeyW":
        keys_pressed[0] = false;
        break;
    case "KeyA":
        keys_pressed[1] = false;
        break;
    case "KeyS":
        keys_pressed[2] = false;
        break;
    case "KeyD":
        keys_pressed[3] = false;
        break;
    default:
        return;
    }
});
