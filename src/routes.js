const express = require('express');
const routes = express();

const user = require('./controllers/user');

// Routes Users
routes.post("/", user.registerUser);

module.exports = routes;