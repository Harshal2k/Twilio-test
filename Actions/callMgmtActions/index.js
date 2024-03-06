"use strict";
const { addNumbers } = require("./addNumbers");
const { changeStatus } = require("./changeStatus");
const { deleteNumbers } = require("./deleteNumbers");
const { mapUsers } = require("./mapUsers");

module.exports.callMgmtActions = {
    mapUsers: mapUsers,
    addNumbers: addNumbers,
    deleteNumbers: deleteNumbers,
    changeStatus: changeStatus
};
