const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Anantha Krishnan <${process.env.EMAIL_ID}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //use sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASS,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_HOST_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      subject,
      url: this.url,
      firstName: this.firstName,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText(html),
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours Family!');
  }

  async sendResetPassword() {
    await this.send(
      'resetPassword',
      'Please click the reset link (! valid for 10 mins)'
    );
  }
};
