//importing modules
const express = require('express')
const { CallMgmtController } = require('../Controller/callManagementController');
const { mapUsers, addNumbers, deleteNumbers, changeStatus } = CallMgmtController;

const router = express.Router()

router.post('/mapUsers2', mapUsers);

router.post('/addNumbers', addNumbers);

router.post('/deleteNumbers', deleteNumbers);

router.post('/changeStatus', changeStatus);

module.exports.callManagementRoutes = router