const yup = require('./settings');

const schemaEditUser = yup.object().shape({
  nome: yup.string(),
  email: yup.string().email(),
  senha: yup.string().strict(),
  cpf: yup.string(),
  telefone: yup.string()
})

module.exports = schemaEditUser;