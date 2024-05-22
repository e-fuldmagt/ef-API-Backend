const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv").config();


const sendSGMail = async ({
  to,
  sender,
  subject,
  html,
  attachments,
  text,
}) => {
  try {
    sgMail.setApiKey(process.env.MAIL_API_KEY);

    const msg = {
      to: to, // Change to your recipient
      from: sender, // Change to your verified sender
      subject: subject,
      html: html,
      // text: text,
      attachments,
    };

    
    return sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
};

exports.sendEmail = async (args) => {
  if (!process.env.NODE_ENV === "development") {
    return Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};