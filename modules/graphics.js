const play_area = document.getElementById("play-area");
const play_area_canvas = document.getElementById("play-area-graphics");
const play_area_graphics = play_area_canvas.getContext("2d");

//fixes canvas resolution to fit the screen
export function fixCanvas() {
    play_area_canvas.width = play_area_canvas.clientWidth;
    play_area_canvas.height = play_area_canvas.clientHeight;
}

export function clearCanvas() {
    play_area.innerHTML = ``;
    play_area.appendChild(play_area_canvas);
    play_area_graphics.clearRect(0, 0, play_area_canvas.width, play_area_canvas.height);
}

export function createPlayerModel(position) {
    const elem = document.createElement("div");
    elem.style.height = "30px";
    elem.style.width = "30px";
    elem.style.zIndex = "30";
    elem.style.position = "absolute";
    elem.style.left = (position.x - 15) + "px";
    elem.style.top = (position.y - 15) + "px";
    play_area.appendChild(elem);
    return elem;
}

export function createPlayerGraphics(model) {
    const model_canvas = document.createElement("canvas");
    model_canvas.style.width = "30px";
    model_canvas.style.height = "30px";
    model_canvas.style.position = "relative";
    model_canvas.style.top = "-5px";
    model.appendChild(model_canvas);
    model_canvas.width = model_canvas.clientWidth;
    model_canvas.height = model_canvas.clientHeight;
    const model_canvas_graphics = model_canvas.getContext("2d");
    return model_canvas_graphics;
}

export function updatePlayerAppearance(graphics, isMale, appearance) {
    graphics.clearRect(0, 0, 30, 30);
    var body = new Image();
    body.addEventListener('load', function() {
        graphics.drawImage(body, 0, 0);
        var weapon = new Image();
        weapon.addEventListener('load', function() {
            graphics.drawImage(weapon, 0, 0);
            var head_base = new Image();
            head_base.addEventListener('load', function() {
                graphics.drawImage(head_base, 0, 0);
                var hair = new Image();
                hair.addEventListener('load', function() {
                    graphics.drawImage(hair, 0, 0);
                }, false);
                hair.src = `../data/char/head/hair/${(isMale ? "m" : "f")}/${appearance[2]}/${appearance[3]}.png`;
            }, false);
            head_base.src = `../data/char/head/head_base.png`;
        }, false);
        var w;
        switch(appearance[0]) {
            case 1:
                //ar
                w = "ar";
                break;
            default:
                //handgun
                w = "handgun";
                break;
        };
        weapon.src = `../data/char/weapon/${w}.png`;
    }, false);
    body.src = `../data/char/body/${(isMale ? "m" : "f")}/${appearance[1]}.png`;
}

export function createBulletModel (x, y) {
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

export function createItemModel(x, y, type) {
    var elem = document.createElement("div");
    elem.style.height = "30px";
    elem.style.width = "30px";
    elem.style.zIndex = "20";
    elem.style.position = "absolute";
    elem.style.left = (x - 15) + "px";
    elem.style.top = (y - 15) + "px";
    elem.style.backgroundImage = `url(./data/${type.toLowerCase()}.png)`;
    elem.style.backgroundPosition = "center";
    elem.style.backgroundSize = "contain";
    play_area.appendChild(elem);
    return elem;
}

export function createZombieModel(x, y) {
    var elem = document.createElement("div");
    elem.style.height = "30px";
    elem.style.width = "30px";
    elem.style.zIndex = "20";
    elem.style.position = "absolute";
    elem.style.left = (x - 15) + "px";
    elem.style.top = (y - 15) + "px";
    elem.style.backgroundImage = "url(./data/enemies/zombie_full.png)";
    elem.style.backgroundPosition = "center";
    elem.style.backgroundSize = "contain";
    play_area.appendChild(elem);
    return elem;
}

export function createFastZombieModel(x, y) {
    var elem = document.createElement("div");
    elem.style.height = "30px";
    elem.style.width = "30px";
    elem.style.zIndex = "20";
    elem.style.position = "absolute";
    elem.style.left = (x - 15) + "px";
    elem.style.top = (y - 15) + "px";
    elem.style.backgroundImage = "url(./data/enemies/fast_zombie_full.png)";
    elem.style.backgroundPosition = "center";
    elem.style.backgroundSize = "contain";
    play_area.appendChild(elem);
    return elem;
}

export function createJugZombieModel(x, y) {
    var elem = document.createElement("div");
    elem.style.height = "50px";
    elem.style.width = "50px";
    elem.style.zIndex = "20";
    elem.style.position = "absolute";
    elem.style.left = (x - 25) + "px";
    elem.style.top = (y - 25) + "px";
    elem.style.backgroundImage = "url(./data/enemies/jug_zombie_full.png)";
    elem.style.backgroundPosition = "center";
    elem.style.backgroundSize = "contain";
    play_area.appendChild(elem);
    return elem;
}

export function createJumperZombieModel(x, y) {
    var elem = document.createElement("div");
    elem.style.height = "30px";
    elem.style.width = "30px";
    elem.style.zIndex = "20";
    elem.style.position = "absolute";
    elem.style.left = (x - 15) + "px";
    elem.style.top = (y - 15) + "px";
    elem.style.backgroundImage = "url(./data/enemies/jumper_zombie_full.png)";
    elem.style.backgroundPosition = "center";
    elem.style.backgroundSize = "contain";
    play_area.appendChild(elem);
    return elem;
}

const blood = [
    ["./data/blood/big_0.png", "./data/blood/big_1.png", "./data/blood/big_2.png", "./data/blood/big_3.png", "./data/blood/big_4.png", 
     "./data/blood/big_5.png", "./data/blood/big_6.png", "./data/blood/big_7.png", "./data/blood/big_8.png", "./data/blood/big_9.png"], //big ~45x45
    ["./data/blood/med_0.png", "./data/blood/med_1.png", "./data/blood/med_2.png", "./data/blood/med_3.png", "./data/blood/med_4.png", 
     "./data/blood/med_5.png", "./data/blood/med_6.png", "./data/blood/med_7.png", "./data/blood/med_8.png", "./data/blood/med_9.png"], //medium ~25x25
    ["./data/blood/small_0.png", "./data/blood/small_1.png", "./data/blood/small_2.png", "./data/blood/small_3.png", "./data/blood/small_4.png", 
     "./data/blood/small_5.png", "./data/blood/small_6.png", "./data/blood/small_7.png", "./data/blood/small_8.png", "./data/blood/small_9.png"], // small ~15x15
    [3],[4],[5],[6],[7],[8],["./data/blood/lar_0.png"]
];
export function drawBlood(x, y, type) {
    var i = type;
    if (i == 1) {
        //small or medium splatter
        const prob = [1, 2, 2, 2];
        i = prob[Math.floor(Math.random() * prob.length)];
    } else if (i == 9) {
        //large splatter
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