const jwt = require("jsonwebtoken");
const { generateOTP, htmlForOTP } = require("../utils/otp");
const { sendEmail } = require("./MailService");

const userServices = {
    async sendOTPToEmail(email){
        let otp = generateOTP();
        let body = htmlForOTP(otp);
        let subject = "Email Verification OTP";
        
        await sendEmail(email, subject, body);

        let emailVerification = {
            email: email,
            otp: otp
        }

        let otpToken = jwt.sign(emailVerification, process.env.TOKEN_SECRET);

        return {otpToken};
    },
    async verifySignUpOTP(otpToken, otp){
        let 
    },
    async sendOTPToNumber(countryCode, phoneNumber){

    }
}

module.exports = userServices;