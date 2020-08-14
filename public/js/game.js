// the tic-tac-toe board
var board;
// true if the current player is player X
var isX;
// the Socket.io object to communicate with the server
var socket = io({
    reconnection: false,
});

$(document).ready(function() {
    // logistical events
    socket.on('init', init);
    socket.on('start', start);
    socket.on('gameError', handleError);
    socket.on('finish', function(data) {
        socket.disconnect();
        finish(data);
    });
    // game events
    socket.on('startTurn', startTurn);
    socket.on('waitForOpponent', waitForOpponent);
    socket.on('opponentMove', logOpponentMove);
});

/**
 * Sets up the game board for the current user, with the
 * given game information
 *
 * @param {dict} status -- game information, including whether
 *      the current user is playing and what player the user is.
 */
var init = function(status) {
    if (!status.isPlaying) {
        $("p.status").text("Game is already in session");
        return;
    }
    isX = status.player === 1;
    var symbol = isX ? "X" : "O";
    $("p.info").text("You are player: " + symbol);
    $("p.status").text("Waiting for another player...");

    board = $("table#game");
    for (var i = 0; i < 3; i++) {
        var row = $("<tr>");
        for (var j = 0; j < 3; j++) {
            $("<td>")
                .addClass("empty")
                .data("coordinates", {
                    col: j,
                    row: i,
                })
                .appendTo(row);
        }
        row.appendTo(board);
    }

    board.find("td").click(selectSquare);
};

/**
 * Starts the game, with the given data.
 *
 * @param {dict} data -- information on the start of the
 *      game, including if the current user is starting
 */
var start = function(data) {
    if (data.current) {
        startTurn();
    } else {
        waitForOpponent();
    }
};

/**
 * Display the given error message
 *
 * @param {String} message -- the error message
 */
var handleError = function(message) {
    $("p.status").text(message);
};

/**
 * Finishes the game, with the given result.
 *
 * @param {dict} result -- information on the end of the
 *      game, including the result of the game and the
 *      winning row/column/diagonal.
 */
var finish = function(result) {
    switch (result.type) {
        case "quit":
            $("p.status").text("Opponent disconnected.");
            break;
        case "draw":
            $("p.status").text("Nobody won. (or everybody won?)");
            break;
    }
    if (result.coords !== undefined) {
        if (result.win) {
            $("p.status").text("You won!");
        } else {
            $("p.status").text("You lost.");
        }
        $.each(result.coords, function(i, coord) {
            var square = getSquare(coord);
            $(square).addClass("highlight");
        });
    }
};

/**
 * Update the screen to indicate that it's the current user's turn.
 */
var startTurn = function() {
    $("p.status").text("Select a square");
    $("td.empty").addClass("active");
};

/**
 * Runs when the current user selects a square to mark
 *
 * @this {Node} -- the DOM node that the user selected
 */
var selectSquare = function() {
    // exit if not your turn
    if (!$(this).hasClass("active")) {
        return;
    }
    var coordinates = $(this).data("coordinates");
    socket.emit('selectSquare', coordinates);

    $("p.status").text("Waiting for server...");
    logMove(this, true);
};

/**
 * Return the square with the given coordinates
 *
 * @param {dict} coordinates -- coordinates of the form
 *      {col: x, row: y}
 * @return {Node} the square for the given coordinates
 */
var getSquare = function(coordinates) {
    var col = coordinates.col;
    var row = coordinates.row;

    if (col < 0 || col > 2 || row < 0 || col > 2) {
        return null;
    } else {
        return $("tr")[row].children[col];
    }
};

/**
 * Update the screen to indicate that it's the opponent's turn.
 */
var waitForOpponent = function() {
    $("p.status").text("Waiting for opponent...");
    $(".active").removeClass("active");
};

/**
 * Displays the opponent's move on the screen
 *
 * @param {dict} coordinates -- the coordinates in the format
 *      {col: x, row: y}
 */
var logOpponentMove = function(coordinates) {
    var square = getSquare(coordinates);
    logMove(square, false);
};

/**
 * Log the given move with the given symbol
 *
 * @param {Node} square -- the square selected
 * @param {bool} isCurrent -- true if logging for the current player
 */
var logMove = function(square, isCurrent) {
    if (isCurrent && isX || !isCurrent && !isX) {
        var symbol = "X";
    } else {
        var symbol = "O";
    }
    $(square)
        .removeClass("empty")
        .removeClass("active")
        .addClass("player")
        .addClass(symbol);
};