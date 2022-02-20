const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { Scene } = require('./boid');

app.use(express.static('client'));

io.on('connection', (socket) => {
    console.log('User ' + player.name + 'connected');
    socket.on('update player', () => {
        socket.emit('data frame', JSON.stringify({ playerID: myScene.updatePlayer(player.playerID, player.x, player.y, player.name, player.tint) }));
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const myScene = new Scene(50);

function intervalFunc() {
    myScene.tick(50);
    const json = myScene.getJSON();
    /*const json = { 
        boids: [
            {x: 0, y: 0, dx: 0, dy: 0},
            {x: 0, y: 1, dx: 0, dy: 0},
            {x: 1, y: 0, dx: 0, dy: 0},
            {x: 1, y: 1, dx: 0, dy: 0}
        ], 
        players: 
        [
            { playerID: 1, x: 0, y: 0, name: "Orry", tint: 10000000 }
        ] 
    };*/
    
    io.emit(JSON.stringify(json));
}
  
setInterval(intervalFunc, 50);

module.exports = app;
