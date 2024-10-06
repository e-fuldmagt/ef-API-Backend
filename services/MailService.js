const nodemailer = require('nodemailer');

async function sendEmail(email, subject, body) {
    var mail = nodemailer.createTransport({
        host: 'websmtp.simply.com',
        port: 587,
        secure: false,
        auth: {
            user: "noreply@e-fuldmagt.dk", // Your email id
            pass: "bismillah@1@Ahad" // Your password
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    var mailOptions = {
        from: "noreply@e-fuldmagt.dk",
        to: email,
        subject: subject,
        html: body
    };

    let response = null;

    try{
        response = await mail.sendMail(mailOptions);
    }
    catch(err){
        console.log(err)
    }
 
    return response
}

module.exports = {sendEmail};