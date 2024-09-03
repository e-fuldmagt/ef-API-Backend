// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function sendMessage(number, body) {
  const message = await client.messages.create({
    body: body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: number,
  });

  return message
}

module.exports = {sendMessage}