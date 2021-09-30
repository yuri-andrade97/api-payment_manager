const knex = require('../config/conecction');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('../nodemailer');
const schemaRegisterUser = require('../validations/schemaRegisterUsers');
const schemaLoginUser = require('../validations/schemaLoginUser');

const registerUser = async (req, res) => {
  const {
    nome,
    email,
    senha
  } = req.body;


  return res.json(senha)

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

    const dataSendEmail = {
      from: 'Payment Manager <nao-responder@paymentmanager.com.br>',
      to: email,
      subject: 'Bem vindo ao Payment Manager',
      text: `Olá ${nome}. Você realizou um cadastro no Payment Manager, Seja Bem vindo!`
    }

    nodemailer.sendMail(dataSendEmail);

    return res.status(200).json('Conta criada com sucesso!');
  } catch (error) {
    return res.status(400).json(error.message);
  }

};

const loginUser = async (req, res) => {
  const {email, senha} = req.body;

  console.log(req.headers)

  try {
    await schemaLoginUser.validate(req.body);

    const validatingData = await knex('usuarios').select('*').where('email', email);

    if (validatingData.length < 1) {
      return res.json('Email não existe no sistema.');
    }

    const dataUser = validatingData[0];

    const validatingPassword = await bcrypt.compare(senha, dataUser.senha);

    if (!validatingPassword) {
      return res.status(400).json('Senha incorreta.');
    }

    const token = jwt.sign({
      id: dataUser.id,
      nome: dataUser.nome,
      email: dataUser.email
    }, process.env.JWT_TOKEN)

    const { senha: batatinha, ...user } = dataUser;

    return res.status(200).json({
      usuario: user,
      token
    })

  } catch (error) {
    return res.status(400).json(error.message);
  }

};

module.exports = {
  registerUser,
  loginUser,
}