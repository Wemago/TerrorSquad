const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

const game = require('./classes/tictactoe');

let todoList = [];

app.set("view engine", "ejs");

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render('index');
});

app.get("/chat", (req, res) => {
    res.render("chat", { roomId: 'chat' });
});

app.get("/game", (req, res) => {
    res.render('game', { roomId: 'game' });
});

app.get("/editor", (req, res) => {
    res.render('editor', { roomId: 'editor' });
});

app.get("/whiteboard", (req, res) => {
    res.render('whiteboard', { roomId: 'whiteboard' });
});

app.get("/todo", (req, res) => {
    res.render('todo', { roomId: 'todo', todoList: todoList });
});

app.get("/about", (req, res) => {
    res.render('about');
});

io.on("connection", (socket) => {

    socket.on("join-room", (roomId, userId, userName) => {

        socket.join(roomId);

        socket.to(roomId).broadcast.emit("user-connected", userId);

        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });

    });

    // TicTacToe

    game.addPlayer(socket);

    socket.on('selectSquare', function(data) {
        game.selectSquare(socket, data);
    });


    // Editor

    socket.on('code', function(data) {
        socket.broadcast.emit('code', data);
    });

    // Whiteboard

    socket.on('drawing', function(data) {
        socket.broadcast.emit('drawing', data);
        console.log(data);
    });

    socket.on('rectangle', function(data) {
        socket.broadcast.emit('rectangle', data);
        console.log(data);
    });

    socket.on('linedraw', function(data) {
        socket.broadcast.emit('linedraw', data);
        console.log(data);
    });

    socket.on('circledraw', function(data) {
        socket.broadcast.emit('circledraw', data);
        console.log(data);
    });

    socket.on('ellipsedraw', function(data) {
        socket.broadcast.emit('ellipsedraw', data);
        console.log(data);
    });

    socket.on('textdraw', function(data) {
        socket.broadcast.emit('textdraw', data);
        console.log(data);
    });

    socket.on('copyCanvas', function(data) {
        socket.broadcast.emit('copyCanvas', data);
        console.log(data);
    });

    socket.on('Clearboard', function(data) {
        socket.broadcast.emit('Clearboard', data);
        console.log(data);
    });

    // ToDo List

    socket.on('todoList', function() {
        socket.emit("transmitTodoList", todoList);
    });

    socket.on('addTask', function(task) {
        task.id = Date.now(); // we generate an ID for the task
        task.done = false; // we assign the false status 
        todoList.push(task); // we add the new one in our array
        io.emit('transmitTodoList', todoList); // send to all include the sender
    });

    socket.on('actionTask', function(id) {
        if (id != '' && id != undefined) { // we check if there is a valid id
            todoList.forEach((item, index) => { // we loop our todoList array
                if (item.id == id) { // when the id of the request is equal to the id in array
                    item.done = ((item.done == false) ? true : false); // we reverse the value
                }
            });
        };
        io.emit('transmitTodoList', todoList); // send to all include the sender
    });


    // Disconnect

    //socket.on('disconnect', () => {
    //   console.log('Client disconnected');
    //   game.removePlayer(socket);
    //});

});

server.listen(process.env.PORT || 3030);