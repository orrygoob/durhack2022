/* global PIXI */
'use strict';
import { Config } from './config.js';

const app = new PIXI.Application({
	autoResize: true,
	resolution: devicePixelRatio,
	backgroundColor: 0x335533
});

app.stage.interactive = true;

const boidTexture = PIXI.Texture.from('../assets/textures/sheep_from_above_low_res.png');
const playerTexture = PIXI.Texture.from('../assets/textures/dog_low_res.png');

let boidSprites = [];
let zoneObjects = [];
let playerSprites = {};
let playerID = -1;

let cachedPlayersData = null;
let cachedBoidsData = null;

let socket = null;

let cachedUsername = '';
let cachedTint = '';

const prevPlayerX = [];
const prevPlayerY = [];

let playerX = -1;
let playerY = -1;

document.addEventListener('DOMContentLoaded', () => {
	previewTint();

	if (getUsername() !== null && getUsername() !== null) {
		onLogin();
	}

	document.getElementById('login-button').addEventListener('click', () => {
		const username = document.getElementById('login-username').value;
		const tint = document.getElementById('login-color').value.replace('#', '');

		if (username.length > 0 && isValidHexColor(tint)) {
			setUsername(username);
			setUserTint(parseInt(tint, 16));

			onLogin();
		} else {
			alert('Invalid username or color!');
		}
	});

	document.getElementById('login-color').addEventListener('input', (e) => {
		previewTint();
	});

	document.getElementById('logout-button').addEventListener('click', () => {
		logout();
	});

	document.getElementById('body').addEventListener('onfocusout', () => {
		logout();
	});
	// document.getElementById('pixi-app').addEventListener('mousemove', (e) => {
	// 	if (socket !== null && playerID !== -1) {
	// 		const size = getSize();
	// 		socket.send(JSON.stringify({ playerID: playerID, x: e.offsetX / size, y: e.offsetY / size, name: getUsername(), tint: getUserTint() }));
	// 	}
	// });
});

function previewTint () {
	const tint = document.getElementById('login-color').value.replace('#', '');

	if (isValidHexColor(tint)) {
		document.getElementById('login-color').style.backgroundColor = '#' + tint;
	}
}

// Does not expect a # beforehand!
function isValidHexColor (color) {
	const colorInt = parseInt(color, 16);
	return color.length === 6 && !isNaN(colorInt) && colorInt >= 0 && colorInt <= 0xffffff;
}

function onLogin () {
	document.getElementById('login').classList.add('hidden');
	document.getElementById('logout-button').classList.remove('hidden');
	app.view.id = 'pixi-app';
	document.getElementById('wrapper').appendChild(app.view);

	document.getElementById('pixi-app').addEventListener('mousemove', (e) => {
		if (socket !== null && playerID !== -1) {
			const size = getSize();

			prevPlayerX.push(playerX);
			prevPlayerY.push(playerY);

			if (prevPlayerX.length >= 20) {
				prevPlayerX.shift();
			}
			if (prevPlayerY.length >= 20) {
				prevPlayerY.shift();
			}

			playerX = e.offsetX / size;
			playerY = e.offsetY / size;
		}
	});

	socket = new WebSocket('ws://' + window.location.host);
	socket.onopen = async () => {
		socket.send(JSON.stringify({ playerID: -1, x: playerX, y: playerY, dx: 0, dy: 0, name: getUsername(), tint: getUserTint() }));
	};

	socket.onmessage = async (event) => {
		const jsonData = JSON.parse(event.data);
		if (jsonData.boids === undefined && !jsonData.goalSet) {
			playerID = jsonData.playerID;
		} else if (jsonData.goalSet) {
			document.getElementById('level-counter').innerText = 'Level: ' + (jsonData.level + 1);

			for (const zone of zoneObjects) {
				app.stage.removeChild(zone);
			}
			zoneObjects = [];

			for (let i = 0; i < jsonData.goalSet.length; i++) {
				if (jsonData.goalSet[i]) {
					const gr = new PIXI.Graphics();
					gr.beginFill(0x223322);
					gr.drawCircle((i % 2) * getSize(), Math.floor(i / 2) * getSize(), jsonData.goalSet[i] * getSize());
					gr.endFill();
					gr.zIndex = -10;
					zoneObjects.push(gr);
					app.stage.addChild(gr);
					app.stage.children.sort((itemA, itemB) => itemA.zIndex - itemB.zIndex);
				}
			}
		} else {
			if (playerID !== -1) {
				// Send on receive.
				const dx = average(prevPlayerX) - playerX;
				const dy = average(prevPlayerY) - playerY;
				if (dx === undefined) {
					alert('DX undefined. Report this to Amren.');
				}
				if (dy === undefined) {
					alert('DY undefined. Report this to Amren.');
				}

				const jsonData2 = JSON.stringify({ playerID: playerID, x: playerX, y: playerY, dx: dx, dy: dy, name: getUsername(), tint: getUserTint() });
				socket.send(jsonData2);

				updateBoids(jsonData.boids);
				updatePlayers(jsonData.players);
			}
		}
	};
}

function average (array) {
	let total = 0;
	array.forEach((item) => {
		total += item;
	});
	return total / array.length;
}

