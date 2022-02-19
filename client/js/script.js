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
// document.body.appendChild(app.view);

const boidTexture = PIXI.Texture.from('../assets/textures/triangle.png');

let boidSprites = [];

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
