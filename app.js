const express = require('express');
const socket = require('socket.io');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log('Server listening at port ' + port);
});

const io = socket(server);

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

io.on('connection', (socket) => {

    console.log('Socket connected', socket.id);

    socket.on('chat', (data) => {
        io.sockets.emit('chat', data);
    })

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    })

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

});