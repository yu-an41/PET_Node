const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect');
const jwt = require('jsonwebtoken');

router.post('/login/api', (req, res)=> {
    const output = {
        success: false,
        error: '',
        auth: {},
    };
    console.log(req.body.account);
    res.json(req.body);
    // const sql = 'SELECT * FROM member WHERE sid = ?';

    // const [rows] = await db.query(sql, req.body.account);
    // console.log({rows});
    // res.json({rows})
})


module.exports = router;