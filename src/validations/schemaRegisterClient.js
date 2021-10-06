const yup = require('./settings');

const schemaRegisterClient = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  cpf: yup.string().required().min(11),
  telefone: yup.string().required(),
  cep: yup.string(),
  logradouro: yup.string(),
  complemento: yup.string(),
  bairro: yup.string(),
  cidade: yup.string(),
  pontoDeReferencia: yup.string()
})

module.exports = schemaRegisterClient;