const express = require('express')
const app = express()
const port = 3000

const accountSid = "AC4946f7879ba9a71ec12bc85287e29b98";
const authToken = "cd3217aa63e8f4d057ae328498a75027";
const client = require('twilio')(accountSid, authToken);
const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;


app.get('/call', (req, res) => {
    client.calls.create({
        to: "+919359192032",
        from: "+19134236245",
        url: 'http://demo.twilio.com/docs/voice.xml',
    })
        .then(call => res.send(call));
})

app.get('/availablePhoneNumbers', (req, res) => {
    client.incomingPhoneNumbers.list({ status: 'active' })
        .then(hosted_number_order => { console.log(hosted_number_order); res.send(hosted_number_order) });
})

app.post('/incoming-call', (req, res) => {
    const twiml = new VoiceResponse();

    console.log({ req });
    twiml.dial({ callerId: '+14344338771' }, '+16692658445'); // Replace with the destination phone number

    res.type('text/xml');
    res.send(twiml.toString());
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})