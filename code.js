const game_start_window = document.getElementById("control-box");
const player_stats = document.getElementById("player-stats");
const player_log = document.getElementById("player-log");
const play_area = document.getElementById("play-area");
const play_area_canvas = document.getElementById("play-area-graphics");
const play_area_graphics = play_area_canvas.getContext("2d");
//graphics arrays
const blood = [
    ["./data/blood/big_0.png", "./data/blood/big_1.png", "./data/blood/big_2.png", "./data/blood/big_3.png", "./data/blood/big_4.png", 
     "./data/blood/big_5.png", "./data/blood/big_6.png", "./data/blood/big_7.png", "./data/blood/big_8.png", "./data/blood/big_9.png"], //big ~45x45
    ["./data/blood/med_0.png", "./data/blood/med_1.png", "./data/blood/med_2.png", "./data/blood/med_3.png", "./data/blood/med_4.png", 
     "./data/blood/med_5.png", "./data/blood/med_6.png", "./data/blood/med_7.png", "./data/blood/med_8.png", "./data/blood/med_9.png"], //medium ~25x25
    ["./data/blood/small_0.png", "./data/blood/small_1.png", "./data/blood/small_2.png", "./data/blood/small_3.png", "./data/blood/small_4.png", 
     "./data/blood/small_5.png", "./data/blood/small_6.png", "./data/blood/small_7.png", "./data/blood/small_8.png", "./data/blood/small_9.png"] // small ~15x15
];
const player_name = document.getElementById("player-name");
const player_hp = document.getElementById("player-hp");
const player_wp = document.getElementById("player-weapon");
const player_am = document.getElementById("player-ammo");
const player_kills = document.getElementById("player-kills");
const angled_var = Math.sqrt(2) / 2;
const move_speed = 9;
var game_paused = true;
var game_started = false;
const game_tick = 1000 / 60; //game logic updates at 60fps
const enemy_move_speed = 5;
const enemy_damage = 10;
const enemy_damage_rate = 60;
const gun_fire_rate = 1000 / 3; //gun bpm
const gun_bullet_speed = 20;
const gun_bullet_damage = 30;
const ar_fire_rate = 1000 / 10; //ar bpm
const ar_bullet_speed = 40;
const ar_bullet_damage = 10;
var projectiles = [];
var enemies = [];
const item_health_value = 30;
var items = [];
var player = {
    model: undefined,
    name: undefined,
    hp: 0,
    maxhp: 0,
    inv: [],
    inv_selected: 0,
    kills: 0,
    pos: {
        x: 0,
        y: 0
    },
    updateModelPos: function() {
        this.model.style.left = (this.pos.x - 15) + "px";
        this.model.style.top = (this.pos.y - 15) + "px";
    },
    move: function() {
        //get direction
        const Xaxis = 0 + (keys_pressed[1] ? -1 : 0) + (keys_pressed[3] ? 1 : 0);
        const Yaxis = 0 + (keys_pressed[0] ? -1 : 0) + (keys_pressed[2] ? 1 : 0);
        if (Xaxis != 0 || Yaxis != 0) {
            //do movement
            if (Xaxis != 0) {
                if (Yaxis != 0) {
                    this.pos.x = this.pos.x + Xaxis * move_speed * angled_var;
                    this.pos.y = this.pos.y + Yaxis * move_speed * angled_var;
                } else {
                    this.pos.x = this.pos.x + Xaxis * move_speed;
                }
            } else {
                this.pos.y = this.pos.y + Yaxis * move_speed;
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
    },
    look: function() {
        if (this.model) {
            //turn model in mouse direction
            const angle = Math.atan2(this.pos.y - mouseY, this.pos.x - mouseX) * 180 / Math.PI;
            this.model.style.transform = "rotate(" + angle + "deg)";
        }
    },
    attack: function() {
        switch (this.inv[this.inv_selected][0]) {
            case "Handgun":
                spawnGunProjectiles();
                break;
            case "AR":
                spawnARProjectiles();
                break;
            default:
                break;
        }
    },
    takeDamage: function(damage) {
        this.hp = Math.max(0, this.hp - damage);
        displayPlayerHP();
        if (this.hp <= 0) {
            //game end
            gameEnd();
        }
        this.setLog("OUCH");
    },
    receiveItem: function(item) {
        switch(item) {
            case "AR":
                this.inv.push(["AR", 100]);
                this.inv_selected++;
                displayPlayerWeapon();
                this.setLog("AR!");
                break;
            case "Ammo":
                switch (this.inv[this.inv_selected][0]) {
                    case "Handgun":
                        this.inv[this.inv_selected][1] += 20;
                        break;
                    case "AR":
                        this.inv[this.inv_selected][1] += 50;
                        break;
                    default:
                        break;
                }
                displayPlayerAmmo();
                this.setLog("+AMMO!");
                break;
            case "Health":
                this.hp += item_health_value;
                if (this.hp > this.maxhp) {
                    this.maxhp == this.hp;
                }
                displayPlayerHP();
                this.setLog("+HP!");
                break;
            default:
                break;
        }
    },
    log_opacity: 0,
    setLog: function(text) {
        player_log.textContent = text;
        this.log_opacity = 1;
        player_log.style.left = `${this.pos.x}px`;
        player_log.style.top = `${this.pos.y}px`;
    },
    tickLog: function() {
        player_log.style.opacity = this.log_opacity;
        this.log_opacity = Math.max(0, this.log_opacity - 0.01);
    }
};

window.onload = function() {
    play_area_canvas.width = play_area_canvas.clientWidth;
    play_area_canvas.height = play_area_canvas.clientHeight;
    displayPreStartElems();
}

var mouseX = 0, mouseY = 0;
window.onmousemove = function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
TOP DOWN GAME FUNCTIONS
*/

//display elements for game start
function displayPreStartElems() {
    game_start_window.style.display = "block";
    player_stats.style.display = "none";
}

//display elements on game start
function displayOnStartElems() {
    game_start_window.style.display = "none";
    player_stats.style.display = "grid";
}

//start game
function start() {
    displayOnStartElems();
    spawnPlayer();
    displayAllPlayerInfo();
    game_started = true;
    game_paused = false;
    gameTick();
}

function displayAllPlayerInfo() {
    player_name.textContent = player.name;
    displayPlayerHP();
    displayPlayerWeapon();
    displayPlayerKills();
}

function displayPlayerHP() {
    const hp_info = calculatePlayerHP();
    player_hp.style.backgroundImage = "linear-gradient(90deg, red -1%, red 69%, transparent 70%, transparent 101%)";
    player_hp.style.backgroundImage = `linear-gradient(90deg, ${hp_info.colour} -1%, ${hp_info.colour} ${hp_info.percent}%, transparent ${hp_info.percent + 1}%, transparent 110%)`;
}

function displayPlayerWeapon() {
    player_wp.textContent = player.inv[player.inv_selected][0];
    displayPlayerAmmo();
}

function displayPlayerAmmo() {
    player_am.textContent = player.inv[player.inv_selected][1];
}

function displayPlayerKills() {
    player_kills.textContent = player.kills;
}

function calculatePlayerHP() {
    var hp = {
        percent: 0,
        colour: "red"
    };
    hp.percent = (player.hp / player.maxhp) * 100;
    if (hp.percent > 80) {
        hp.colour = "#2dbbd7";
    } else if (hp.percent > 50) {
        hp.colour = "#67908e";
    } else if (hp.percent > 35) {
        hp.colour = "#986b4f";
    } else if (hp.percent > 10) {
        hp.colour = "#c84713";
    } else {
        hp.colour = "#290000";
    }
    return hp;
}

function gameEnd() {
    game_paused = true;
    game_started = false;
    alert("lol you died\nkills: " + player.kills);
    player.model.remove();
    for (var i = 0; i < projectiles.length; i++) {
        projectiles[i].model.remove();
    }
    projectiles = [];
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].model.remove();
    }
    enemies = [];
    for (var i = 0; i < items.length; i++) {
        items[i].model.remove();
    }
    items = [];
    play_area_graphics.clearRect(0, 0, play_area_canvas.width, play_area_canvas.height);
    player_log.style.opacity = 0;
    diff_stats = [0, 0, false, 0, 0, 0, 0];
    keys_pressed = [false, false, false, false]
    mouse_down = false;
    displayPreStartElems();
}

