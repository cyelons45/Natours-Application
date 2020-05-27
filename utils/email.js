const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user,url).sendWelcome
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Samuel Nyarkoh <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME, // generated ethereal user
          pass: process.env.SENDGRID_PASSWORD, // generated ethereal password
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
      },
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    let mailOptions = {
      from: this.from, // sender address
      to: this.to, // list of receivers
      subject, // Subject line
      html, // html body
      text: htmlToText.fromString(html), // plain text body
    };

    await this.newTransport().sendMail(mailOptions);

    //  await transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset Token (valid for only 10 min)'
    );
  }
};

// const sendEmail = async (options) => {
//1. Create transporter
// let transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USERNAME, // generated ethereal user
//     pass: process.env.EMAIL_PASSWORD, // generated ethereal password
//   },
// });
//2. Define email options
// send mail with defined transport object
// let mailOptions = {
//   from: 'hello@example.com', // sender address
//   to: options.email, // list of receivers
//   subject: options.subject, // Subject line
//   text: options.message, // plain text body
//   // html: "<b>Hello world?</b>" // html body
// };

//3. Actually send the email
// await transporter.sendMail(mailOptions);
// };
// module.exports = sendEmail;
