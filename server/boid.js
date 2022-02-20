'use strict';

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
	constructor (numBoids) {
		this.boids = [];
		this.players = [];
		this.initialVelocity = 0.0001;

		for (let i = 0; i < numBoids; i++) {
			const pos = new Vector(Math.random(), Math.random());
			const vel = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1).normalized().mul(this.initialVelocity);
			const b = new Boid(pos, vel);
			this.registerBoid(b);
		}
	}

	// Update player position, name and color. Return the player ID
	updatePlayer (id, _x, _y, _name, _tint) {
		let playerID = -1;
		// Client doesn't know what player it is
		console.log(id);
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
		boid.scene = this;
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

		const playersArr = [];
		for (const p of this.players) {
			playersArr.push({
				playerID: p.id,
				x: p.x,
				y: p.y,
				name: p.name,
				tint: p.tint
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
		// bounce off walls:
		if ((this.pos.x <= 0 && this.velocity.x < 0) || (this.pos.x >= 1 && this.velocity.x > 0)) {
			this.velocity.x *= -0.5;
		}
		if ((this.pos.y <= 0 && this.velocity.y < 0) || (this.pos.y >= 1 && this.velocity.y > 0)) {
			this.velocity.y *= -0.5;
		}

		this.pos = this.pos.add(this.velocity.mul(delta));

		const cohesionFactor = 2;
		const separationFactor = 1;
		const alignmentFactor = 0.2;

		const separationDistance = 0.05;

		let separationVec = Vector.zero;

		let centerOfGroup = Vector.zero;
		let alignmentVec = Vector.zero;

		const nearby = this.scene.nearbyBoids(this);
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
			alignmentVec = alignmentVec.add(b.velocity);
		}
		// cohesion:
		centerOfGroup = centerOfGroup.mul(1 / nearby.length);
		const cohesionVec = centerOfGroup.sub(this.pos).normalized().mul(cohesionFactor);

		// separation:
		separationVec = separationVec.normalized().mul(separationFactor);

		// alignment:
		alignmentVec = alignmentVec.normalized().mul(alignmentFactor);

		// calculate acceleration:
		const acceleration = cohesionVec.add(alignmentVec).add(separationVec).normalized().mul(this.scene.initialVelocity);
		this.velocity = this.velocity.add(acceleration);
	}
}

module.exports.Scene = Scene;