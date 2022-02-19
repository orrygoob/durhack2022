"use strict";

const app = require("./app");
const port = 8090;
const addr = "127.0.0.1";
app.listen(port, addr);
console.log(`server started at ${addr}:` + port);
