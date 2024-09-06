const nodemailer = require("nodemailer");

exports.sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const emailOptions = {
        from: `Customer <${options.email}>`, // sender address
        to: process.env.EMAIL_USER, // list of receivers
        subject: `${options.subject}`, // Subject line
        html: `${options.message}`, // text line
    }

    await transporter.sendMail(emailOptions)
}

