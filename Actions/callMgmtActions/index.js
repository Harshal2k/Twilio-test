"use strict";
const { addNumbers } = require("./addNumbers");
const { changeStatus } = require("./changeStatus");
const { deleteNumbers } = require("./deleteNumbers");
const { mapUsers } = require("./mapUsers");
const { mapUsersV2 } = require("./mapUsersV2");

module.exports.callMgmtActions = {
    mapUsers: mapUsers,
    addNumbers: addNumbers,
    deleteNumbers: deleteNumbers,
    changeStatus: changeStatus,
    mapUsersV2: mapUsersV2
};
