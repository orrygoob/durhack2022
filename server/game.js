const { Vector, Scene } = require('./boid');

class Game {
	constructor (newLevelCallback) {
		this.scene = null;
		this.started = false;
		this.newLevelCallback = newLevelCallback;
	}

	start () {
		this.scene = new Scene(200);
		this.started = true;
		this.levelNo = 0;
		this.startLevel(this.levelNo);
	}

	startLevel (levelNo) {
		if (levelNo === 0) {
			// test values for level 0:
			this.zoneSize = 0.2;
			this.zones = [this.zoneSize, 0, this.zoneSize, 0];
			this.percentage = 0.1;
		} else {
			console.log('WINNER!');

			// TODO: this is an impossible game:
			this.zoneSize = 0.3;
			this.zones = [0, this.zoneSize, 0, 0];
			this.percentage = 1;
		}

		if (this.newLevelCallback) {
			this.newLevelCallback(this.zones, levelNo);
		}
	}

	tick (delta) {
		this.scene.tick(delta);

		let caughtCount = 0;
		const boids = this.scene.boids;
		for (const boid of boids) {
			const pos = boid.pos;
			const zone = this.posInAZone(pos, this.zoneSize);
			if (zone !== -1 && this.zones[zone]) {
				caughtCount++;
			}
		}
		if (caughtCount / boids.length >= this.percentage) {
			this.startLevel(++this.levelNo);
		}
	}

	posInAZone (pos, zoneRadius) {
		const zones = [false, false, false, false];
		zones[0] = pos.magnitude < zoneRadius;
		zones[1] = pos.sub(new Vector(1, 0)).magnitude < zoneRadius;
		zones[2] = pos.sub(new Vector(0, 1)).magnitude < zoneRadius;
		zones[3] = pos.sub(new Vector(1, 1)).magnitude < zoneRadius;
		return zones.indexOf(true);
	}
}

module.exports.Game = Game;
