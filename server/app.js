const express = require('express');
let expressWs = require('express-ws');
const { json } = require('express/lib/response');

expressWs = expressWs(express());
const app = expressWs.app;

app.use(express.static('client'));

const myWebsocket = expressWs.getWss('/');

app.ws('/', function(ws, req) {
    ws.onmessage = function(msg) {
        player = JSON.parse(msg);
        
    };
});

// Callback to be attached to scene tick method
function tickCallback(json) {
    myWebsocket.clients.forEach(function (client) {
        client.send(json);
    });
}
module.exports = app;
