const jwt = require("jsonwebtoken");
const { generateOTP, htmlForOTP } = require("../utils/otp");
const { sendEmail } = require("./MailService");
var CryptoJS = require("crypto-js");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const Company = require("../models/company");
const NotificationSetting = require("../models/notificationSettings");



const userServices = {
    async getUserByCredentials(credentials){
        let user = null;
    
        if(credentials.email){
            user = await User.findOne({email: credentials.email});
        }
        else if(credentials.phone){
            user = await User.findOne({phone: {
                countryCode: credentials.phone.countryCode,
                number: parseInt(credentials.phone.number)
            }})
        }
    
        return user;
    },
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
    async registerUser(emailCredentialsToken, phoneCredentialsToken, userObj){
        console.log(emailCredentialsToken, phoneCredentialsToken, userObj)
        const user = {...userObj};
        let emailCredentials = jwt.verify(emailCredentialsToken, process.env.SIGNUP_TOKEN_SECRET);
        let phoneCredentials = jwt.verify(phoneCredentialsToken, process.env.SIGNUP_TOKEN_SECRET);
        if(!emailCredentials.email)
            throw Error("Email not found");
        if(!phoneCredentials.phone)
            throw Error("phone not found");
        
        user.email = emailCredentials.email
        user.phone = phoneCredentials.phone
        //Adding User//
        user.pin = null;
        //
        let newUser = new User(user);

        await newUser.save();
        await NotificationSetting.create({userId: newUser._id});
        let createPasswordToken = jwt.sign({userId: newUser._id}, process.env.CREATE_PASSWORD_TOKEN);

        return {createPasswordToken, user:{...newUser.toObject(), pin: undefined}};
    },

    async createPassword(createPasswordToken, deviceId, pin){
        let {userId} = jwt.verify(createPasswordToken, process.env.CREATE_PASSWORD_TOKEN);
        
        let user = await User.findById(userId);

        
        if(!user){
            throw new Error("Account doesn't exist");
        }

           
        if(user.deleted){
            throw new Error("This account has been deleted");
        }

        let salt = await bcryptjs.genSalt(10);

        let encryptedPin = await bcryptjs.hash(pin, salt);

        user.pin = encryptedPin;
        user.deviceId = deviceId;

        let refreshToken = jwt.sign({userId: user._id}, process.env.REFRESH_TOKEN, {expiresIn: "30d"});

        user.refreshTokens.push(refreshToken);

        await user.save();

        //Check if user has a company//
        let company  = await Company.findById(user.company)

        let authToken = jwt.sign({userId: user._id, companyId: company?company._id:null}, process.env.AUTHORIZATION_TOKEN);



        return {authToken, refreshToken, user:{...user.toObject(), pin: undefined}, company: company?company.toObject():null};
    },
    async login(credentials, pin){
        let user = await this.getUserByCredentials(credentials);

        if(!user){
            throw new Error("User Not Found");
        }
        
        if(user.deleted){
            throw new Error("This account has been deleted");
        }

        //Matching Password//
        if(!(await bcryptjs.compare(pin, user.pin))){
            throw new Error("Password not matching");
        }

        //Check if user has a company//
        let company  = await Company.findById(user.company)

        let authToken = jwt.sign({userId: user._id, companyId: company?company._id:null}, process.env.AUTHORIZATION_TOKEN);

        let refreshToken = jwt.sign({userId: user._id}, process.env.REFRESH_TOKEN, {expiresIn: "30d"});

        user.refreshTokens.push(refreshToken);

        await user.save();

        return {authToken, refreshToken, user:{...user.toObject(), pin: undefined}, company: company?company.toObject():null};
    },
    async verifyForgotPasswordOtp(encryptedOTPToken, otp){
        //Decrypt OTP Token
        let otpToken = CryptoJS.AES.decrypt(encryptedOTPToken, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        //Verify Token for Temparing
        let otpTokenDecrypted = jwt.verify(otpToken, process.env.OTP_TOKEN_SECRET);
        console.log(otpTokenDecrypted);
        //Check if OTPs are Equal
        if(otp != otpTokenDecrypted.otp)
        {
            return null;
        }
        let credentials = otpTokenDecrypted.credentials;
        let user= await this.getUserByCredentials(credentials);
        
        if(!user){
            return null;
        }
        if(user.deleted){
            return null;
        }

        let createPasswordToken = jwt.sign({userId: user._id}, process.env.CREATE_PASSWORD_TOKEN);

        return {createPasswordToken, user:{...user.toObject(), pin: undefined}};
    },
    async addUser(userObj){
        const user = {...userObj};
        
        //
        let newUser = new User(user);

        await newUser.save();

        return {user:{...newUser.toObject(), pin: undefined}};
    },
    async getUsers(query){
        // Destructure query parameters from request
        const { q, name, email, number } = query;

        // Initialize an empty filter object
        let filter = {};

        // Check for the "q" parameter - search across email, number, and name
        if (q) {
        filter = {
            $or: [
                { email: { $regex: q, $options: 'i' } }, // case-insensitive substring match for email
                { name: { $regex: q, $options: 'i' } },  // case-insensitive substring match for name
                { number: { $regex: q, $options: 'i' } } // case-insensitive substring match for number
            ]
        };
        }

        // If "name" is provided, search by name
        if (name) {
        filter.name = new RegExp(name, 'i'); // case-insensitive search for name
        }

        // If "email" is provided, search by email
        if (email) {
        filter.email = new RegExp(email, 'i'); // case-insensitive search for email
        }

        // If "number" is provided, search by number
        if (number) {
        filter.number = number; // exact match for number
        }

        // Fetch users based on the filter
        const users = await User.aggregate(
            [
                {
                    $addFields: {
                        name: {$concat: ["$name.firstName", " ", "$name.lastName"]}
                    }
                },
               { $match: {
                    ...filter
                    }
                },
                { $unset: [ "pin", "refreshTokens"] }

            ]
        );
        // Send back the results
        return users;
    },
    async sendOTPToNumber(phone){
        let otp = generateOTP();
        let body = "Your OTP for Power of Attorny is: " + otp;
        let subject = "Phone Verification OTP";
        
        //await sendEmail(email, subject, body);

        let phoneVerificatoin = {
            credentials: {phone},
            otp: otp
        }

        let otpToken = jwt.sign(phoneVerificatoin, process.env.OTP_TOKEN_SECRET);
        let encryptedOTPToken = CryptoJS.AES.encrypt(otpToken, process.env.ENCRYPTION_KEY).toString();
        return {encryptedOTPToken, body, subject};
    }
}

module.exports = userServices;