const express = require('express');
let expressWs = require('express-ws');

expressWs = expressWs(express());
const app = expressWs.app;

app.use(express.static('client'));

const myWebsocket = expressWs.getWss('/');

app.ws('/', function(ws, req) {
    ws.onmessage = function(msg) {
        console.log(msg);
        //player = JSON.parse(msg);
        // { id, x, y, name, tint }


    };
});

function intervalFunc() {
    //const json = myScene.getJSON();
    const json = { 
        boids: [
            {x: 0, y: 0, dx: 0, dy: 0},
            {x: 0, y: 1, dx: 0, dy: 0},
            {x: 1, y: 0, dx: 0, dy: 0},
            {x: 1, y: 1, dx: 0, dy: 0}
        ], 
        players: 
        [
            { playerID: 1, x: 0, y: 0, name: "Orry", tint: 23 }
        ] 
    };
    myWebsocket.clients.forEach(function (client) {
        client.send(JSON.stringify(json));
    });
}
  
setInterval(intervalFunc, 1500);

module.exports = app;