function logout () {
	setUsername(null);
	setUserTint(null);

	document.getElementById('login').classList.remove('hidden');
	document.getElementById('logout-button').classList.add('hidden');
	document.getElementById('wrapper').removeChild(document.getElementById('pixi-app'));
}

function setUsername (username) {
	if (username === null) {
		localStorage.removeItem('username');
	} else {
		localStorage.setItem('username', username);
	}
	cachedUsername = username;
}

function getUsername () {
	if (cachedUsername !== '') {
		return cachedUsername;
	}
	return localStorage.getItem('username');
}

function setUserTint (tint) {
	if (tint === null) {
		localStorage.removeItem('tint');
	} else {
		localStorage.setItem('tint', tint);
	}
	cachedTint = tint;
}

function getUserTint () {
	if (cachedTint !== '') {
		return cachedTint;
	}
	return localStorage.getItem('tint');
}

function registerBoidSprites (boidsData) {
	boidSprites = [];
	boidsData.forEach((boid) => {
		const boidSprite = new PIXI.Sprite(boidTexture);
		boidSprite.width = 64;
		boidSprite.height = 111;
		boidSprite.anchor.set(0.5, 0.5);
		boidSprite.scale.set(0.3);
		boidSprites.push(boidSprite);
		boidSprite.tint = 0xff0000;
		app.stage.addChild(boidSprite);
	});
}

function registerPlayerSprites (playersData) {
	playerSprites = {};
	playersData.forEach((player) => {
		const playerSprite = new PIXI.Container();
		const playerTex = new PIXI.Sprite(playerTexture);
		playerTex.width = 260;
		playerTex.height = 420;
		playerTex.scale.set(0.8);
		playerTex.anchor.set(0.5, 0.5);

		playerSprite.addChild(playerTex);

		playerSprites[player.playerID] = playerSprite;
		playerTex.tint = player.tint;
		app.stage.addChild(playerSprite);

		const text = new PIXI.Text(player.name);
		text.anchor.set(0.5, 0.5);
		text.style.fontSize = 16;
		text.style.fill = 0xffffff;
		text.resolution = 4;
		// text.y = 60;
		playerSprite.addChild(text);
	});
}

// https://www.html5gamedevs.com/topic/840-remove-all-children-from-a-stage/?do=findComment&comment=4707
function clearStage () {
	for (let i = app.stage.children.length - 1; i >= 0; i--) {
		if (!zoneObjects.includes(app.stage.children[i])) {
			app.stage.removeChild(app.stage.children[i]);
		}
	}
}

function updateBoids (boidsData) {
	if (boidsData.length !== boidSprites.length) {
		// FIXME
		clearStage();
		registerBoidSprites(boidsData);
		if (cachedPlayersData !== null) {
			registerPlayerSprites(cachedPlayersData);
		}
	}

	const size = getSize();

	boidsData.forEach((boid, index) => {
		if (boid.x === undefined || boid.y === undefined || boid.dy === undefined || boid.dx === undefined) {
			console.error('Undefined property of boid.');
		}
		boidSprites[index].x = (boid.x ?? 0) * size;
		boidSprites[index].y = (boid.y ?? 0) * size;
		boidSprites[index].angle = Math.atan2(boid.dy ?? 0, boid.dx ?? 0) * (180 / Math.PI) + 90;
		boidSprites[index].tint = boid.tint ?? 0xffffff;
	});

	cachedBoidsData = boidsData;
}

function updatePlayers (playersData) {
	if (Object.keys(playersData).length !== Object.keys(playerSprites).length) {
		// FIXME
		clearStage();
		registerPlayerSprites(playersData);
		if (cachedBoidsData !== null) {
			registerBoidSprites(cachedBoidsData);
		}
	}

	const size = getSize();
	playersData.forEach((player, index) => {
		if (player.x === undefined || player.y === undefined || player.dy === undefined || player.dx === undefined || player.tint === undefined) {
			console.error('Undefined property of player.');
			console.error(player);
		}
		// if (player.id !== playerID) {
		playerSprites[player.playerID].x = (player.x ?? 0) * size;
		playerSprites[player.playerID].y = (player.y ?? 0) * size;
		// }

		playerSprites[player.playerID].children[0].angle = Math.atan2(player.dy ?? 0, player.dx ?? 0) * (180 / Math.PI) + 90;
		playerSprites[player.playerID].tint = player.tint ?? 0xffffff;
	});

	cachedPlayersData = playersData;
}

function getSize () {
	return Math.min(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);

// https://jsfiddle.net/bigtimebuddy/oaLwp0p9/
function resize () {
	const size = getSize();
	app.renderer.resize(size, size);
}

function interpolateBoids (delta) {
	boidSprites.forEach((_, index) => {
		const amount = 1000 * delta; // 18,000 is magic. Idk why it works.
		boidSprites[index].x += cachedBoidsData[index].dx * amount;
		boidSprites[index].y += cachedBoidsData[index].dy * amount;
		boidSprites[index].tint = 0x00ff00;
	});
}

resize();

/* let tickerCallback = null;

function setTickerCallback (callback) {
	tickerCallback = callback;
} */

let now = performance.now();

app.ticker.add((delta) => {
	if (Config.interpolate) {
		const curTime = performance.now();
		now = curTime;
		interpolateBoids(curTime - now);
	}
});
