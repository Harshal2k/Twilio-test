//importing modules
const express = require('express');
const { TwilioController } = require('../Controller/twilioController');
const { callForwarding } = TwilioController;

const router = express.Router()

router.post('/callForwarding', callForwarding);

module.exports.twilioRoutes = router