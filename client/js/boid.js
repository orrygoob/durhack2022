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
		if (mag === 0) return Vector.zero;
		return new Vector(this.x / mag, this.y / mag);
	}
}

class Scene {
	constructor (numBoids, screenWidth, screenHeight) {
		this.boids = [];
		this.players = [];

		for (let i = 0; i < numBoids; i++) {
			const pos = new Vector(Math.random() * screenWidth, Math.random() * screenHeight);
			const b = new Boid(pos, Vector.zero);
			this.registerBoid(b);
		}

		// DEBUG
		this.boids[45].tint = 0xFF0000;
	}

	// Update player position, name and color. Return the player ID
	updatePlayer (id, _x, _y, _name, _tint) {
		let playerID = -1;
		// Client doesn't know what player it is
		if (id === -1) {
			// Create player
			this.players.push({ id: this.players.length, x: _x, y: _y, name: _name, tint: _tint });

			// Tell player who they are
			playerID = this.players.length;
		} else if (id >= this.players.length) { // Player is wrong about who they are (Array index error)
			// Create new player
			this.players.push({ id: this.players.length, x: _x, y: _y, name: _name, tint: _tint });

			// Tell player who they are
			playerID = this.players.length;
		} else {
			this.players[id].x = _x;
			this.players[id].y = _y;
			this.players[id].tint = _tint;
			this.players[id].tint = _name;

			playerID = id;
		}

		return playerID;
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

		const separationDistance = 0.05;

		let separationVec = Vector.zero;

		let centerOfGroup = Vector.zero;
		let averageRotation = 0.0;

		const nearby = scene.nearbyBoids(this);
		if (!nearby.length) return;

		for (const b of nearby) {
			// cohesion:
			centerOfGroup = centerOfGroup.add(b.pos);

			// separation:
			const dist = this.distance(b);
			if (dist <= separationDistance && dist !== 0) {
				const deltaVec = this.pos.sub(b.pos).normalized().mul(1 / dist ** 2);
				separationVec = separationVec.add(deltaVec);
			}

			// alignment:
			averageRotation += b.rotation;
		}
		// cohesion:
		centerOfGroup = centerOfGroup.mul(1 / nearby.length);
		const cohesionVec = centerOfGroup.sub(this.pos).normalized().mul(cohesionFactor);

		// separation:
		separationVec = separationVec.normalized().mul(separationFactor);

		// alignment:
		averageRotation /= nearby.length;
		const alignmentVec = new Vector(0, 0);

		// calculate acceleration:
		const acceleration = cohesionVec.add(alignmentVec).add(separationVec).normalized().mul(accelerationFactor);
		this.velocity = this.velocity.add(acceleration);
	}
}

const scene = new Scene(500, 1.0, 1.0);
setTickerCallback((delta) => {
	scene.tick(delta);
});

export { Scene };
