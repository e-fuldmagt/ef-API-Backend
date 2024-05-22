require('dotenv').config();
const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET
});

function sendSms(phoneNumber, message) {
  return new Promise((resolve, reject) => {
    vonage.sms.send({ to: phoneNumber, from: 'Nexmo', text: message }, (err, responseData) => {
      if (err) {
        reject(err);
      } else {
        if (responseData.messages[0].status === "0") {
          resolve('Message sent successfully.');
        } else {
          reject(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
      }
    });
  });
}

module.exports = { sendSms };
