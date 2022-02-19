const express = require('express');
const app = express();

app.use(express.static('client'));

module.exports = app;
