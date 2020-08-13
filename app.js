const express = require('express');
const socket = require('socket.io');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log('Server listening at port ' + port);
});

const io = socket(server);

const game = require('./classes/game');

let serverTaskList = [];

// Static files
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/index.html'));
})

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/chat.html'));
})

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/game.html'));
})

app.get('/whiteboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/whiteboard.html'));
})

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/editor.html'));
})

app.get('/todo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/todo.html'));
})

app.use((req, res) => {
    res.status(404);
    res.send('Bad Request.');
})

app.use((err, req, res, next) => {
    res.type('text/plain')
    res.send('Error500')
    console.log(err)
})

io.on('connection', (socket) => {

    console.log('Socket connected', socket.id);

    // TicTacToe

    game.addPlayer(socket);

    socket.on('selectSquare', function(data) {
        game.selectSquare(socket, data);
    });

    // Chat

    socket.on('chat', (data) => {
        io.sockets.emit('chat', data);
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    // WhiteBoard

    socket.on("size", function(size) {
        socket.broadcast.emit("onsize", size);
    });

    socket.on("color", function(color) {
        socket.broadcast.emit("oncolor", color);
    });

    socket.on("toolchange", function(tool) {
        socket.broadcast.emit("ontoolchange", tool);
    });

    socket.on("hamburger", function() {
        socket.broadcast.emit("onhamburger");
    });

    socket.on("mousedown", function(point) {
        socket.broadcast.emit("onmousedown", point);
    });

    socket.on("mousemove", function(point) {
        console.log("Recieved Mouse down event")
        socket.broadcast.emit("onmousemove", point);
    });

    socket.on("undo", function() {
        socket.broadcast.emit("onundo");
    });

    socket.on("redo", function() {
        socket.broadcast.emit("onredo");
    });

    // Editor

    socket.on('code', function(data) {
        socket.broadcast.emit('code', data);
    });

    // TODO List
    socket.emit('taskListFromServer', serverTaskList);

    socket.on('taskListToServer', function(taskListData) {
        serverTaskList = taskListData;
        socket.broadcast.emit('taskListFromServer', serverTaskList);
    });

    // Disconnect

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        game.removePlayer(socket);
    });

});