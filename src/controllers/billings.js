const knex = require('../config/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const schemaRegisterBilling = require('../validations/schemaRegisterBilling');

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

const getCustomerBillings = async (req, res) => {
  const { id } = req.query;
  const now = new Date();

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

    getBillings.forEach(billing => {
      if (+billing.vencimento >= +now) {
        billing.status = "Pendente";
      }

      if (+billing.vencimento < +now) {
        billing.status = "Vencida"
      }
    });

    return res.status(200).json(getBillings);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const getAllUserBillings = async (req, res) => {
  const user = req.infoUser;
  const now = new Date();

  try {
    const allBillings = await knex('cobrancas')
    .select(
      'cobrancas.id',
      'clientes.nome',
      'cobrancas.descricao',
      'cobrancas.valor',
      'cobrancas.vencimento',
      'cobrancas.status'
    )
    .innerJoin('clientes', 'cobrancas.id_cliente', 'clientes.id')
    .where('clientes.id_usuario', user.id);

    if (allBillings.length < 1) {
      return res.status(400).json('O usuário não possui cobranças')
    }

    allBillings.forEach(billing => {
      if (+billing.vencimento >= +now) {
        billing.status = "Pendente";
      }

      if (+billing.vencimento < +now) {
        billing.status = "Vencida"
      }
    });

    return res.status(200).json(allBillings)

  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  registerBilling,
  getCustomerBillings,
  getAllUserBillings
}