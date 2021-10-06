const yup = require('./settings');

const schemaRegisterBilling = yup.object().shape({
  cliente: yup.number().required(),
  descricao: yup.string().required(),
  status: yup.string().required(),
  valor: yup.number().required(),
  vencimento: yup.date().required(),
})

module.exports = schemaRegisterBilling;