"use strict";
const { BaseController } = require("./baseController");
const { callMgmtActions } = require("../Actions/callMgmtActions");

const moment = require("moment");


class CallMgmtController extends BaseController {
    constructor(req, res) {
        super(req, res);
    }

    async mapUsers() {
        try {
            let payload = await callMgmtActions.mapUsers(
                this.reqBody,
                this.models,
                this.twilio
            );

            this.respondWithSuccess(payload);
        } catch (err) {
            this.respondWithError(err);
        }
    }

    async addNumbers() {
        try {
            let payload = await callMgmtActions.addNumbers(
                this.reqBody,
                this.models,
                this.twilio
            );

            this.respondWithSuccess(payload);
        } catch (err) {
            this.respondWithError(err);
        }
    }

    async deleteNumbers() {
        try {
            let payload = await callMgmtActions.deleteNumbers(
                this.reqBody,
                this.models,
                this.twilio
            );

            this.respondWithSuccess(payload);
        } catch (err) {
            this.respondWithError(err);
        }
    }

    async changeStatus() {
        try {
            let payload = await callMgmtActions.changeStatus(
                this.reqBody,
                this.models,
                this.params,
            );

            this.respondWithSuccess(payload);
        } catch (err) {
            this.respondWithError(err);
        }
    }

    async mapUsersV2() {
        try {
            let payload = await callMgmtActions.mapUsersV2(
                this.reqBody,
                this.models,
                this.twilio
            );

            this.respondWithSuccess(payload);
        } catch (err) {
            this.respondWithError(err);
        }
    }

}

module.exports.CallMgmtController = {
    mapUsers: async (req, res) => {
        return new CallMgmtController(req, res).mapUsers();
    },
    addNumbers: async (req, res) => {
        return new CallMgmtController(req, res).addNumbers();
    },
    deleteNumbers: async (req, res) => {
        return new CallMgmtController(req, res).deleteNumbers();
    },
    changeStatus: async (req, res) => {
        return new CallMgmtController(req, res).changeStatus();
    },
    mapUsersV2: async (req, res) => {
        return new CallMgmtController(req, res).mapUsersV2();
    },
};
