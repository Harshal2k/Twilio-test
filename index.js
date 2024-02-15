const express = require('express')
const dotenv = require('dotenv');
dotenv.config();
const urlencoded = require('body-parser').urlencoded;
const app = express()
app.use(urlencoded({ extended: false }));
const port = process.env.PORT;

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;

const connectedNumbers = new Set();

app.get('/call', (req, res) => {
    client.calls.create({
        to: "+919359192032",
        from: "+19134236245",
        url: 'http://demo.twilio.com/docs/voice.xml',
    })
        .then(call => res.send(call));
})

app.get('/availablePhoneNumbers', async (req, res) => {
    let numbers = await client.incomingPhoneNumbers.list({ status: 'active' });
    console.log({ numbers });
    res.send(numbers);

    // client.incomingPhoneNumbers.list({ status: 'active' })
    //     .then(hosted_number_order => { console.log(hosted_number_order); res.send(hosted_number_order) })
    //     .catch((err) => res.send(err))
})

app.get('/incoming-call', (req, res) => {
    const twiml = new VoiceResponse();
    console.log("-------------------------")
    console.log({ from: req.body });
    console.log({ query: req.query });
    twiml.dial({ callerId: '+19134236245' }, '+919359192032');

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/getherInput', (req, res) => {
    const twiml = new VoiceResponse();
    twiml.dial({ callerId: '+19134236245' }, '+919359192032');
    /** helper function to set up a <Gather> */
    function gather() {
        const gatherNode = twiml.gather({ numDigits: 1 });
        gatherNode.say('For sales, press 1. For support, press 2.');

        // If the user doesn't enter input, loop
        twiml.redirect('/voice');
    }

    // If the user entered digits, process their request
    if (req.body.Digits) {
        switch (req.body.Digits) {
            case '1':
                twiml.say('You selected sales. Good for you!');
                console.log('You selected sales. Good for you!')
                break;
            case '2':
                twiml.say('You need support. We will help!');
                console.log('You need support. We will help!');
                break;
            default:
                twiml.say("Sorry, I don't understand that choice.");
                console.log("Sorry, I don't understand that choice.");
                twiml.pause();
                gather();
                break;
        }
    } else {
        // If no input was sent, use the <Gather> verb to collect user input
        gather();
    }

    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/voice', (req, res) => {
    const response = new VoiceResponse();
    const dial = response.dial({ callerId: '+19134236245', sequential: true });
    dial.number({
        sendDigits: 'Enter any number',
        url: '/gather'
    }, '+919359192032');
    const gather = response.gather({
        numDigits: 1,
        action: '/gather',
        actionOnEmptyResult: true
    });
    gather.say('Please enter a digit.');
    console.log(response.toString())
    res.type('text/xml');
    res.send(response.toString());
});

app.post('/gather', (req, res) => {
    console.log("--------------------------------")
    console.log(req.body)
    const digitPressed = req.body.Digits;
    console.log('Caller entered during call:', digitPressed);

    const twiml = new VoiceResponse();
    const gather = twiml.gather({
        numDigits: 1,
        action: '/gather',
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/status', (req, res) => {
    console.log("Status changed");
    console.log({ body: req.body })
    const twiml = new VoiceResponse();
    const gather = twiml.gather({
        numDigits: 1,
        action: '/gather',
        timeout: 50,

    });
    gather.say('Please enter a digit.');
    res.type('text/xml');
    res.send(twiml.toString());
})

app.post('/voice2', (req, res) => {
    const response = new VoiceResponse();
  
    // Forward the call to another number
    const dial = response.dial();
    dial.number('+919359192032'); // Replace with the number you want to forward to
  
    // Capture keypad input
    const gather = response.gather({
      action: '/gather',
      method: 'POST',
      numDigits: 1,
    });
    gather.say('Please press any key.');
    console.log(response.toString())
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
  });
  
  // Endpoint to handle DTMF tones
  app.post('/gather2', (req, res) => {
    const digitPressed = req.body.Digits;
    console.log(`Digit pressed: ${digitPressed}`);
  
    // You can process the digit pressed here
    // For real-time notification, you can send the digit to your server or perform actions based on the digit immediately
  
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>'); // Respond with empty TwiML to end the gather
  });


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})