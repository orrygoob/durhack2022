const express = require('express');
let expressWs = require('express-ws');
const { Config } = require('./config');
const { Game } = require('./game');

expressWs = expressWs(express());
const app = expressWs.app;

app.use(express.static('client'));

const myWebsocket = expressWs.getWss('/');

const game = new Game(levelChangeCallback);
let currentLevelGoals = [0, 0, 0, 0];
let currentLevel = 0;

app.ws('/', function (ws, req) {
	if (!game.started) {
		game.start();
	}

	ws.onmessage = function (msg) {
		const player = JSON.parse(msg.data);
		const ret = game.scene.updatePlayer(player.playerID, player.x, player.y, player.dx, player.dy, player.name, player.tint);
		if (ret[1]) { // isNewPlayer
			ws.send(JSON.stringify({ playerID: ret[0] /* playerID */ }));
			ws.send(JSON.stringify({ level: currentLevel, goalSet: currentLevelGoals }));
		}
	};
});

function intervalFunc () {
	const now = process.hrtime();
	const delta = (now[0] * 1000 + now[1] / 1000000) - prevTime;
	prevTime += delta;
	if (game.started) {
		game.tick(delta);
		const json = game.scene.getJSON();
		myWebsocket.clients.forEach(async function (client) {
			client.send(JSON.stringify(json));
		});
	}
}

function levelChangeCallback (goalDescriptors, levelNumber) {
	currentLevel = levelNumber;
	currentLevelGoals = goalDescriptors;
	myWebsocket.clients.forEach(function (client) {
		client.send(JSON.stringify({ level: levelNumber, goalSet: goalDescriptors }));
	});
}

const now = process.hrtime();
let prevTime = (now[0] * 1000 + now[1] / 1000000);
setInterval(intervalFunc, Config.server.tick);

module.exports = app;
