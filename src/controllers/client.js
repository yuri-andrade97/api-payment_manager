const knex = require('../config/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('../nodemailer');

const schemaRegisterClient = require('../validations/schemaRegisterClient');


const registerCustomer = async (req, res) => {
  const { nome, email, cpf, telefone, cep, logradouro, complemento, bairro, cidade, estado, referencia } = req.body

  const dataToken = req.infoUser;

  try {

    await schemaRegisterClient.validate(req.body);

    const verifyIfEmailAlreadyExists = await knex('clientes').select('*').where('email', email);

    if (verifyIfEmailAlreadyExists.length > 0) {
      return res.status(400).json('E-mail já cadastrado.');
    };

    const registeringClient = await knex('clientes').insert({
      nome,
      id_usuario: dataToken.id,
      email,
      cpf,
      telefone,
      cep,
      logradouro,
      complemento,
      bairro,
      cidade,
      estado,
      referencia
    }).returning('*')

    console.log('passei')

    if (registeringClient.rowCount < 1) {
      return res.status(400).json('O cliente não foi cadastrado.');
    }

    return res.status(200).json('Cliente cadastrado com sucesso!');

  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const listCustomers = async (req, res) => {

};

const registerBilling = async (req, res) => {

};
module.exports = {
  registerCustomer,
  listCustomers,
}