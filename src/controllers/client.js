const knex = require('../config/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('../nodemailer');

const schemaRegisterClient = require('../validations/schemaRegisterClient');
const schemaRegisterBilling = require('../validations/schemaRegisterBilling');


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
  const user = req.infoUser;
  //eu vou lá no banco de clientes e retorno todos os clientes que é do id user
  try {
    const getCustomers = await knex('clientes').select('*').where('id_usuario', user.id);

    if (getCustomers.length < 1) {
      return res.status(400).json('Usuário não possui clientes cadastrados')
    }

    return res.status(200).json(getCustomers);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const registerBilling = async (req, res) => {
  const { cliente, descricao, status, valor, vencimento } = req.body;
  const user = req.infoUser;

  try {
    await schemaRegisterBilling.validate(req.body);

    const registeringBilling = await knex('cobrancas').insert({
      id_cliente: cliente,
      descricao,
      status,
      valor,
      vencimento
    }).returning('*')

    if (registeringBilling.length !== 1) {
      return res.status(400).json('Cobrança não cadastrada.')
    }

    return res.status(200).json('Cobrança adicionada com sucesso!')
  } catch (error) {
    return res.status(400).json(error.message)
  }

};
module.exports = {
  registerCustomer,
  listCustomers,
  registerBilling,
}