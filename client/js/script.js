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
document.body.appendChild(app.view);

const boidTexture = PIXI.Texture.from('../assets/textures/triangle.png');

let boidSprites = [];

function registerBoidSprites (boidsData) {
	boidSprites = [];
	boidsData.forEach((boid) => {
		const boidSprite = new PIXI.Sprite(boidTexture);
		boidSprite.width = 10;
		boidSprite.height = 10;
		boidSprite.agnle = 50;
		boidSprites.push(boidSprite);
		boidSprite.tint = 0xff0000;
		app.stage.addChild(boidSprite);
		console.log(boid);
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

	boidsData.forEach((boid, index) => {
		boidSprites[index].x = boid.x;
		boidSprites[index].y = boid.y;
		boidSprites[index].angle = Math.atan2(boid.dy, boid.dx);
	});
}

window.addEventListener('resize', resize);

// https://jsfiddle.net/bigtimebuddy/oaLwp0p9/
function resize () {
	app.renderer.resize(window.innerWidth, window.innerHeight);
	// rect.position.set(app.screen.width, app.screen.height);
}

resize();

// updateBoids([{ x: 10, y: 20, dx: 4, dy: 2 }, { x: 30, y: 40, dx: 4, dy: -2 }]);

let tickerCallback = null;

function setTickerCallback(callback) {
    tickerCallback = callback;
}

app.ticker.add((delta) => {
    //console.log (tickerCallback);
    if (tickerCallback) {
        tickerCallback(delta);
    }
});

export {
	updateBoids,
    setTickerCallback
};
