// const fetch = require("node-fetch"); // npm install node-fetch
// const util = require("util");

// async function sendSMS() {
//   const payload = {
//     sender: "E-Fuldmagt",
//     message: "Hello World",
//     recipients: [
//       { msisdn: 923185556339 },
//     ],
//   };

//   const apiToken = "";
//   const encodedAuth = Buffer.from(`${apiToken}:`).toString("base64");

//   const resp = await fetch("https://gatewayapi.com/rest/mtsms", {
//     method: "post",
//     body: JSON.stringify(payload),
//     headers: {
//       Authorization: `Basic ${encodedAuth}`,
//       "Content-Type": "application/json",
//     },
//   });
//   const json = await resp.json()
//   console.log(util.inspect(json, {showHidden: false, depth: null}));
//   if (resp.ok) {
//     console.log("congrats! messages are on their way!");
//   } else {
//     console.log("oh-no! something went wrong...");
//   }
// }

// sendSMS();