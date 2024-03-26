"use strict";
const { callForwarding } = require("./callForwarding");
const { callForwardingV2 } = require("./callForwardingV2");

module.exports.twilioActions = {
    callForwarding:callForwarding,
    callForwardingV2:callForwardingV2
};
