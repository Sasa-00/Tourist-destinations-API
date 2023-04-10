const nodemailer = require('nodemailer');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url
        this.from = 'Sasa M. <hello@sasa.io>'
    }

    newTransport(){
        return nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'testAPI',
                pass: process.env.SENDGRID_KEY,
            }
        })
    }

    // Send actual email
    async send(subject, text){
        // Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            text: text
        }

        // Create a transport and send email
        await this.newTransport().sendMail(mailOptions)

    }
    async sendPasswordReset(){
        await this.send('passwordReset', `Forgot your password? Submit a PATCH request with your new password and
    passwordConfirm to: ${this.url}.\nIf you didn't forget your password, please ignore this email!`)
    }
}

