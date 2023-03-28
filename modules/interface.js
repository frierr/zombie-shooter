const game_start_window = document.getElementById("control-box");
const game_end_window = document.getElementById("endgame-box");
const game_end_window_content = [document.getElementById("endgame-box-title"), document.getElementById("endgame-box-body")];
const player_stats = document.getElementById("player-stats");
const player_am = document.getElementById("player-ammo");
const player_hp = document.getElementById("player-hp");
const player_wp = document.getElementById("player-weapon");
const player_name = document.getElementById("player-name");
const player_kills = document.getElementById("player-kills");
const player_log = document.getElementById("player-log");
const objective_wrap = document.getElementById("objective-wrap");
const objective_desc = document.getElementById("objective-desc");

//display elements for game start
export function displayPreStartElems() {
    game_start_window.style.display = "block";
    player_stats.style.display = "none";
    game_end_window.style.display = "none";
    objective_wrap.style.opacity = 0;
}

//display elements on game start
export function displayOnStartElems() {
    game_start_window.style.display = "none";
    player_stats.style.display = "grid";
    game_end_window.style.display = "none";
}

//display elements for game end
export function displayEndElems() {
    game_start_window.style.display = "none";
    player_stats.style.display = "none";
    game_end_window.style.display = "block";
    log_opacity = 0;
}

export function displayInitialPlayerStats(player) {
    player_name.textContent = `${player.personality.name} ${player.personality.surname}`;
    displayPlayerHP(player.hp, player.maxhp);
    displayPlayerWeapon(player.inv[player.inv_selected]);
    displayPlayerKills(0);
}

export function displayPlayerHP(hp, maxhp) {
    const hp_info = calculatePlayerHP(hp, maxhp);
    player_hp.style.backgroundImage = `linear-gradient(90deg, ${hp_info.colour} -1%, ${hp_info.colour} ${hp_info.percent}%, transparent ${hp_info.percent + 1}%, transparent 110%)`;
}

function calculatePlayerHP(php, maxhp) {
    var hp = {
        percent: 0,
        colour: "red"
    };
    hp.percent = (php / maxhp) * 100;
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

export function displayPlayerWeapon(weapon) {
    player_wp.textContent = weapon[0];
    displayPlayerAmmo(weapon[1]);
}

export function displayPlayerAmmo(amount) {
    player_am.textContent = amount;
}

export function displayPlayerKills(kills) {
    player_kills.textContent = kills;
}

var log_opacity = 0;
export function displayLog(text, position) {
    player_log.textContent = text;
    log_opacity = 1;
    player_log.style.left = `${position.x}px`;
    player_log.style.top = `${position.y}px`;
}

export function tickLog() {
    player_log.style.opacity = log_opacity;
    log_opacity = Math.max(0, log_opacity - 0.01);
}

var obj_opacity = 0;
var obj_tick = 60;
export function displayObjective(text) {
    if (text != "") {
        objective_desc.textContent = text;
        obj_opacity = 1;
        obj_tick = 0;
    }
}

export function tickObjective() {
    obj_tick++;
    objective_wrap.style.opacity = obj_opacity;
    if (obj_tick > 60) {
        obj_opacity = Math.max(0, obj_opacity - 0.01);
    }
}

export function displayEndGameStats(stats, player) {
    log_opacity = 0;
    player_log.style.opacity = log_opacity;
    obj_opacity = 0;
    objective_wrap.style.opacity = obj_opacity;
    const date = new Date();
    game_end_window_content[0].innerHTML = `RIP<br>${player.name} ${player.surname}<br>${Math.floor(Math.random() * 27) + 1}.${Math.floor(Math.random() * 11) + 1}.${Math.floor(Math.random() * 30) + 1969} - ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    game_end_window_content[1].innerHTML = `Time survived: ${Math.floor(stats.time / 60)} seconds<br>Monsters killed: ${stats.kills}<br>Accuracy: ${stats.getAccuracy()}%`;
}