"use strict";
import {updateBoids, setTickerCallback} from "./script.js";

class Scene {
	constructor(numBoids, screenWidth, screenHeight, container) {
		/* testing: */
		this.container = container;

		this.boids = [];
		this.width = screenWidth;
		this.height = screenHeight;

		let sz = Math.sqrt(numBoids);
		for (let i = 0; i < numBoids; i++) {
			let x = (i % sz) * 30;
			let y = Math.floor(i / sz) * 30;
			let dx = Math.random() * 2 - 1;
			let dy = Math.random() * 2 - 1;
			let b = new Boid(x, y, dx, dy);
			this.registerBoid(b);
		}
	}

	registerBoid(boid) {
		this.boids.push(boid);

		/*//add to pixijs container:
		var boidTexture = PIXI.Texture.from('../assets/textures/triangle.png');
		var boidObj = new PIXI.Sprite(boidTexture);
		boidObj.width = 10;
		boidObj.height = 10;
		boidObj.anchor.set(0.5);
		boidObj.x = boid.x;
		boidObj.y = boid.y;
		this.container.addChild(boidObj);
		boid.gameObject = boidObj;*/
	}

	nearbyBoids(boid) {
		let nearby = [];
		let viewRadius = 100.0;
		for (let b of this.boids) {
			if (b === boid) continue;

			let dist = boid.distance(b);
			if (dist <= viewRadius) {
				nearby.push(b);
			}
		}
		return nearby;
	}

	tick(delta) {
		let nearby = this.nearbyBoids(this.boids[45]);

		for (let b of this.boids) {
			b.x += b.dx * delta;
			b.y += b.dy * delta;

			let mag = 0.25;
			let dx = Math.random() * 2 * mag - mag;
			let dy = Math.random() * 2 * mag - mag;

			b.dx += dx;
			b.dy += dy;

			/*b.gameObject.x = b.x;
			b.gameObject.y = b.y;

			if (nearby.includes(b)) {
				b.gameObject.tint = 0xFF00;
			} else if (b !== this.boids[45]) {
				b.gameObject.tint = 0xFF0000;
			}*/
		}

		updateBoids(this.getJSON().boids);
	}

	getJSON() {
		let boidsArr = [];
		for (let b of this.boids) {
			boidsArr.push({
				x: b.x,
				y: b.y,
				dx: b.dx,
				dy: b.dy
			});
		}
		return {boids: boidsArr};
	}
}

class Boid {
	constructor(x, y, dx, dy) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
	}
	
	get rotation() {
		return Math.atan2(this.dx, this.dy);
	}

	distance(otherBoid) {
		return Math.sqrt((this.x - otherBoid.x)**2 + (this.y - otherBoid.y)**2);
	}
}

let scene = new Scene(100, 500, 500);
setTickerCallback((delta) => {
	scene.tick(delta);
});

export {Scene};
