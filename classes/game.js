/**
 * Helper to convert coordinate points into coordinate objects
 *
 * @param {int} x
 * @param {int} y
 * @return {dict} coordinate as {col: x, row: y}
 */
var P = function(x, y) {
    return {
        col: x,
        row: y,
    };
}

// a list of possible win conditions as coordinate sets
var WIN_CONDITIONS = [
    [P(0, 0), P(1, 0), P(2, 0)],
    [P(0, 1), P(1, 1), P(2, 1)],
    [P(0, 2), P(1, 2), P(2, 2)],
    [P(0, 0), P(0, 1), P(0, 2)],
    [P(1, 0), P(1, 1), P(1, 2)],
    [P(2, 0), P(2, 1), P(2, 2)],
    [P(0, 0), P(1, 1), P(2, 2)],
    [P(2, 0), P(1, 1), P(0, 2)],
];

/**
 * The game being run on the server
 */
var Game = function() {
    this.player1 = null;
    this.player2 = null;
    this.board = null;
};

/**
 * @return True if the game has two players playing
 */
Game.prototype.isRunning = function() {
    return this.player1 !== null && this.player2 !== null;
};

/**
 * Add the given player to the game. Will also send back data
 * on the 'init' channel related to the player's status:
 *  {
 *      isPlaying: true | false,
 *      player: 1 | 2, // if isPlaying
 *  }
 *
 * @param {Socket} player -- the player to add
 */
Game.prototype.addPlayer = function(player, numberOfSockets) {
    if (this.isRunning()) {
        player.emit('init', {
            isPlaying: false,
        });
    }
    var status = {
        isPlaying: true,
    };
    if (this.player1 === null) {
        this.player1 = player;
        status.player = 1;
    } else if (this.player2 === null) {
        this.player2 = player;
        status.player = 2;
    }
    player.emit('init', status);
    if (this.player2 !== null) {
        this.startGame();
    }
    return numberOfSockets++;
};

/**
 * Removes the given player from the game. The other player will
 * receive a notification on the 'finish' channel with "result" set
 * to "quit"
 */
Game.prototype.removePlayer = function(player) {
    var data = {
        type: 'quit',
    };
    if (player === this.player1 && this.player2 !== null) {
        this.player2.emit('finish', data);
    } else if (player === this.player2 && this.player1 !== null) {
        this.player1.emit('finish', data);
    }
    this.player1 = null;
    this.player2 = null;
};

/**
 * Resets the state to the start of a game
 */
Game.prototype.startGame = function() {
    // will be filled with player ids
    this.board = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ];
    // select the current player
    if (Math.floor(Math.random() * 2) === 0) {
        this.current_player = this.player1;
        this.opponent = this.player2;
    } else {
        this.current_player = this.player2;
        this.opponent = this.player1
    }
    // send data
    this.current_player.emit('start', {
        current: true,
    });
    this.opponent.emit('start', {
        current: false,
    });
};

/**
 * Select the given square for the given player. Square chosen as coordinates
 * of the format {col: x, row: y}, where col is the index of the column (0-2)
 * and row is the index of the row (0-2).
 *
 * @param {Socket} player -- the player that sent the command
 * @param {dict} coordinates -- the square to select
 */
Game.prototype.selectSquare = function(player, coordinates) {
    // just in case
    if (player !== this.current_player) {
        return;
    }

    var col = coordinates.col;
    var row = coordinates.row;

    // check for valid coordinates
    if (col < 0 || col > 2 || row < 0 || row > 2) {
        player.emit('gameError', 'Invalid square received');
        return;
    }

    if (this.board[row][col] !== null) {
        player.emit('gameError', 'Square is taken');
        return;
    }

    this.board[row][col] = player.id;
    this.opponent.emit('opponentMove', coordinates);

    var result = this.getResult();
    if (result.type === 'switch') {
        this.switchTurns();
    } else {
        this.current_player.emit('finish', result);
        if (result.type === 'over') {
            result.win = !result.win;
        }
        this.opponent.emit('finish', result);
    }
};

/**
 * Check if the game is finished, returning finished game data
 *
 * @return {dict} in the given format:
 *      {
 *          type: "switch" | "over" | "draw",
 *          win: true | false,
 *          coords: [coord, coord, coord], // coordinates for the winning squares
 *      }
 */
Game.prototype.getResult = function() {
    var board = this.board;
    var current = this.current_player.id;
    var opponent = this.opponent.id;
    var results = WIN_CONDITIONS
        .map(function(coords) {
            var win = coords.every(function(coord) {
                return board[coord.row][coord.col] === current;
            });
            var lose = coords.every(function(coord) {
                return board[coord.row][coord.col] === opponent;
            });
            if (!win && !lose) {
                return null;
            } else {
                return {
                    type: 'over',
                    win: win,
                    coords: coords,
                };
            }
        })
        .filter(function(val) {
            return val !== null;
        });

    if (results.length > 0) {
        return results[0];
    }

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (this.board[i][j] === null) {
                return {
                    type: 'switch',
                };
            }
        }
    }
    // board is full
    return {
        type: 'draw',
    };
};

/**
 * Run necessary actions to update the current player for
 * the next turn.
 */
Game.prototype.switchTurns = function() {
    var prev = this.current_player;
    this.current_player = this.opponent;
    this.opponent = prev;

    this.current_player.emit('startTurn');
    this.opponent.emit('waitForOpponent');
};

module.exports = new Game();