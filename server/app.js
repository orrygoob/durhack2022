const express = require('express');
let expressWs = require('express-ws');
const { Config } = require('./config');
const { Scene } = require('./boid');

expressWs = expressWs(express());
const app = expressWs.app;

app.use(express.static('client'));

const myWebsocket = expressWs.getWss('/');

const myScene = new Scene(200);

app.ws('/', function (ws, req) {
	ws.onmessage = function (msg) {
		console.log(msg.data);
		const player = JSON.parse(msg.data);
		ws.send(JSON.stringify({ playerID: myScene.updatePlayer(player.playerID, player.x, player.y, player.name, player.tint) }));
	};
});

function intervalFunc () {
	const now = process.hrtime();
	const delta = (now[0] * 1000 + now[1] / 1000000) - prevTime;
	prevTime += delta;
	myScene.tick(delta);
	const json = myScene.getJSON();
	myWebsocket.clients.forEach(function (client) {
		client.send(JSON.stringify(json));
	});
}

const now = process.hrtime();
let prevTime = (now[0] * 1000 + now[1] / 1000000);
setInterval(intervalFunc, Config.server.tick);

module.exports = app;
