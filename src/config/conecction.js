
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : 'localhost',
    user : 'postgres',
    password : '102323',
    database : 'AINDA_VOU_CRIAR'
  }
});

module.exports = knex;