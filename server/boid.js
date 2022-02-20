'use strict';

const { Config } = require('./config');

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
		this.initialVelocity = 0.0001;// 0.0001;

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
		if (id < 0 || id >= this.players.length) {
			// Create new player
			this.players.push({ id: this.players.length, pos: new Vector(_x, _y), name: _name, tint: _tint, lastSeen: Date.now() });

			// Tell player who they are
			playerID = this.players.length;
		} else {
			playerID = id;
			this.players[id].id = id;
			this.players[id].pos.x = _x;
			this.players[id].pos.y = _y;
			this.players[id].tint = _tint;
			this.players[id].name = _name;
			this.players[id].lastSeen = Date.now();
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
		const newPlayers = [];
		for (const p of this.players) {
			if (p.lastSeen > Date.now() - Config.game.playerTimeout) {
				newPlayers.push(p);

				playersArr.push({
					playerID: p.id,
					x: p.pos.x,
					y: p.pos.y,
					name: p.name,
					tint: p.tint
				});
			}
		}

		this.players = newPlayers;

		return { boids: boidsArr, players: playersArr };
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

		// parameters:
		const cohesionFactor = Config.boids.cohesionFactor;
		const separationFactor = Config.boids.separationFactor;
		const alignmentFactor = Config.boids.alignmentFactor;
		const fearFactor = Config.boids.fearFactor;
		const separationDistance = Config.boids.separationDistance;

		let cohesionVec = Vector.zero;
		let separationVec = Vector.zero;
		let alignmentVec = Vector.zero;
		let fearVec = Vector.zero;

		let centerOfGroup = Vector.zero;

		// fear:
		for (const player of this.scene.players) {
			let pointDeltaVec = this.pos.sub(player.pos);
			const dist = pointDeltaVec.magnitude;
			pointDeltaVec = pointDeltaVec.normalized().mul(fearFactor / dist ** 2);
			fearVec = fearVec.add(pointDeltaVec);
		}

		const nearby = this.scene.nearbyBoids(this);
		if (nearby.length) {
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
			cohesionVec = centerOfGroup.sub(this.pos).normalized().mul(cohesionFactor);

			// separation:
			separationVec = separationVec.normalized().mul(separationFactor);

			// alignment:
			alignmentVec = alignmentVec.normalized().mul(alignmentFactor);
		}

		// calculate acceleration:
		const acceleration = cohesionVec.add(alignmentVec).add(separationVec).add(fearVec).normalized().mul(this.scene.initialVelocity);
		this.velocity = this.velocity.add(acceleration);
	}
}

module.exports.Scene = Scene;
