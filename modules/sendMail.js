const nodemailer = require("nodemailer");

module.exports = (emails, subject, html, done) => {
  let transporter = nodemailer.createTransport({
    service: config.adminEmailService,
    auth: {
      user: config.adminEmailUser,
      pass: config.adminEmailPass
    }
  });
  let mailOptions = {
    from: config.emailsFrom,
    to: emails,
    subject: subject,
    html: html
  };
  transporter.sendMail(mailOptions, (e, info) => {
    if (e) return done(e);
    return done(null, info);
  });
};
