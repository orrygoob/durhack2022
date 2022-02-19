const express = require('express');
var expressWs = require('express-ws');

var expressWs = expressWs(express());
var app = expressWs.app;

app.use(express.static('client'));

var myWebsocket = expressWs.getWss('/');

app.ws('/', function(ws, req) {
    ws.onmessage = function(msg) {
        console.log(msg.data);
    };
});

myWebsocket.clients.forEach(function (client) {
    client.send(msg.data + "somefrf");
});

module.exports = app;
