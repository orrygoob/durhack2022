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
		this.startLevel(0);
	}

	startLevel (levelNo) {
		this.zones = [0.2, 0, 0.2, 0];
		if (this.newLevelCallback) {
			this.newLevelCallback(this.zones);
		}
	}

	tick (delta) {
		this.scene.tick(delta);

		// DEBUG:
		const players = this.scene.players;
		if (players.length) {
			const player = players[0];
			const pos = player.pos;
			const zone = this.posInAZone(pos, 0.2);
			if (zone !== 0) {
				// player is in a corner
			}
		}
	}

	posInAZone (pos, zoneRadius) {
		const zones = [false, false, false, false];
		zones[0] = pos.magnitude < zoneRadius;
		zones[1] = pos.sub(new Vector(1, 0)).magnitude < zoneRadius;
		zones[2] = pos.sub(new Vector(0, 1)).magnitude < zoneRadius;
		zones[3] = pos.sub(new Vector(1, 1)).magnitude < zoneRadius;
		return zones.indexOf(true) + 1;
	}
}

module.exports.Game = Game;
