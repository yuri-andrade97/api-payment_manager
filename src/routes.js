const express = require('express');
const routes = express();
const authToken = require('./middlewares/authToken')

const user = require('./controllers/user');

// Routes Users
routes.post("/", user.registerUser);
routes.post("/login", user.loginUser);
routes.use(authToken);
routes.put("/editar", user.editUser)


module.exports = routes;