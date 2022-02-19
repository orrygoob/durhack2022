class Scene {
	constructor(numBoids, screenWidth, screenHeight) {
		this.boids = [];
		this.width = screenWidth;
		this.height = screenHeight;

		for (let i = 0; i < numBoids; i++) {
			let dx = Math.random() * 2 - 1;
			let dy = Math.random() * 2 - 1;
			b = new Boid(Math.random() * screenWidth, Math.random() * screenHeight, dx, dy);
			this.registerBoid(b);
		}
	}

	registerBoid(boid) {
		this.boids.push(boid);
	}

	nearbyBoids(boid) {
		
	}
}

class Boid {
	constructor(x, y, dx, dy) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
	}
	
	get rotation() {
		return Math.atan2(this.dx, this.dy);
	}

	distance(otherBoid) {
		return Math.sqrt((this.x - otherBoid.x)**2 + (this.y - otherBoid.y)**2);
	}
}

scene = new Scene(50, 500, 500);
