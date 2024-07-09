const {JWT } = require('google-auth-library')
const axios = require('axios')
const fs = require('fs')
const path = require('path'); // Add this line to require the path module


// path to your service account key
// const SERVICE_ACCOUNT_FILE = './fuldmagt-8cb2d-firebase-adminsdk-dr6ue-29e72d7596.json'
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'fuldmagt-8cb2d-firebase-adminsdk-dr6ue-29e72d7596.json');


// load the service account key
const Service_Account = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE))

// define the required scope
const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']

// create jwt client
const client = new JWT({
    email:Service_Account.client_email,
    key: Service_Account.private_key,
    scopes: SCOPES
})

async function getAccessToken() {
    const tokens = await client.authorize()
    // console.log(tokens.access_token);
    return (tokens.access_token)
}

module.exports = { getAccessToken };
