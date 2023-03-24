import { Player } from "./actors/player.js";
import { Statistics } from "./statistics.js";
import { sleep } from "./basics.js";
import { displayPlayerAmmo, tickLog, displayPlayerKills, displayObjective, tickObjective } from "./interface.js";
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
    stages;
    constructor() {
        this.player = new Player();
        this.statistics = new Statistics();
        this.isPaused = true;
        this.projectiles = [];
        this.enemies = [];
        this.items = [];
        this.stages = new StageHandler(this.statistics, this.enemies, this.items);
    }
    togglePause() {
        this.isPaused = !this.isPaused;
    }
    changePlayerWeapon() {
        this.player.changeWeapon();
    }
    async play() {
        this.isPaused = false;
        this.stages.start();
        while(this.player.isAlive()){
            if(!this.isPaused) {
                //do game logic
                this.statistics.time++;
                this.#handlePlayer();
                this.#handleProjectiles();
                this.#handleEnemies();
                this.#handleItems();
                tickLog();
                tickObjective();
                this.stages.items = this.items;
                this.stages.enemies = this.enemies;
                this.stages.tick();
                this.items = this.stages.items;
                this.enemies = this.stages.enemies;
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
                if (!this.enemies[i].immune && objectsOverlap(this.enemies[i], this.projectiles[j])){
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
}

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

class Stage {
    message;
    onstart;
    condition;
    enemyspawn;
    itemspawn;
    starttime;
    itemtime;
    constructor(objective, onstart, condition, enemyspawn, itemspawn, starttime) {
        this.message = objective;
        this.onstart = onstart;
        this.condition = condition;
        this.enemyspawn = enemyspawn;
        this.itemspawn = itemspawn;
        this.starttime = starttime;
        this.itemtime = 0;
    }
    start(stats, enemies, items) {
        displayObjective(this.message);
        if(this.onstart) {
            this.onstart(stats, enemies, items);
        }
    }
    handleEnemies(time, enemies) {
        if (time % (60 / this.enemyspawn.persecond) == 0 && this.enemyspawn.amount < this.enemyspawn.maxamount) {
            //spawn an enemy
            var i = Math.floor(Math.random() * this.enemyspawn.types.length);
            while (i != 0 && this.enemyspawn.types[i][1] == 0) {
                i++;
                if (i >= this.enemyspawn.types.length) {
                    i = 0;
                }
            }
            enemies.push(spawnNewEnemy(this.enemyspawn.types[i][0]));
            this.enemyspawn.types[i][1]--;
            this.enemyspawn.amount++;
        }
    }
    handleItems(time, items) {
        if(time % 60 == 0) {
            this.itemtime++;
            if (this.itemtime == this.itemspawn.seconds && this.itemspawn.amount < this.itemspawn.maxamount) {
                this.itemtime = 0;
                console.log("item spawn");
                //spawn item
                var i = Math.floor(Math.random() * this.itemspawn.types.length);
                while (i != 0 && this.itemspawn.types[i][1] == 0) {
                    i++;
                    if (i >= this.itemspawn.types.length) {
                        i = 0;
                    }
                }
                items.push(spawnNewItem(this.itemspawn.types[i][0]));
                this.itemspawn.types[i][1]--;
                this.itemspawn.amount++;
            }
        }
    }
}

class StageHandler {
    stages = [];
    current;
    stats;
    enemies;
    items;
    constructor(stats, enemies, items) {
        this.current = 0;
        this.stats = stats;
        this.enemies = enemies;
        this.items = items;
        /* STAGE 1 */
        this.stages.push(new Stage("Wave 1", undefined, function(stats, enemies, items) {
            return enemies.length < 1 && stats.kills > 4;
        }, {
            types: [[0, 99]],
            amount: 0,
            maxamount: 10,
            persecond: 1
        }, {
            amount: 0,
            maxamount: -1,
            seconds: 99
        }, this.stats.time));
        /* STAGE 2 */
        this.stages.push(new Stage("Grab AR", function(stats, enemies, items) {
            items.push(spawnNewItem("AR"));
        }, function(stats, enemies, items) {
            return items.length < 1;
        }, {
            amount: 0,
            maxamount: -1,
            persecond: 1
        }, {
            amount: 0,
            maxamount: -1,
            seconds: 99
        }, this.stats.time));
        /* STAGE 3 */
        this.stages.push(new Stage("Wave 2", undefined, function(stats, enemies, items) {
            return enemies.length < 1 && this.enemyspawn.amount == this.enemyspawn.maxamount;
        }, {
            types: [[0, 99], [1, 10]],
            amount: 0,
            maxamount: 50,
            persecond: 2
        }, {
            types: [["Ammo", 99], ["Health", 2]],
            amount: 0,
            maxamount: 10,
            seconds: 5
        }, this.stats.time));
        /* STAGE 4 */
        this.stages.push(new Stage("Prepare", undefined, function(stats, enemies, items) {
            return items.length < 1 && this.itemspawn.amount == this.itemspawn.maxamount;
        }, {
            amount: 0,
            maxamount: -1,
            persecond: 1
        }, {
            types: [["Ammo", 99], ["Health", 1]],
            amount: 0,
            maxamount: 5,
            seconds: 1
        }, this.stats.time));
        /* STAGE 5 */
        this.stages.push(new Stage("Boss of the gym", function(stats, enemies, items) {
            enemies.push(spawnNewEnemy(2));
        }, function(stats, enemies, items) {
            return enemies.length < 1 && this.enemyspawn.amount == this.enemyspawn.maxamount;
        }, {
            types: [[0, 99], [1, 5], [3, 2]],
            amount: 0,
            maxamount: 20,
            persecond: 2
        }, {
            types: [["Ammo", 99], ["Health", 2]],
            amount: 0,
            maxamount: 10,
            seconds: 5
        }, this.stats.time));
        /* STAGE 6 (INFINITE WAVE - TEMPORARY) */
        this.stages.push(new Stage("SURVIVE", undefined, function(stats, enemies, items) {
            return false;
        }, {
            types: [[0, 99], [1, 99], [2, 5], [3, 40]],
            amount: 0,
            maxamount: 99999,
            persecond: 3
        }, {
            types: [["Ammo", 99], ["Health", 99]],
            amount: 0,
            maxamount: 99999,
            seconds: 5
        }, this.stats.time));
    }
    start() {
        this.stages[this.current].start(this.stats, this.enemies, this.items);
    }
    tick() {
        if (this.stages[this.current].condition(this.stats, this.enemies, this.items)) {
            this.current++;
            this.start();
        } else {
            this.stages[this.current].handleEnemies(this.stats.time, this.enemies);
            this.stages[this.current].handleItems(this.stats.time, this.items);
        }
    }
}