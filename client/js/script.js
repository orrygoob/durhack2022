/* global PIXI */
'use strict';

const app = new PIXI.Application({
	autoResize: true,
	resolution: devicePixelRatio,
	backgroundColor: 0x1099bb
});

const boidTexture = PIXI.Texture.from('../assets/textures/triangle.png');

let boidSprites = [];
let playerSprites = [];
let playerID = -1;

let cachedPlayersData = null;
let cachedBoidsData = null;

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
	document.getElementById('flex-div').appendChild(app.view);

	var socket = io();
	socket.emit('update player', JSON.stringify({ playerID: -1, x: 0, y: 0, name: getUsername(), tint: getUserTint() }));

	socket.on('chat message', function(msg) {
		const jsonData = JSON.parse(msg);
		if (jsonData.boids === undefined) {
			playerID = jsonData.playerID;
		} else {
			if (playerID !== -1) {
				updateBoids(jsonData.boids);
				updatePlayers(jsonData.players);
			}
		}
	});
}

function logout () {
	setUsername(null);
	setUserTint(null);

	document.getElementById('login').classList.remove('hidden');
	document.getElementById('logout-button').classList.add('hidden');
	document.getElementById('flex-div').removeChild(document.getElementById('pixi-app'));
}

function setUsername (username) {
	if (username === null) {
		localStorage.removeItem('username');
	} else {
		localStorage.setItem('username', username);
	}
}

function getUsername () {
	return localStorage.getItem('username');
}

function setUserTint (tint) {
	if (tint === null) {
		localStorage.removeItem('tint');
	} else {
		localStorage.setItem('tint', tint);
	}
}

function getUserTint () {
	return localStorage.getItem('tint');
}

function registerBoidSprites (boidsData) {
	boidSprites = [];
	boidsData.forEach((boid) => {
		const boidSprite = new PIXI.Sprite(boidTexture);
		boidSprite.width = 8;
		boidSprite.height = 8;
		boidSprite.anchor.set(0.5, 0.5);
		boidSprites.push(boidSprite);
		boidSprite.tint = 0xff0000;
		app.stage.addChild(boidSprite);
	});
}

function registerPlayerSprites (playersData) {
	playerSprites = [];
	playersData.forEach((player) => {
		const playerSprite = new PIXI.Sprite(boidTexture);
		playerSprite.width = 16;
		playerSprite.height = 16;
		playerSprite.anchor.set(0.5, 0.5);
		playerSprites.push(playerSprite);
		playerSprite.tint = player.tint;
		app.stage.addChild(playerSprite);
	});
}

// https://www.html5gamedevs.com/topic/840-remove-all-children-from-a-stage/?do=findComment&comment=4707
function clearStage () {
	for (let i = app.stage.children.length - 1; i >= 0; i--) {
		app.stage.removeChild(app.stage.children[i]);
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
		boidSprites[index].x = (boid.x ?? 0) * size;
		boidSprites[index].y = (boid.y ?? 0) * size;
		boidSprites[index].angle = Math.atan2(boid.dy ?? 0, boid.dx ?? 0) * (180 / Math.PI) + 90;
		boidSprites[index].tint = boid.tint ?? 0xffffff;
	});

	cachedBoidsData = boidsData;
}

function updatePlayers (playersData) {
	if (playersData.length !== playerSprites.length) {
		// FIXME
		clearStage();
		registerPlayerSprites(playersData);
		if (cachedBoidsData !== null) {
			registerBoidSprites(cachedBoidsData);
		}
	}

	const size = getSize();
	playersData.forEach((player, index) => {
		playerSprites[index].x = (player.x ?? 0) * size;
		playerSprites[index].y = (player.y ?? 0) * size;
		playerSprites[index].angle = Math.atan2(player.dy ?? 0, player.dx ?? 0) * (180 / Math.PI) + 90;
		playerSprites[index].tint = player.tint ?? 0xffffff;
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
		boidSprites[index].x += cachedBoidsData[index].dx * delta;
		boidSprites[index].y += cachedBoidsData[index].dy * delta;
	});
}

resize();

/* let tickerCallback = null;

function setTickerCallback (callback) {
	tickerCallback = callback;
} */

app.ticker.add((delta) => {
	interpolateBoids(delta);
	// if (tickerCallback) {
	// 	tickerCallback(delta);
	// }
});
// updatePlayers([{ playerID: 0, x: 0.2, y: 0.2, tint: 0x00ff00, name: 'Hi' }]);
// updateBoids([{ x: 30 / 100, y: 30 / 100, dx: -1, dy: -0.5, tint: 0xff0000 }, { x: 100 / 100, y: 100 / 100, dx: 0, dy: 0, tint: 0x00ff00 }]);

/* export {
	updateBoids,
	setTickerCallback,
	setBoidSize
}; */
