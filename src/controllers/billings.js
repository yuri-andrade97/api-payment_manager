const knex = require('../config/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const schemaRegisterBilling = require('../validations/schemaRegisterBilling');

const schemaEditBilling = require('../validations/schemaEditBilling');

const registerBilling = async (req, res) => {
  const { cliente, descricao, status, valor, vencimento } = req.body;
  const user = req.infoUser;

  try {
    await schemaRegisterBilling.validate(req.body);

    const registeringBilling = await knex('cobrancas').insert({
      id_usuario: user.id,
      id_cliente: cliente,
      descricao,
      status,
      valor,
      vencimento
    }).returning('*')

    if (registeringBilling.length !== 1) {
      return res.status(400).json('Cobrança não cadastrada.')
    }

    const getNameClient = await knex('clientes').select('nome').where('id', cliente).first()

    registeringBilling[0].nome = getNameClient.nome;

    return res.status(200).json(registeringBilling)
  } catch (error) {
    return res.status(400).json(error.message);
  }

};

const getCustomerBillings = async (req, res) => {
  const { id } = req.query;
  const user = req.infoUser;
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


      if (+billing.vencimento >= +now && billing.status !== "pago") {
        billing.status = "pendente";
      }

      if (+billing.vencimento < +now && billing.status !== "pago") {
        billing.status = "vencida"
      }
    });


    return res.status(200).json(getBillings);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const gettingReport = async (req, res) => {
  const { status } = req.query;
  const user = req.infoUser;
  const now = new Date();


  try {
    const allBillings = await knex('cobrancas')
    .select(
      'nome',
      'email',
      'cpf',
      'cobrancas.id',
      'cobrancas.status',
      'cobrancas.vencimento'
    )
    .innerJoin('clientes', 'cobrancas.id_cliente', 'clientes.id')
    .where('cobrancas.id_usuario', user.id)

    if (allBillings.length < 1) {
      return res.status(400).json('Você não possui clientes/cobranças')
    }

    if (status === "em dia") {
      const inDay = [];

      allBillings.forEach(billing => {
        if ( billing.status === "pago" || +billing.vencimento > +now) {
          inDay.push(billing)
        }
      });

      return res.json(inDay)
    }

    if (status === "inadimplente") {
      const defaulting = [];

      allBillings.forEach(billing => {
        if ( billing.status === "vencida" || +billing.vencimento < +now) {
          defaulting.push(billing)
        }
      });
      return res.json(defaulting)
    }

    if (status === "previstas") {
      const predicted = [];

      allBillings.forEach(billing => {
        if (billing.status === "pendente" && +billing.vencimento>= +now) {
          predicted.push(billing)
        }
      });

      return res.json(predicted)
    }

    if (status === "pagas") {
      const paid = [];

      allBillings.forEach(billing => {
        if (billing.status === "pago") {
          paid.push(billing)
        }
      });

      return res.json(paid)
    }

    if (status === "vencidas") {
      const paid = [];

      allBillings.forEach(billing => {
        if (billing.status === "pendente" && +billing.vencimento < +now) {
          paid.push(billing)
        }
      });

      return res.json(paid)
    }

    return res.status(200).json(allBillings)
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
      if (+billing.vencimento >= +now && billing.status !== "pago") {
        billing.status = "pendente";
      }

      if (+billing.vencimento < +now && billing.status !== "pago") {
        billing.status = "vencida"
      }
    });

    return res.status(200).json(allBillings)

  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const editBilling = async (req, res) => {
  const { id } = req.query;
  const {
    id_cliente, descricao, status, valor, vencimento
  } = req.body;

  try {
    await schemaEditBilling.validate(req.body);

    const editingBilling = await knex('cobrancas').update({
      id_cliente,
      descricao,
      status,
      valor,
      vencimento
    }).where('id', id);

    return res.status(200).json(editingBilling)


  } catch (error) {
    return res.status(400).json(error.message);
  }

};

const deleteBilling = async (req, res) => {
  const { id } = req.query;
  const now = new Date();

  try {
    const billingForDelete = await knex('cobrancas').select('*').where('id', id).first();

    if (!billingForDelete) {
      return res.status(400).json('Cobrança não encontrada')
    }

    if (billingForDelete.status !== "pendente") {
      return res.status(400).json('Não foi possível exclui a cobrança, pois só é possível excluir cobranças com status PENDENTE')
    }

    if (+billingForDelete.vencimento < +now) {
      return res.status(400).json('Não foi possível excluir a cobrança, pois a data do vencimento é menor do que o dia de hoje!')
    }

    const deletingBilling = await knex('cobrancas').where('id', id).delete()

    return res.status(200).json('Cobrança deletada com sucesso!')
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  registerBilling,
  getCustomerBillings,
  getAllUserBillings,
  editBilling,
  deleteBilling,
  gettingReport
}