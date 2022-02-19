const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('client'));

// create json parser
app.use(express.json());

// Return a list of message boards
app.get('/', (req, res, next) => {
  res.send("Server Root");
});

module.exports = app;
