const yup = require('./settings');

const schemaEditCustomer = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  cpf: yup.string().required(),
  telefone: yup.string().required(),
  cep: yup.string(),
  logradouro: yup.string(),
  complemento: yup.string(),
  bairro: yup.string(),
  cidade: yup.string(),
})

module.exports = schemaEditCustomer;