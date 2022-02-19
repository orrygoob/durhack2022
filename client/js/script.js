const boids = [
    { x: 10, y: 10 },
    { dx: 1, dy: 1 },
];

const players = [
    { id: 0, name: 'Alice', x: 200, y: 0 },
    { id: 1, name: 'Bob', x: 300, y: 200 },
];

var app = new PIXI.Application({
    autoResize: true,
    resolution: devicePixelRatio,
    backgroundColor: 0x1099bb,
});
document.body.appendChild(app.view);

var container = new PIXI.Container();

app.stage.addChild(container);

var boidTexture = PIXI.Texture.from('../assets/textures/triangle.png');

for (var i = 0; i < 25; i++) {
    var boid = new PIXI.Sprite(boidTexture);
    boid.width = 10;
    boid.height = 10;
    boid.anchor.set(0.5);
    boid.x = (i % 5) * 40;
    boid.y = Math.floor(i / 5) * 40;
    container.addChild(boid);
}

var boidSprites = [];
boids.forEach(() => {});

// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// Center bunny sprite in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

// Listen for animate update
app.ticker.add(function (delta) {
    // rotate the container!
    // use delta to create frame-independent transform
    container.rotation -= 0.01 * delta;
});

window.addEventListener('resize', resize);

// https://jsfiddle.net/bigtimebuddy/oaLwp0p9/
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    rect.position.set(app.screen.width, app.screen.height);
}

resize();
