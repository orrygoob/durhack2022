'use strict';
import { updateBoids, setTickerCallback } from './script.js';

class Vector {
	constructor (x, y) {
		this.x = x;
		this.y = y;
	}

	static get zero () {
		return new Vector(0, 0);
	}

	add (other) {
		return new Vector(this.x + other.x, this.y + other.y);
	}

	sub (other) {
		return new Vector(this.x - other.x, this.y - other.y);
	}

	mul (scalar) {
		return new Vector(this.x * scalar, this.y * scalar);
	}

	get magnitude () {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	normalized () {
		const mag = this.magnitude;
		return new Vector(this.x / mag, this.y / mag);
	}
}

class Scene {
	constructor (numBoids, screenWidth, screenHeight) {
		this.boids = [];

		for (let i = 0; i < numBoids; i++) {
			const pos = new Vector(Math.random() * screenWidth, Math.random() * screenHeight);
			const b = new Boid(pos, Vector.zero);
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
		const viewRadius = 0.15;
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
		for (const b of this.boids) {
			b.tick(delta);
		}

		updateBoids(this.getJSON().boids);
	}

	getJSON () {
		const boidsArr = [];
		for (const b of this.boids) {
			boidsArr.push({
				x: b.pos.x,
				y: b.pos.y,
				dx: b.velocity.x,
				dy: b.velocity.y,
				tint: b.tint
			});
		}
		return { boids: boidsArr };
	}
}

class Boid {
	constructor (pos, velocity) {
		this.pos = pos;
		this.velocity = velocity;
		this.tint = 0xFFFFFF;
	}

	get rotation () {
		return Math.atan2(this.velocity.x, this.velocity.y);
	}

	distance (otherBoid) {
		return this.pos.sub(otherBoid.pos).magnitude;
	}

	tick (delta) {
		this.pos = this.pos.add(this.velocity.mul(delta));

		const accelerationFactor = 0.0001;

		const cohesionFactor = 1.0;
		const separationFactor = 1.0;
		const alignmentFactor = 1.0;

		const alignmentVec = Vector.zero;
		const separationVec = Vector.zero;

		let centerOfGroup = Vector.zero;

		const nearby = scene.nearbyBoids(this);
		for (const b of nearby) {
			// cohesion:
			centerOfGroup = centerOfGroup.add(b.pos);

			// separation:
		}
		centerOfGroup = centerOfGroup.mul(1 / nearby.length);

		const cohesionVec = centerOfGroup.sub(this.pos).normalized();

		const acceleration = cohesionVec.add(alignmentVec).add(separationVec).normalized().mul(accelerationFactor);

		this.velocity = this.velocity.add(acceleration);
	}
}

const scene = new Scene(500, 1.0, 1.0);
setTickerCallback((delta) => {
	scene.tick(delta);
});

export { Scene };
