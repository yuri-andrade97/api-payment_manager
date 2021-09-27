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
    //validando dados enviados pelo usuário
    await schemaRegisterUser.validate(req.body);

    const verifyIfEmailAlreadyExists = await knex('usuarios').select('*').where('email', email);

    if (verifyIfEmailAlreadyExists.length > 0) {
      return res.status(400).json('E-mail já cadastrado.');
    };

    const encryptedPassword = await bcrypt.hash(senha, 10);

    const registeringUser = await knex('usuarios').insert({
      nome,
      email,
      senha: encryptedPassword
    })

    if (registeringUser.rowCount < 1) {
      return res.status(400).json('O usuário não foi cadastrado.');
    }

    return res.status(200).json('Conta criada com sucesso!');
  } catch (error) {
    return res.status(400).json(error.message);
  }

}

module.exports = {
  registerUser,
}