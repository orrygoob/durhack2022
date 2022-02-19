/* global PIXI */

const players = [
	{ id: 0, name: 'Alice', x: 200, y: 0 },
	{ id: 1, name: 'Bob', x: 300, y: 200 }
];

const app = new PIXI.Application({
	autoResize: true,
	resolution: devicePixelRatio,
	backgroundColor: 0x1099bb
});

const boidTexture = PIXI.Texture.from('../assets/textures/triangle.png');

let boidSprites = [];

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

function getUsername (username) {
	return localStorage.getItem('username');
}

function setUserTint (tint) {
	if (tint === null) {
		localStorage.removeItem('tint');
	} else {
		localStorage.setItem('tint', tint);
	}
}

function getUserTint (tint) {
	return localStorage.getItem('tint');
}

function registerBoidSprites (boidsData) {
	boidSprites = [];
	boidsData.forEach((boid) => {
		const boidSprite = new PIXI.Sprite(boidTexture);
		boidSprite.width = 10;
		boidSprite.height = 10;
		boidSprite.anchor.set(0.5, 0.5);
		boidSprites.push(boidSprite);
		boidSprite.tint = 0xff0000;
		app.stage.addChild(boidSprite);
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
		clearStage();
		registerBoidSprites(boidsData);
	}

	const size = getSize();

	boidsData.forEach((boid, index) => {
		boidSprites[index].x = (boid.x ?? 0) * size;
		boidSprites[index].y = (boid.y ?? 0) * size;
		boidSprites[index].angle = Math.atan2(boid.dy ?? 0, boid.dx ?? 0) * (180 / Math.PI) + 90;
		boidSprites[index].tint = boid.tint ?? 0xffffff;
	});
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

resize();

let tickerCallback = null;

function setTickerCallback (callback) {
	tickerCallback = callback;
}

app.ticker.add((delta) => {
	if (tickerCallback) {
		tickerCallback(delta);
	}
});

// updateBoids([{ x: 30 / 100, y: 30 / 100, dx: -1, dy: -0.5, tint: 0xff0000 }, { x: 100 / 100, y: 100 / 100, dx: 0, dy: 0, tint: 0x00ff00 }]);

export {
	updateBoids,
	setTickerCallback
};
