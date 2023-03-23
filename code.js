/*
IMPORTS
*/

import { fixCanvas, clearCanvas } from "./modules/graphics.js";
import { displayPreStartElems, displayOnStartElems, displayEndElems, displayInitialPlayerStats, displayEndGameStats } from "./modules/interface.js";
import { Game } from "./modules/game.js";

/*
DEFAULT VARIABLES AND CONSTANTS
*/

const start_buttons = [document.getElementById("start-button"), document.getElementById("restart-button")];
const play_area = document.getElementById("play-area");
var game;

/*
ONLOAD
*/

window.onload = function() {
    fixCanvas();
    displayPreStartElems();
    start_buttons[0].onclick = function () {
        start();
    };
    start_buttons[1].onclick = function () {
        start();
    };
}

//launches the game
async function start() {
    game = new Game();
    displayOnStartElems();
    displayInitialPlayerStats(game.player);
    await game.play();
    clearCanvas();
    displayEndGameStats(game.statistics, game.player.personality);
    displayEndElems();
}

/*
CONTROLS
*/

document.addEventListener('keydown', (event) => {
    switch (event.code) {
    case "KeyQ":
        if(game) {
            game.changePlayerWeapon();
        }
        break;
    case "KeyP":
        if(game) {
            game.togglePause();
        }
        break;
    default:
        return;
    }
});