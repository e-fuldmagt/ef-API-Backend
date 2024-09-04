const jwt = require("jsonwebtoken");
const { generateOTP, htmlForOTP } = require("../utils/otp");
const { sendEmail } = require("./MailService");
var CryptoJS = require("crypto-js");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");

const userServices = {
    async sendOTPToEmail(email){
        let otp = generateOTP();
        let body = htmlForOTP(otp);
        let subject = "Email Verification OTP";
        
        await sendEmail(email, subject, body);

        let emailVerification = {
            credentials: {email},
            otp: otp
        }

        let otpToken = jwt.sign(emailVerification, process.env.OTP_TOKEN_SECRET);
        let encryptedOTPToken = CryptoJS.AES.encrypt(otpToken, process.env.ENCRYPTION_KEY).toString();
        return {encryptedOTPToken};
    },
    async verifySignUpOTP(encryptedOTPToken, otp){
        //Decrypt OTP Token
        let otpToken = CryptoJS.AES.decrypt(encryptedOTPToken, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        //Verify Token for Temparing
        let otpTokenDecrypted = jwt.verify(otpToken, process.env.OTP_TOKEN_SECRET);
        //Check if OTPs are Equal
        if(otp == otpTokenDecrypted.otp)
        {
            //getting equal make a jwt for making account//
            let credentialsToken = jwt.sign(otpTokenDecrypted.credentials, process.env.SIGNUP_TOKEN_SECRET);
            return {credentialsToken}
        }
        else{
            return null;
        }
    },
    async registerUser(credentialsToken, userObj){
        const user = {...userObj};
        let credentials = jwt.verify(credentialsToken, process.env.SIGNUP_TOKEN_SECRET);
        if(credentials.email){
            user.email = credentials.email
        }
        else{
            user.phoneNumber = {
                countryCode : credentials.countryCode,
                number : credentials.number
            }
        }
        //Adding User//
        user.pin = null;
        //
        let newUser = new User(user);

        await newUser.save();

        let createPasswordToken = jwt.sign({userId: newUser._id}, process.env.CREATE_PASSWORD_TOKEN);

        return {createPasswordToken, user:{...newUser.toObject(), pin: undefined}};
    },

    async createPassword(createPasswordToken, pin){
        let {userId} = jwt.verify(createPasswordToken, process.env.CREATE_PASSWORD_TOKEN);
        
        let user = await User.findById(userId);

        let salt = await bcryptjs.genSalt(10);

        let encryptedPin = await bcryptjs.hash(pin, salt);

        user.pin = encryptedPin;

        await user.save();

        let authToken = jwt.sign({userId: user._id}, process.env.AUTHENTICATION_TOKEN);

        return {authToken, user:{...user.toObject(), pin: undefined}};
    },
    async login(credentials, pin){
        let user = null;

        if(credentials.email){
            user = await User.findOne({email: credentials.email});
        }
        else if(credentials.phone){
            user = await User.findOne({phone: credentials.phone})
        }

        if(!user){
            throw new Error("User Not Found");
        }
        
        //Matching Password//
        if(!(await bcryptjs.compare(pin, user.pin))){
            throw new Error("Password not matching");
        }

        let authToken = jwt.sign({userId: user._id}, process.env.AUTHENTICATION_TOKEN);

        return {authToken, user:{...user.toObject(), pin: undefined}};
    },
    async verifyForgotPasswordOtp(encryptedOTPToken, otp){
        //Decrypt OTP Token
        let otpToken = CryptoJS.AES.decrypt(encryptedOTPToken, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        //Verify Token for Temparing
        let otpTokenDecrypted = jwt.verify(otpToken, process.env.OTP_TOKEN_SECRET);
        //Check if OTPs are Equal
        if(otp != otpTokenDecrypted.otp)
        {
            return null;
        }
        let credentials = otpTokenDecrypted.credentials;
        let user=null;
        if(credentials.email){
            user = await User.findOne({email: credentials.email})
        }
        else if(credentials.phone){
            user = await User.findOne({phone: credentials.phone})
        }
        
        if(!user){
            return null;
        }

        let createPasswordToken = jwt.sign({userId: user._id}, process.env.CREATE_PASSWORD_TOKEN);

        return {createPasswordToken, user:{...user.toObject(), pin: undefined}};
    },
    async sendOTPToNumber(countryCode, phoneNumber){
        
    }
}

module.exports = userServices;