const Config = {
	server: {
		tick: 1000 / 30 // milliseconds
	},
	boids: {
		count: 100,
		cohesionFactor: 2,
		separationFactor: 1.5,
		alignmentFactor: 0.5,
		fearFactor: 0.05,
		separationDistance: 0.03
	},
	game: {
		playerTimeout: 1000
	}
};

module.exports.Config = Config;
