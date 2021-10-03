const express = require('express');
const routes = express();
const authToken = require('./middlewares/authToken')

const user = require('./controllers/user');
const client = require('./controllers/client');

// Routes Users
routes.post("/signup", user.registerUser);
routes.post("/login", user.loginUser);
routes.get("/user", authToken, user.getUserData);
routes.put("/edit", authToken, user.editUser);

// Routes Client
routes.post("/registerClient", authToken, client.registerClient);


module.exports = routes;