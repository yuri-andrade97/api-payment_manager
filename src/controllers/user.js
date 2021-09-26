const knex = require('../config/conecction');
const bcrypt = require('bcrypt');
const schemaRegisterUser = require('../validations/schemaRegisterUsers')

const registerUser = async (req, res) => {
  const {
    nome,
    email,
    senha
  } = req.body;

  try {
    await schemaRegisterUser.validate(req.body);

    res.json('validou ;)');

  } catch (error) {
    return res.status(400).json(error.message);
  }

}

module.exports = {
  registerUser,
}