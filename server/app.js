const express = require('express');
var expressWs = require('express-ws');
const { json } = require('express/lib/response');

var expressWs = expressWs(express());
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
