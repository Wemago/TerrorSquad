const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html');
});

app.get('/video', (req, res) => {
    res.sendFile(__dirname + '/public/views/video.html');
});

app.get('/game', (req, res) => {
    res.sendFile(__dirname + '/public/views/game.html');
});

app.listen(port, () => {
    console.log("Example app");
});