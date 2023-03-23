import { createItemModel } from "../graphics.js";
import { objectsOverlap } from "../basics.js";

class Item {
    pos = {
        x: 0,
        y: 0
    };
    type;
    model;
    constructor(x, y, type) {
        this.pos.x = x;
        this.pos.y = y;
        this.type = type;
        this.model = createItemModel(x, y, type);
    };
    playerCollision(player) {
        if (objectsOverlap(this, player)) {
            player.receiveItem(this.type);
            this.model.remove();
            return true;
        }
        return false;
    };
}

export function spawnNewItem(type) {
    var x1 = Math.random() * (document.body.getBoundingClientRect().width - 100) + 100;
    var y1 = Math.random() * (document.body.getBoundingClientRect().height - 100) + 100;
    return new Item(x1, y1, type);
}