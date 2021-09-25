const app = require('express');
const routes = require('./routes');

const cors = require('cors');

app.use(express.json());
app.use(routes);

app.listen(3000, () => {
  console.log('API Started ;)');
})