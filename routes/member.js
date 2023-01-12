const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect');
const jwt = require('jsonwebtoken');

router.get('/login/api', async (req, res)=> {
    const sql = 'SELECT * FROM member WHERE sid = 1';
    const [rows] = await db.query(sql);
    console.log('ABC');
    res.json({ABC: 1})
})

router.post('/login/api', async (req, res)=> {
    let output = {
        success: false,
        error: '',
        nickname: '',
        token: '',
    };
    // console.log(req.body.account);
    // res.json(req.body);
    const sql = 'SELECT * FROM member WHERE email = ?';

    const [rows] = await db.query(sql, req.body.email);
    if(rows[0]?.password) {
        if(rows[0].password === req.body.password) {
            const token = jwt.sign({member_sid: rows[0].sid}, process.env.JWT_SECRET)
            output =  {
                success: true,
                error: '',
                member_sid: rows[0].sid,
                nickname: rows[0].nickname,
                token: token,
            }
        }
    }
    console.log({rows});
    res.json(output);
})

router.post('/register/api', async (req, res) => {
    let output = {
        success: false,
        error: '',
    };

    if(!req.body.email || !req.body.password) {
        output = {
            ...output,
            error: '參數不足',
        }
    } else { 
        const sql = `INSERT INTO member (email, password, nickname, birthday) VALUES (?, ?, ?, ?)`;
        const [rows] = await db.query (sql, [
            req.body.email,
            req.body.password,
            req.body.nickname || '',
            req.body.birthday || null,
        ])
        output = {
            ...output,
            success: true,
            error: '',
        }
    }
    console.log(output);
    res.json(output);
})


module.exports = router;