const express = require('express');
const routes = express();
const authToken = require('./middlewares/authToken')

const user = require('./controllers/user');

// Routes Users
routes.post("/signup", user.registerUser);
routes.post("/login", user.loginUser);
routes.use(authToken);
routes.get("/getDataUser", user.getUserData)
routes.put("/edit", user.editUser)


module.exports = routes;