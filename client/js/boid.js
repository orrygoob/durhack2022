'use strict';
import { updateBoids, setTickerCallback } from './script.js';

class Scene {
	constructor (numBoids, screenWidth, screenHeight) {
		this.boids = [];
		this.width = screenWidth;
		this.height = screenHeight;

		const boidVelocity = 1.0;

		for (let i = 0; i < numBoids; i++) {
			const x = Math.random() * screenWidth;
			const y = Math.random() * screenHeight;
			const dx = Math.random() * 2 * boidVelocity - boidVelocity;
			const dy = Math.random() * 2 * boidVelocity - boidVelocity;
			const b = new Boid(x, y, dx, dy);
			this.registerBoid(b);
		}

		// DEBUG
		this.boids[45].tint = 0xFF0000;
	}

	registerBoid (boid) {
		this.boids.push(boid);
	}

	nearbyBoids (boid) {
		const nearby = [];
		const viewRadius = 10.0;
		for (const b of this.boids) {
			if (b === boid) continue;

			const dist = boid.distance(b);
			if (dist <= viewRadius) {
				nearby.push(b);
			}
		}
		return nearby;
	}

	tick (delta) {
		const nearby = this.nearbyBoids(this.boids[45]);

		for (const b of this.boids) {
			b.x += b.dx * delta;
			b.y += b.dy * delta;

			const mag = 0.25;
			const dx = Math.random() * 2 * mag - mag;
			const dy = Math.random() * 2 * mag - mag;

			b.dx += dx;
			b.dy += dy;

			if (nearby.includes(b)) {
				b.tint = 0xFF00;
			} else if (b !== this.boids[45]) {
				b.tint = 0xFFFFFF;
			}
		}

		updateBoids(this.getJSON().boids);
	}

	getJSON () {
		const boidsArr = [];
		for (const b of this.boids) {
			boidsArr.push({
				x: b.x,
				y: b.y,
				dx: b.dx,
				dy: b.dy,
				tint: b.tint
			});
		}
		return { boids: boidsArr };
	}
}

class Boid {
	constructor (x, y, dx, dy) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.tint = 0xFFFFFF;
	}

	get rotation () {
		return Math.atan2(this.dx, this.dy);
	}

	distance (otherBoid) {
		return Math.sqrt((this.x - otherBoid.x) ** 2 + (this.y - otherBoid.y) ** 2);
	}
}

const scene = new Scene(100, 100, 100);
setTickerCallback((delta) => {
	scene.tick(delta);
});

export { Scene };
