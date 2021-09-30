const express = require('express');
const routes = express();
const authToken = require('./middlewares/authToken')

const user = require('./controllers/user');

// Routes Users
routes.use(authToken)
routes.post("/", user.registerUser);
routes.post("/login", user.loginUser);


module.exports = routes;