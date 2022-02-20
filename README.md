# Durhack 2022 Submission

Boids and sheep created by:
- Orry Gooberman (Multiplayer Networking)
- Tommy Muirrey (Boids Algorithm)
- Amren Stephenson (Front End Client)

This is a multiplayer game in which the aim is to use your sheepdog (cursor) to guide the sheep (boids) into their pens.
The game uses our own boids artificial life program to simulate how real animals flock together and travel as groups.
We have then added a 'fear' factor that encourages the animals to run away from the sheepdogs allowing the players to herd the sheep as they wish.
A custom multiplayer engine has been created on top of Node.JS that runs the boids simulation and uses websockets to communicate with clients in real time.
In testing this has shown capability of handling the large amounts of traffic that result from simulating large volumes of boids, meaning many clients can participate in a game at once.
To render our graphics we are using the popular Pixi.JS library, letting us load in and position our sprites in a canvas as well as interact with them.

Everything has been written from the ground up in javascript and an object oriented programming paradigm over the course of the Hackathon.

*Disclaimer: A large proportion of this code was produced in the early hours of the morning. We make no claims about it's reliability or sanity.*
