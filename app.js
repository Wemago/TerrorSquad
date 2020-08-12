const express = require('express');
const socket = require('socket.io');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log('Server listening at port ' + port);
});

const io = socket(server);

const game = require('./game');

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

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/app.html'));
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

    socket.emit('registerID', game.register(socket.id));
    io.emit('changeTurn', game.changeTurn());

    socket.on('playerMove', (role, x, y) => {
        io.emit('updateBoard', game.place(role, x, y));
        game.toggleTurn();
        io.emit('changeTurn', game.changeTurn());
    });

    socket.on('chat', (data) => {
        io.sockets.emit('chat', data);
    })

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    })

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        game.unregister(socket.id);
        io.emit('updateBoard', game.reset());
        io.emit('changeTurn', game.changeTurn());
    });

});