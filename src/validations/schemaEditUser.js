const yup = require('./settings');

const schemaEditUser = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  senha: yup.string().strict(),
  cpf: yup.string().min(11),
  telefone: yup.string()
})

module.exports = schemaEditUser;