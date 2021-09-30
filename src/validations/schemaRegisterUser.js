const yup = require('./settings');

const schemaRegisterUser = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  senha: yup.string().strict().required()
})

module.exports = schemaRegisterUser;