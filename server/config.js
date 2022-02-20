const Config = {
	server: {
		tick: 1000 / 30 // milliseconds
	},
	boids: {
		cohesionFactor: 2,
		separationFactor: 1,
		alignmentFactor: 0.5,
		fearFactor: 0.03,
		separationDistance: 0.05
	},
	game: {
		playerTimeout: 1000
	}
};

module.exports.Config = Config;
