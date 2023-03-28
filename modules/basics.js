export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function objectsOverlap(object1, object2) {
    return objectsOverlapGeneric(object1, object2, 0);
}

export function objectsOverlapPlayer(object1, object2) {
    return objectsOverlapGeneric(object1, object2, 10);
}

export function objectsOverlapOther(object1, object2, value) {
    return objectsOverlapGeneric(object1, object2, value);
}

function objectsOverlapGeneric(object1, object2, correction) {
    const rec1 = object1.model.getBoundingClientRect();
    const rec2 = object2.model.getBoundingClientRect();
    return !(
        rec1.top + correction > rec2.bottom - correction ||
        rec1.right - correction < rec2.left + correction ||
        rec1.bottom - correction < rec2.top + correction ||
        rec1.left + correction > rec2.right - correction
    );
}

export function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}