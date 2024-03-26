//importing modules
const express = require('express');
const { TwilioController } = require('../Controller/twilioController');
const { callForwarding, callForwardingV2 } = TwilioController;

const router = express.Router()

router.post('/callForwarding', callForwarding);

router.post('/v2/callForwarding', callForwardingV2);


module.exports.twilioRoutes = router