export class Statistics {
    time;
    kills;
    accuracy = {
        fired: 0,
        hit: 0
    }
    constructor () {
        this.time = 0;
        this.accuracy.fired = 0;
        this.accuracy.hit = 0;
        this.kills = 0;
    };
    getAccuracy() {
        if (this.accuracy.fired == 0) {
            return 0;
        } else {
            return Math.round((this.accuracy.hit / this.accuracy.fired) * 10000) / 100;
        }
    }
}