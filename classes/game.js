const players = [
    { id: null, avail: true, turn: false },
    { id: null, avail: true, turn: false },
];

exports.register = (id) => {
    if (players[0].avail) {
        players[0].id = id;
        players[0].avail = false;
        players[0].turn = true;
        return 0;
    } else if (players[1].avail) {
        players[1].id = id;
        players[1].avail = false;
        players[1].turn = false;
        return 1;
    } else {
        return 2;
    }
}

exports.unregister = (id) => {
    for (p in players) {
        if (players[p].id === id) {
            players[p].id = null;
            players[p].avail = true;
            players[0].turn = false;
            players[1].turn = false;
        }
    }
}

exports.toggleTurn = () => {
    if (players[0].turn) {
        players[0].turn = false;
        players[1].turn = true;
    } else if (players[1].turn) {
        players[0].turn = true;
        players[1].turn = false;
    }
}

exports.changeTurn = () => {
    if (players[0].turn) {
        return 0;
    }
    if (players[1].turn) {
        return 1;
    }
}


///////////////////////////////////////////
const gameboard = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
];

exports.place = (role, x, y) => {
    if (role === 0) {
        gameboard[y][x] = 'X';
    } else if (role === 1) {
        gameboard[y][x] = 'O';
    }
    return gameboard;
}

exports.reset = () => {
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            gameboard[y][x] = null;
        }
    }
}