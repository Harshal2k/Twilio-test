//importing modules
const express = require('express')
const { CallMgmtController } = require('../Controller/callManagementController');
const { mapUsers, addNumbers, deleteNumbers, changeStatus, mapUsersV2 } = CallMgmtController;

const router = express.Router()

router.post('/mapUsers2', mapUsers);

router.post('/addNumbers', addNumbers);

router.post('/deleteNumbers', deleteNumbers);

router.post('/changeStatus', changeStatus);

router.post('/v2/mapUsers', mapUsersV2);

module.exports.callManagementRoutes = router