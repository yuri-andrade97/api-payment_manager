const knex = require('../config/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const schemaRegisterClient = require('../validations/schemaRegisterClient');
const schemaEditCustomer = require('../validations/schemaEditCustomer');

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

    if (registeringClient.rowCount < 1) {
      return res.status(400).json('O cliente não foi cadastrado.');
    }

    return res.status(200).json(registeringClient);

  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const listCustomers = async (req, res) => {
  const user = req.infoUser;

  try {
    const getCustomers = await knex('clientes')
    .select(
      'clientes.id',
      'clientes.cpf',
      'nome',
      'email',
      "telefone",
      knex.raw('sum(COALESCE(cobrancas.valor, 0)) as valorTotalCobrancasFeitas'),
      knex.raw(`sum(case when cobrancas.status = 'pago' then COALESCE(cobrancas.valor, 0) else 0 end) as valorTotalCobrancasPagas`)
    )
    .where('clientes.id_usuario', user.id)
    .leftJoin('cobrancas', 'clientes.id', 'cobrancas.id_cliente')
    .groupBy('clientes.id', 'clientes.cpf', 'nome', 'email', 'telefone');

    if (getCustomers.length < 1) {
      return res.status(400).json('Usuário não possui clientes cadastrados')
    }

    return res.status(200).json(getCustomers);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const getDataCustomer = async (req, res) => {
  const user = req.infoUser;
  const { id } = req.query;

  try {
    const dataCustomer = await knex('clientes')
    .select(
      'clientes.id',
      'clientes.nome',
      'clientes.cpf',
      'clientes.email',
      'clientes.telefone',
      'clientes.cep',
      'clientes.logradouro',
      'clientes.complemento',
      'clientes.bairro',
      'clientes.cidade',
      'clientes.referencia',
      knex.raw('json_agg(cobrancas) as cobrancas')
    )
    .where('clientes.id', id)
    .leftJoin('cobrancas', 'clientes.id', 'cobrancas.id_cliente')
    .groupBy('clientes.id')
    .first();

    if (dataCustomer.length < 1) {
      return res.status(400).json('Cliente não encontrado');
    }

    return res.status(200).json(dataCustomer);
  } catch (error) {
    return res.status(400).json(error.message)
  }
};

const editDataCustomer = async (req, res) => {
  const { id } = req.query;
  const {
    nome, email, cpf, telefone, cep, logradouro, complemento, bairro, cidade
   } = req.body

  try {
    await schemaEditCustomer.validate(req.body);

    try {

      const customerData = await knex('clientes').select('email', 'cpf').where('id', id).first();

      if (email !== customerData.email) {
        const verifyIfEmailAlreadyExists = await knex('clientes').select('*').where('email', email);

        if (verifyIfEmailAlreadyExists.length === 1) {
          return res.status(400).json('E-mail já cadastrado.')
        }
      }

      if (cpf !== customerData.cpf) {
        const verifyIfCpfAlreadyExists = await knex('clientes').select('*').where('cpf', cpf);

        if (verifyIfCpfAlreadyExists.length === 1) {
          return res.status(400).json('CPF já cadastrado.')
        }
      }


      const editingCustomer = await knex('clientes').update({
        nome,
        email,
        cpf,
        telefone,
        cep,
        logradouro,
        complemento,
        bairro,
        cidade
      }).where('id', id).returning('*')

      if (editingCustomer.length < 1) {
        return res.status(400).json('Os dados do cliente não foram alterados.')
      }

      return res.status(200).json('Dados atualizados com sucesso!')
    } catch (error) {
      return res.status(400).json(error.message);
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
};


module.exports = {
  registerCustomer,
  listCustomers,
  getDataCustomer,
  editDataCustomer
}