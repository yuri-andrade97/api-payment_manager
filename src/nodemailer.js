const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "8caf7f5f3e0cd8",
    pass: "7d29588a7c82e9"
  }
});

module.exports = transport;