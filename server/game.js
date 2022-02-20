const { Vector, Scene } = require('./boid');
const shuffle = require('shuffle-array');

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
		const startZoneSize = 0.3;
		const startPercentage = 0.25;
		if (levelNo === 0) {
			// test values for level 0:
			this.zoneSize = startZoneSize;
			this.zones = [this.zoneSize, 0, this.zoneSize, 0];
			this.percentage = startPercentage;
		} else {
			this.zoneSize = Math.max(startZoneSize - levelNo * 0.01, 0.1);

			this.zones = [0, 0, 0, 0];
			const nZones = Math.random(Math.random() * 3) + 1;
			for (let i = 0; i < 4; i++) {
				if (i < nZones) {
					this.zones[i] = this.zoneSize;
				} else {
					this.zones[i] = 0;
				}
			}
			shuffle(this.zones);

			this.percentage = Math.min(startPercentage + levelNo * 0.05, 0.85);
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
