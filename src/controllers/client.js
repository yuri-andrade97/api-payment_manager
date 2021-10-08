const knex = require('../config/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('../nodemailer');

const schemaRegisterClient = require('../validations/schemaRegisterClient');
const schemaRegisterBilling = require('../validations/schemaRegisterBilling');
const { get } = require('../nodemailer');


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

  try {
    const getCustomers = await knex('clientes')
    .select(
      'id',
      'nome',
      'email',
      "telefone",
      knex.raw('sum(COALESCE(cobrancas.valor, 0)) as valorTotal')
    )
    .where('id_usuario', user.id)
    .leftJoin('cobrancas', 'clientes.id', 'cobrancas.id_cliente')
    .groupBy('nome', 'email', 'telefone');

    if (getCustomers.length < 1) {
      return res.status(400).json('Usuário não possui clientes cadastrados')
    }

    return res.status(200).json(getCustomers);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const getCustomerBillings = async (req, res) => {
  const { id } = req.query;

  try {

    const getBillings = await knex('cobrancas')
    .select(
      'cobrancas.id',
      'clientes.nome',
      'cobrancas.descricao',
      'cobrancas.valor',
      'cobrancas.status',
      'cobrancas.vencimento'
    )
    .where('id_cliente', id)
    .leftJoin('clientes', 'cobrancas.id_cliente', 'clientes.id');


    if (getBillings.length < 1) {
      return res.status(400).json('Não foi localizado cobranças para este cliente.')
    }

    return res.status(200).json(getBillings);
  } catch (error) {
    return res.status(400).json(error.message);
  }

};

const getAllUserBillings = async (req, res) => {
  const user = req.infoUser;

  try {
    const allBillings = await knex('cobrancas').select('*').where('id_cliente', user.id);

    if (allBillings.length < 1) {
      return res.status(400).json('O usuário não possui cobranças')
    }

    return res.status(200).json(allBillings)

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
    return res.status(400).json(error.message);
  }

};
module.exports = {
  registerCustomer,
  listCustomers,
  registerBilling,
  getCustomerBillings,
  getAllUserBillings
}