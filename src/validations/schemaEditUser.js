const yup = require('./settings');

const schemaEditUser = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  senha: yup.string().strict(),
  cpf: yup.string(),
  telefone: yup.string()
})

module.exports = schemaEditUser;