const yup = require('./settings');

const schemaEditBilling = yup.object().shape({
  id_cliente: yup.number().required(),
  descricao: yup.string().required(),
  status: yup.string().required(),
  valor: yup.number().required(),
  vencimento: yup.date().required(),
})

module.exports = schemaEditBilling;