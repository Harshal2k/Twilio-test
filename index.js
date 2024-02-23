const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const urlencoded = require('body-parser').urlencoded;
const { Sequelize } = require('sequelize');
const app = express()
app.use(urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

const sequelize = new Sequelize('postgres://twilio_mapping_user:nOUhllfVvG2HA5AhR1WyBdBtzRLZ4ih0@dpg-cn9h45ol6cac73a0ukqg-a.oregon-postgres.render.com/twilio_mapping', {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: true,
        native: true
    },
})
const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

connectDb();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;

const connectedNumbers = new Set();

const serviceName = "/callManagement"

app.get(`${serviceName}/call`, (req, res) => {
    client.calls.create({
        to: "+919359192032",
        from: "+19134236245",
        url: 'http://demo.twilio.com/docs/voice.xml',
    })
        .then(call => res.send(call));
})

app.get(`${serviceName}/availablePhoneNumbers`, async (req, res) => {
    let numbers = await client.incomingPhoneNumbers.list({ status: 'active' });
    console.log({ numbers });
    res.send(numbers);

    // client.incomingPhoneNumbers.list({ status: 'active' })
    //     .then(hosted_number_order => { console.log(hosted_number_order); res.send(hosted_number_order) })
    //     .catch((err) => res.send(err))
})

app.get(`${serviceName}/incoming-call`, (req, res) => {
    const twiml = new VoiceResponse();
    console.log("-------------------------")
    console.log({ from: req.body });
    console.log({ query: req.query });
    twiml.dial({ callerId: '+19134236245' }, '+919359192032');

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post(`${serviceName}/getherInput`, (req, res) => {
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

app.post(`${serviceName}/voice`, (req, res) => {
    const response = new VoiceResponse();
    const dial = response.dial({ callerId: '+19134236245', sequential: true });
    dial.number({
    }, '+919359192032');
    console.log(response.toString())
    res.type('text/xml');
    res.send(response.toString());
});

app.post(`${serviceName}/gather`, (req, res) => {
    console.log("--------------------------------")
    console.log(req.body)
    const digitPressed = req.body.Digits;
    console.log('Caller entered during call:', digitPressed);

    // const twiml = new VoiceResponse();
    // const gather = twiml.gather({
    //     numDigits: 1,
    //     action: '/gather',
    // });

    //res.type('text/xml');
    res.send("success");
});

app.post(`${serviceName}/status`, (req, res) => {
    console.log("Status changed");
    console.log({ body: req.body })
    const twiml = new VoiceResponse();
    twiml.dial({ callerId: '+19134236245' }, '+919359192032');
    const gather = twiml.gather({
        numDigits: 1,
        action: '/gather',
        timeout: 50,

    });
    gather.say('Please enter a digit.');
    res.type('text/xml');
    res.send(twiml.toString());
})

app.post(`${serviceName}/voice2`, (req, res) => {
    const response = new VoiceResponse();

    // Forward the call to another number
    const dial = response.dial({ callerId: '+19134236245' });
    dial.number('+919359192032'); // Replace with the number you want to forward to

    // Capture keypad input
    const gather = response.gather({
        action: '/gather',
        method: 'POST',
        numDigits: 1,
        timeout: 50
    });
    gather.say('Please press any key.');
    console.log(response.toString())
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
});

// Endpoint to handle DTMF tones
app.post(`${serviceName}/gather2`, (req, res) => {
    const digitPressed = req.body.Digits;
    console.log(`Digit pressed: ${digitPressed}`);

    // You can process the digit pressed here
    // For real-time notification, you can send the digit to your server or perform actions based on the digit immediately

    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>'); // Respond with empty TwiML to end the gather
});

app.post(`${serviceName}/mapUsers`, async (req, res) => {
    try {
        if (!req?.body?.phone) {
            res.status(400)
            res.send({ error: 'Phone is required' });
            return;
        }
        await sequelize.query(`delete from phone_mapping where twilio_number='+14344338771'`);
        await sequelize.query(`insert into phone_mapping (host,twilio_number) values ('${req?.body.phone}','+14344338771');`);
        res.send({ twilioPhone: `+14344338771` })
    } catch (err) {
        console.log({ err })
        res.status(500)
        res.send({ error: 'something went wrong' })
    }
});

app.post(`${serviceName}/callForwarding`, async (req, res) => {
    try {
        console.log(req.body)
        let mapDetails = await sequelize.query(`select * from phone_mapping where twilio_number='${req.body.To}';`);
        console.log({ mapDetails: mapDetails[0] });
        if (mapDetails[0]?.length == 0 || (mapDetails[0][0]?.caller ? !(mapDetails[0][0]?.caller == req?.body?.From || mapDetails[0][0]?.host == req?.body?.From) : mapDetails[0][0]?.host == req?.body?.From)) {
            res.set('Content-Type', 'text/xml');
            res.send(`<Response>
            <Say>Phone number not mapped</Say>
          </Response>`);
            return;
        } else if (mapDetails[0][0]?.caller == null) {
            await sequelize.query(`update phone_mapping set caller = '${req.body.From}' where twilio_number = '${mapDetails[0][0].twilio_number}'`)
        }
        const response = new VoiceResponse();
        const dial = response.dial({ callerId: '+14344338771' });
        dial.number({
        }, req?.body?.From == mapDetails[0][0]?.host ? mapDetails[0][0]?.caller : mapDetails[0][0]?.host);
        res.type('text/xml');
        res.send(response.toString());
    } catch (err) {
        console.log(err)
    }
});

app.post(`${serviceName}/conference`, async (req, res) => {
    try {
        const response = new VoiceResponse();
        const dial = response.dial();
        dial.conference('Room 1234');
        conference.dial().client("+919359192032")
        console.log(response.toString())
        res.type('text/xml');
        res.send(response.toString());
    } catch (err) {
        console.log({ err })
        res.status(500)
        res.send({ error: 'something went wrong' })
    }
});

app.get(`${serviceName}/health`, (req, res) => {
    res.send("I am ok bro 🥹")
})

console.log(`PORT : ${port}`)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})