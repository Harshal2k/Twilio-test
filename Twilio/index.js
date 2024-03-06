const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;

const twilioSetup = {}
twilioSetup.client = client;
twilioSetup.twilio = twilio;
twilioSetup.VoiceResponse = VoiceResponse

module.exports = twilioSetup;