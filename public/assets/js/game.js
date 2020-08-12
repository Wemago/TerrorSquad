const socket = io();

let playerRole = null;
let playerTurn = false;

socket.on('registerID', (role) => {

    console.log('role', role);
    playerRole = role;

    document.getElementById('role').innerHTML = 'You are ' + (role === 0 ? 'X' : role === 1 ? 'O' : 'a spectator');
});

socket.on('changeTurn', (role) => {

    playerTurn = playerRole === role;

    document.getElementById('turn').innerHTML = 'It is ' + (playerTurn ? '' : 'NOT') + ' your turn';
});

socket.on('updateBoard', (board) => {
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (board[y][x]) {
                document.getElementById('btn' + y + x).innerHTML = board[y][x];
            }
        }
    }
});

const canPlace = (elm) => {

    if (playerRole !== 0 && playerRole !== 1) {
        return false;
    }

    if (!playerTurn) {
        return false;
    }

    if (elm.innerHTML) {
        return false;
    }

    return true;
}

for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
        document.getElementById('btn' + y + x).addEventListener('click', (e) => {
            if (canPlace(e.srcElement)) {
                e.srcElement.innerHTML = playerRole === 0 ? 'X' : 'O';
                socket.emit('playerMove', playerRole, x, y);
            }
        });
    }
}