function spawnPlayer() {
    player.pos.x = document.body.getBoundingClientRect().width / 2;
    player.pos.y = document.body.getBoundingClientRect().height / 2;
    player.model = createPlayerModel(player.pos);
    player.name = getRandomName();
    player.hp = 100;
    player.maxhp = 100;
    player.inv = [["Handgun", 40]];
    player.inv_selected = 0;
    player.kills = 0;
}

function createPlayerModel(position) {
    var elem = document.createElement("div");
    elem.style.height = "30px";
    elem.style.width = "30px";
    elem.style.zIndex = "30";
    elem.style.position = "absolute";
    elem.style.left = (position.x - 15) + "px";
    elem.style.top = (position.y - 15) + "px";
    elem.style.backgroundImage = "url(./data/player.png)";
    elem.style.backgroundPosition = "center";
    elem.style.backgroundSize = "contain";
    play_area.appendChild(elem);
    return elem;
}

function getRandomName() {
    const male_names = [
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
    const female_names = [
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
    const name = (Math.random() > 0.5 ? male_names[Math.floor(Math.random() * male_names.length)] : female_names[Math.floor(Math.random() * female_names.length)]);
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    return `${name} ${surname}`;
}

async function gameTick() {
    var ticks_passed = 0;
    while(game_started) {
        if(!game_paused) {
            //do game logic
            //handle player
            player.look();
            player.move();
            player.tickLog();
            //handle projectiles
            var temp_proj = [];
            for (var i = 0; i < projectiles.length; i++) {
                if(projectiles[i].checkBounds()) {
                    projectiles[i].move();
                    temp_proj.push(projectiles[i]);
                } else {
                    projectiles[i].model.remove();
                }
            }
            projectiles = temp_proj;
            //handle enemies
            temp_proj = [];
            for (var i = 0; i < enemies.length; i++) {
                //check enemies collisions
                var is_alive = true;
                var damage_count = enemies[i].projectileCollision();
                if (damage_count.length > 0) {
                    //calculate damage
                    var damage = 0;
                    for (var k = 0; k < damage_count.length; k++) {
                        damage += projectiles[damage_count[k]].damage;
                    }
                    is_alive = enemies[i].receiveDamage(damage);
                    //remove projectiles
                    var temp = [];
                    for (var k = 0; k < damage_count.length; k++) {
                        for (var j = 0; j < projectiles.length; j++) {
                            if (damage_count[k] != j) {
                                temp.push(projectiles[j]);
                            } else {
                                projectiles[j].model.remove();
                            }
                        }
                    }
                    projectiles = temp;
                }
                if (is_alive) {
                    //check player collision
                    enemies[i].playerCollision();
                    enemies[i].move();
                    temp_proj.push(enemies[i]);
                } else {
                    player.kills++;
                    displayPlayerKills();
                    enemies[i].model.remove();
                }
            }
            enemies = temp_proj;
            //handle items
            temp_proj = [];
            for (var i = 0; i < items.length; i++) {
                //check item collisions
                if(!items[i].playerCollision()) {
                    temp_proj.push(items[i]);
                }
            }
            items = temp_proj;
            //handle timings of enemy spawns/item spawns/etc depending on difficulty
            if (ticks_passed % 60 == 0) {
                difficultyTimings(Math.floor(ticks_passed / 60));
            }
            ticks_passed++;
        }
        await sleep(game_tick);
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
    //enemies amount, enemy type (ar) {dor future compatibility}, item timing, item type (ar), special action
    [1, [0], 99, ["Ammo"], false],
    [2, [0], 5, ["Ammo", "Ammo", "Ammo", "Health"], true],
    [3, [0], 3, ["Ammo", "Ammo", "Ammo", "Ammo", "Health"], false]
];
//previous difficulty, current difficulty, special action done, enemy array, item timing, item array
var diff_stats = [0, 0, false, 0, 0, 0, 0];
function difficultyTimings(timing) {
    if (updateDifficultyLevel(timing)) {
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
                    items.push(spawnNewItem("AR"));
                    break;
                default:
                    break;
            }
            diff_stats[2] = true;
        }
    }
    //do enemy spawn
    for (var i = 0; i < difficulty[diff_stats[1]][0]; i++) {
        enemies.push(spawnNewEnemy());
    }
    //do item spawn
    if (diff_stats[4] == difficulty[diff_stats[1]][2]) {
        items.push(spawnNewItem(difficulty[diff_stats[1]][3][diff_stats[5]]));
        diff_stats[5]++;
        if (diff_stats[5] >= difficulty[diff_stats[1]][3].length) {
            diff_stats[5] = 0;
        }
        diff_stats[4] = 0;
    } else {
        diff_stats[4]++;
    }
}

function updateDifficultyLevel(timing) {
    if(timing <= 10) {
        diff_stats[1] = 0;
    } else if (timing <= 30) {
        diff_stats[1] = 1;
    } else {
        diff_stats[1] = 2;
    }
    return diff_stats[1] != diff_stats[0];
}

function spawnNewEnemy() {
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
    var enemy = {
        pos: {
            x: x1,
            y: y1
        },
        hp: 50,
        speed: enemy_move_speed,
        damage: enemy_damage,
        damage_rate: enemy_damage_rate,
        fixDamageRate: function () {
            if (this.damage_rate < enemy_damage_rate) {
                this.damage_rate++;
            }
        },
        model: createEnemyModel(x1, y1),
        move: function() {
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
            this.fixDamageRate();
            this.look();
        },
        look: function() {
            if (this.model) {
                //turn model in player direction
                const angle = Math.atan2(this.pos.y - player.pos.y, this.pos.x - player.pos.x) * 180 / Math.PI;
                this.model.style.transform = "rotate(" + angle + "deg)";
            }
        },
        projectileCollision: function() {
            var temp_damage = [];
            for (var i = 0; i < projectiles.length; i++) {
                if (objectsOverlap(this, projectiles[i])){
                    //take damage
                    temp_damage.push(i);
                }
            }
            return temp_damage;
        },
        playerCollision: function() {
            if (objectsOverlap(this, player) && this.damage_rate >= enemy_damage_rate) {
                this.damage_rate = 0;
                player.takeDamage(this.damage);
            }
        },
        receiveDamage: function(damage) {
            is_alive = true;
            this.hp -= damage;
            if (this.hp <= 0) {
                //dead
                is_alive = false;
                drawBlood(this.pos.x, this.pos.y, 0);
            } else {
                //damaged
                drawBlood(this.pos.x, this.pos.y, 1);
                if(this.hp >= 15) {
                    this.model.style.backgroundImage = "url(./data/enemies/zombie_half.png)";
                } else {
                    this.model.style.backgroundImage = "url(./data/enemies/zombie_min.png)";
                }
            }
            return is_alive;
        }
    };
    return enemy;
}

function spawnNewItem(type) {
    var x1 = Math.random() * (document.body.getBoundingClientRect().width - 100) + 100;
    var y1 = Math.random() * (document.body.getBoundingClientRect().height - 100) + 100;
    var item = {
        pos: {
            x: x1,
            y: y1
        },
        type: type,
        model: createItemModel(x1, y1, type),
        playerCollision: function() {
            if (objectsOverlap(this, player)) {
                player.receiveItem(this.type);
                this.model.remove();
                return true;
            }
            return false;
        }
    };
    return item;
}

function createItemModel(x1, y1, type) {
    var elem = document.createElement("div");
    elem.style.height = "30px";
    elem.style.width = "30px";
    elem.style.zIndex = "20";
    elem.style.position = "absolute";
    elem.style.left = (x1 - 15) + "px";
    elem.style.top = (y1 - 15) + "px";
    elem.style.backgroundImage = `url(./data/${type.toLowerCase()}.png)`;
    elem.style.backgroundPosition = "center";
    elem.style.backgroundSize = "contain";
    play_area.appendChild(elem);
    return elem;
}

function createEnemyModel(x1, y1) {
    var elem = document.createElement("div");
    elem.style.height = "30px";
    elem.style.width = "30px";
    elem.style.zIndex = "20";
    elem.style.position = "absolute";
    elem.style.left = (x1 - 15) + "px";
    elem.style.top = (y1 - 15) + "px";
    elem.style.backgroundImage = "url(./data/enemies/zombie_full.png)";
    elem.style.backgroundPosition = "center";
    elem.style.backgroundSize = "contain";
    play_area.appendChild(elem);
    return elem;
}

function objectsOverlap(object1, object2) {
    const rec1 = object1.model.getBoundingClientRect();
    const rec2 = object2.model.getBoundingClientRect();
    return !(
        rec1.top > rec2.bottom ||
        rec1.right < rec2.left ||
        rec1.bottom < rec2.top ||
        rec1.left > rec2.right
    );
}

async function spawnGunProjectiles() {
    while (mouse_down && player.inv[player.inv_selected][1] > 0) {
        fireProjectile(player.pos.x, player.pos.y, mouseX, mouseY, gun_bullet_speed, gun_bullet_damage);
        player.inv[player.inv_selected][1]--;
        displayPlayerAmmo();
        await sleep(gun_fire_rate);
    }
}

async function spawnARProjectiles() {
    while (mouse_down && player.inv[player.inv_selected][1] > 0) {
        fireProjectile(player.pos.x, player.pos.y, mouseX, mouseY, ar_bullet_speed, ar_bullet_damage);
        player.inv[player.inv_selected][1]--;
        displayPlayerAmmo();
        await sleep(ar_fire_rate);
    }
}

function fireProjectile(x1, y1, x2, y2, bullet_speed, bullet_damage) {
    //calculate angle - dx and dy
    var dx = x1 - x2;
    var dy = y1 - y2;
    //normalise
    const sum = Math.abs(dx) + Math.abs(dy);
    dx = (-1) * dx / sum;
    dy = (-1) * dy / sum;
    //create projectile
    var bullet = {
        pos: {
            x: x1,
            y: y1
        },
        dir: {
            dx: dx,
            dy: dy
        },
        speed: bullet_speed,
        damage: bullet_damage,
        model: createBulletModel(x1, y1),
        move: function() {
            this.pos.x += this.dir.dx * this.speed;
            this.pos.y += this.dir.dy * this.speed;
            this.model.style.left = (this.pos.x - 2) + "px";
            this.model.style.top = (this.pos.y - 2) + "px";
        },
        checkBounds: function() {
            if ((this.pos.x < 0 || this.pos.x > document.body.getBoundingClientRect().width) || (this.pos.y < 0 || this.pos.y > document.body.getBoundingClientRect().height)){
                return false;
            } else {
                return true;
            }
        }
    };
    projectiles.push(bullet);
}

function createBulletModel(x, y) {
    var elem = document.createElement("div");
    elem.style.height = "4px";
    elem.style.width = "4px";
    elem.style.borderRadius = "2px";
    elem.style.zIndex = "25";
    elem.style.position = "absolute";
    elem.style.left = (x - 2) + "px";
    elem.style.top = (y - 2) + "px";
    elem.style.backgroundColor = "black";
    play_area.appendChild(elem);
    return elem;
}

function drawBlood(x, y, type) {
    var i = type;
    if (i != 0) {
        //small or medium splatter
        i = (shuffle([1, 2, 2, 2]))[0];
    }
    var img = new Image();
    img.addEventListener('load', function() {
        const angle = (Math.random() * 360) * Math.PI / 180;
        play_area_graphics.translate(x, y);
        play_area_graphics.rotate(angle);
        play_area_graphics.translate(-x, -y);
        play_area_graphics.drawImage(img, x, y);
        play_area_graphics.translate(x, y);
        play_area_graphics.rotate(-angle);
        play_area_graphics.translate(-x, -y);
    }, false);
    img.src = blood[i][Math.floor(Math.random() * blood[i].length)];
}

var keys_pressed = [false, false, false, false]; //W A S D
document.addEventListener('keydown', (event) => {
    switch (event.key) {
    case "w":
        keys_pressed[0] = true;
        break;
    case "a":
        keys_pressed[1] = true;
        break;
    case "s":
        keys_pressed[2] = true;
        break;
    case "d":
        keys_pressed[3] = true;
        break;
    case "q":
        //switch weapon
        player.inv_selected++;
        if (player.inv_selected >= player.inv.length) {
            player.inv_selected = 0;
        }
        displayPlayerWeapon();
        break;
    case "p":
        game_paused = !game_paused;
        break;
    default:
        return;
    }
});

document.addEventListener('keyup', (event) => {
	switch (event.key) {
    case "w":
        keys_pressed[0] = false;
        break;
    case "a":
        keys_pressed[1] = false;
        break;
    case "s":
        keys_pressed[2] = false;
        break;
    case "d":
        keys_pressed[3] = false;
        break;
    default:
        return;
    }
});

var mouse_down = false;
window.onmousedown = function() {
    if (game_started && !game_paused) {
        mouse_down = true;
        player.attack();
    }
}

window.onmouseup = function() {
    mouse_down = false;
}
