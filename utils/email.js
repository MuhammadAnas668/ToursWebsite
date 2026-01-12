const nodemailer = require('nodemailer')
const pug = require('pug')
// new Email(user,url).sendWelcome()

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.firstName = user.name.split(' ')[0];
    this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
        return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  send(template,subject){
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`)
     const mailOptions = {
        from:this.from,
        to:this.to,
        subject,
        html,  
        text:options.message
    }
  }
  sendWelcome(){
    this.send('welcome','Welcome to the Natours Family!')
  }
}
const sendEmail = async options =>{

   
    await transporter.sendMail(mailOptions)
}
