const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 測試api
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
        member_sid: 0,
        nickname: '',
        token: '',
    };
    // console.log(req.body.account);
    // res.json(req.body);
    const sql = 'SELECT * FROM member WHERE email = ?';

    const [rows] = await db.query(sql, req.body.email);

    if(rows[0]?.password) {
        const pwValidate = await bcrypt.compare(req.body.password, rows[0].password);

        if(pwValidate) {
            const token = jwt.sign({member_sid: rows[0].sid}, process.env.JWT_SECRET)
            output =  {
                success: true,
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
        const e_sql = `SELECT * FROM member WHERE email = ?`
        const [e_rows] = await db.query(e_sql, req.body.email)
        if (! e_rows[0]) {
            const pw = await bcrypt.hash(req.body.password, 10);
            const sql = `INSERT INTO member (email, password, nickname, birthday) VALUES (?, ?, ?, ?)`;
            const [rows] = await db.query (sql, [
                req.body.email,
                pw,
                req.body.nickname || '',
                req.body.birthday || null,
            ])
            output = {
                ...output,
                success: true,
                error: '',
            }
        } else {
            output = {
                ...output,
                success: false,
                error: '重複email',
            }
        }

    }
    console.log(output);
    res.json(output);
})


module.exports = router;