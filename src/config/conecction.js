const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
    ssl: {
      rejectUnauthorized: false
    }
  },
});

module.exports = knex;