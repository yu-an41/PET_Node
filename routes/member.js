const express = require('express');
const router = express.Router();
const db = require(__dirname + '/modules/db_connect');
const jwt = require('jsonwebtoken');

router.post('/login/api', async (req, res)=> {
    const sql = 'SELECT * FROM member WHERE sid = 1';

})


module.exports = router;