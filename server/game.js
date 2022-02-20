const { Vector, Scene } = require('./boid');

class Game {
	constructor () {
		this.scene = null;
		this.started = false;
	}

	start () {
		this.scene = new Scene(200);
		this.started = true;
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
