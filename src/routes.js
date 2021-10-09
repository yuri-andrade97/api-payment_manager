const express = require('express');
const routes = express();
const authToken = require('./middlewares/authToken')

const user = require('./controllers/user');
const client = require('./controllers/client');

// Routes Users
routes.post("/signup", user.registerUser);
routes.post("/login", user.loginUser);

// Routes users authenticated
routes.get("/user", authToken, user.getUserData);
routes.put("/edit", authToken, user.editUser);

// Routes Clients
routes.post("/registerCustomers", authToken, client.registerCustomer);
routes.get("/listCustomers", authToken, client.listCustomers);
routes.get("/getBillings", authToken, client.getCustomerBillings);

// Route Billings
routes.post("/registerBilling", authToken, client.registerBilling);
routes.get("/allUserBillings", authToken, client.getAllUserBillings);

module.exports = routes;