const knex = require('../config/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('../nodemailer');
const schemaRegisterUser = require('../validations/schemaRegisterUser');
const schemaLoginUser = require('../validations/schemaLoginUser');
const schemaEditUser = require('../validations/schemaEditUser');


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

const editUser = async (req, res) => {
  const { nome, email, senha, cpf, telefone } = req.body;

  const user = req.infoUser

  try {
    await schemaEditUser.validate(req.body);

    const checkIfEmailExists = await knex('usuarios').select('*').where('email', email);

    if (checkIfEmailExists.length == 1) {



        return res.status(400).json('Email já cadastrado no sistema.');
      }

    const encryptedPassword = await bcrypt.hash(senha, 10);

    const editingUser = await knex('usuarios').update({
      nome,
      email,
      senha: encryptedPassword,
      cpf,
      telefone
    }).where('id', user.id).returning('*')

    if (editingUser.length < 1) {
      return res.status(400).json('Não foi possível atualizar os dados do usuário!')
    }

    return res.status(200).json('Dados atualizados com sucesso!')

  } catch (error) {
    return res.status(400).json(error.message);
  }

};

const getUserData = async (req, res) => {
  const userData = req.infoUser

  return res.status(200).json(userData)
};

module.exports = {
  registerUser,
  loginUser,
  editUser,
  getUserData,
}