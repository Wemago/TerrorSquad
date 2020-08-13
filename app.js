const express = require("express");
const socket = require("socket.io");
const path = require("path");
const { v4: uuidV4 } = require("uuid");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log("Server listening at port " + port);
});

const io = socket(server);

const game = require("./classes/game");

// let serverTaskList = [];
let todoList = [];

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/index.html"));
});

app.get("/chat", (req, res) => {
  //res.sendFile(path.join(__dirname, 'public/views/chat.html'));
  res.render("chat", { roomId: 1 });
});

app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/game.html"));
});

app.get("/whiteboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/whiteboard.html"));
});

app.get("/editor", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/editor.html"));
});

app.get("/todo", (req, res) => {
  //res.sendFile(path.join(__dirname, 'public/views/todo.html'));
  res.render("todo", { todoList: todoList });
});

// app.use((req, res) => {
//     res.status(404);
//     res.send('Bad Request.');
// })

// app.use((err, req, res, next) => {
//     res.type('text/plain')
//     res.send('Error500')
//     console.log(err)
// })

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  // TicTacToe

  game.addPlayer(socket);

  socket.on("selectSquare", function (data) {
    game.selectSquare(socket, data);
  });

  // Chat

  socket.on("chat", (data) => {
    io.sockets.emit("chat", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);

    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });

  // WhiteBoard
  socket.on("drawing", function (data) {
    socket.broadcast.emit("drawing", data);
    console.log(data);
  });

  socket.on("rectangle", function (data) {
    socket.broadcast.emit("rectangle", data);
    console.log(data);
  });

  socket.on("linedraw", function (data) {
    socket.broadcast.emit("linedraw", data);
    console.log(data);
  });

  socket.on("circledraw", function (data) {
    socket.broadcast.emit("circledraw", data);
    console.log(data);
  });

  socket.on("ellipsedraw", function (data) {
    socket.broadcast.emit("ellipsedraw", data);
    console.log(data);
  });

  socket.on("textdraw", function (data) {
    socket.broadcast.emit("textdraw", data);
    console.log(data);
  });

  socket.on("copyCanvas", function (data) {
    socket.broadcast.emit("copyCanvas", data);
    console.log(data);
  });

  socket.on("Clearboard", function (data) {
    socket.broadcast.emit("Clearboard", data);
    console.log(data);
  });

  // Editor

  socket.on("code", function (data) {
    socket.broadcast.emit("code", data);
  });

  // TODO List

  socket.on("todoList", function () {
    // const content = fs.readFileSync('data/data.json', 'utf8');
    // const todoList = JSON.parse(content);

    socket.emit("transmitTodoList", todoList);
  });

  socket.on("addTask", function (task) {
    task.id = Date.now(); // we generate an ID for the task
    task.done = false; // we assign the false status

    // const content = fs.readFileSync('data/data.json', 'utf8');
    // const data = JSON.parse(content);
    // data.taches.push({user:name, descr:task});
    // const susu = JSON.stringify(data);
    // fs.writeFile('data.json', susu, function(err){
    // 	if(err) throw err;
    // 	console.log('file saved !')
    // })

    todoList.push(task); // we add the new one in our array
    io.emit("transmitTodoList", todoList); // send to all include the sender
  });

  socket.on("actionTask", function (id) {
    if (id != "" && id != undefined) {
      // we check if there is a valid id
      todoList.forEach((item, index) => {
        // we loop our todoList array
        if (item.id == id) {
          // when the id of the request is equal to the id in array
          item.done = item.done == false ? true : false; // we reverse the value
        }
      });
    }
    io.emit("transmitTodoList", todoList); // send to all include the sender
  });

  // Disconnect

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    game.removePlayer(socket);
  });
});
