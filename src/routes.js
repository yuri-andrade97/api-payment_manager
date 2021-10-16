const express = require('express');
const routes = express();
const authToken = require('./middlewares/authToken');

const user = require('./controllers/user');
const client = require('./controllers/client');
const billings = require('./controllers/billings');

// Routes Users
routes.post("/signup", user.registerUser);
routes.post("/login", user.loginUser);


// Routes users authenticated
routes.get("/user", authToken, user.getUserData);
routes.put("/edit", authToken, user.editUser);


// Routes Clients
routes.get("/listCustomers", authToken, client.listCustomers);
routes.get("/getDataCustomer", authToken, client.getDataCustomer);

routes.post("/registerCustomers", authToken, client.registerCustomer);
routes.put("/editDataCustomer", authToken, client.editDataCustomer);


// Route Billings
routes.get("/allUserBillings", authToken, billings.getAllUserBillings);
routes.get("/getBillings", authToken, billings.getCustomerBillings);

routes.post("/registerBilling", authToken, billings.registerBilling);
routes.put("/editBilling", authToken, billings.editBilling);
routes.delete("/deleteBilling", authToken, billings.deleteBilling);


// Route Relatório
routes.get("/gettingReport", authToken, billings.gettingReport);


module.exports = routes;