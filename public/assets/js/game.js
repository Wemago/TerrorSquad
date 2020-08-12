const cells = document.getElementsByClassName('cell');

let gameStart = 'X';
let turn = 'X';
setTurn();

const board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];


Array.from(cells).forEach(cell => {
    const idOfCell = cell.id;
    document.getElementById(idOfCell).addEventListener('click', () => {
        selectCell(idOfCell[1], idOfCell[3]);
    });
});

function selectCell(rowNo, colNo) {
    console.log(`Selected cell of row ${rowNo} and col ${colNo}`);
    if (board[rowNo-1][colNo-1] === '') {
        setCellValue(rowNo, colNo, turn);
        const winner = checkWin();
        if (winner != '') {
            displayMsg(winner === 'D' ? `Game draw!` : `${winner} won! Game ends!`)
            endGame();
        } else {
            toggleTurn();
        }
    } else {
        displayMsg('Already selected. Select another!');
    }
}

function setCellValue(rowNo, colNo, value) {
    document.getElementById(`r${rowNo}c${colNo}`).textContent = value;
    board[rowNo-1][colNo-1] = value;
}

function setTurn() {
    document.getElementById('turn-of').textContent = turn;
}

function toggleTurn() {
    turn = turn === 'X' ? 'O' : 'X';
    setTurn();
}

function checkWin() {
    if (allFilled())
        return 'D';
    if (checkForValue('X'))
        return 'X';
    if (checkForValue('O'))
        return 'O';
    return '';
}

function allFilled() {
    for(let i=0; i<3; i++) {
        for(let j=0; j<3; j++) {
            if (board[i][j] === '') {
                return false;
            }
        }
    }
    return true;
}

function checkForValue(value) {
    for(let rowNo = 1; rowNo <=3 ; rowNo++) {
        if (checkRowComplete(rowNo, value))
            return true;
    }

    for(let colNo = 1; colNo <=3 ; colNo++) {
        if (checkColComplete(colNo, value))
            return true;
    }

    if (checkDiagComplete(value))
        return true;

    return false;
}

function checkRowComplete(rowNo, value) {
    for(let i=0; i<3; i++) {
        if (board[rowNo-1][i] !== value) {
            return false;
        }
    }
    return true;
}

function checkColComplete(colNo, value) {
    for(let i=0; i<3; i++) {
        if (board[i][colNo-1] !== value) {
            return false;
        }
    }
    return true;
}

function checkDiagComplete(value) {
    let flag = true;
    for(i=0; i<3; i++) {
        if (board[i][i] !== value){
            flag = false;
            break;
        }
    }
    if (flag) {
        return true;
    }

    flag = true;
    for(i=0; i<3; i++) {
        if (board[i][2-i] !== value){
            flag = false;
            break;
        }
    }
    if (flag) {
        return true;
    }

    return false;
}

function endGame() {
    for(let i=0; i<3; i++) {
        for(let j=0; j<3; j++) {
            setCellValue(i+1, j+1, '');
        }
    }
    gameStart = gameStart === 'X' ? 'O' : 'X';
    turn = gameStart;
    setTurn();
}

function displayMsg(msg) {
    document.getElementById('message').textContent = msg;
    document.getElementById('message-container').style.display = 'block';
}

document.getElementById('message-container').addEventListener('click', () => {
    document.getElementById('message-container').style.display = 'none';
})