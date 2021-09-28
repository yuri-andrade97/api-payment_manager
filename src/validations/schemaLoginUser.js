const yup = require('./settings');

const schemaLoginUser = yup.object().shape({
  email: yup.string().email().required(),
  senha: yup.string().strict().required()
})

module.exports = schemaLoginUser;