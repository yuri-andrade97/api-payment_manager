const jwt = require('jsonwebtoken');
const knex = require('../config/connection');

const authToken = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json("É necessário preencher o token");
  }

  try {
    const token = authorization.replace('Bearer ', '').trim();
    console.log(token)

    const dataUser = jwt.verify(token, process.env.JWT_TOKEN);

    const searchingUser = await knex('usuarios').select('*').where('id', dataUser.id).first();

    if (!searchingUser) {
      return res.status(400).json('Usuário não encontrado');
    }
    const { senha, ...user } = searchingUser;

    req.infoUser = user;

    next();
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = authToken;