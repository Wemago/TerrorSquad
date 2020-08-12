const express = require('express');
const socket = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log('Server listening at port ' + port);
});

const io = socket(server);

const { v4: uuidV4 } = require('uuid');

// Static files
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/game', (req, res) => {
    res.sendFile('game.html')
});

app.get('/:room', (req, res) => {
    res.render('index', { room: req.params.room });
})

io.on('connection', (socket) => {

    console.log('Socket connected', socket.id);

    socket.on('join-room', (roomId, userId) => {

        console.log(roomId, userId);

        socket.join(roomId);

        socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('chat', (data) => {
            io.sockets.emit('chat', data);
        })

        socket.on('typing', (data) => {
            socket.broadcast.emit('typing', data);
        })

        socket.on('disconnect', () => {
            console.log('Client disconnected');
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });

    });

});