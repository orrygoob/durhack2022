const Config = {
	server: {
		tick: 10 // milliseconds
	},
	boids: {
		cohesionFactor: 2,
		separationFactor: 1,
		alignmentFactor: 0.2,
		fearFactor: 0.0,
		separationDistance: 0.05
	}
};

module.exports.Config = Config;
