"use strict";
const { BaseController } = require("./baseController");
const { twilioActions } = require("../Actions/TwilioActions");
const moment = require("moment");


class TwilioController extends BaseController {
    constructor(req, res) {
        super(req, res);
    }

    async callForwarding() {
        try {
            let payload = await twilioActions.callForwarding(
                this.reqBody,
                this.models,
                this.twilio
            );

            this.respondWithTwiml(payload);
        } catch (err) {
            this.respondWithError(err);
        }
    }

}

module.exports.TwilioController = {
    callForwarding: async (req, res) => {
        return new TwilioController(req, res).callForwarding();
    },
};
