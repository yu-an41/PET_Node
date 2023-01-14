const express = require('express');
const router = express.Router();
const db = require(__dirname + '/../modules/db_connect');

router.get('/list/api', async (req, res)=> {
    // const sql = `SELECT * FROM products JOIN product_categories ON products.category = product_categories.sid WHERE on_sale = 1`;
    const sql = `SELECT * FROM products WHERE on_sale = 1`;

    const [rows] = await db.query(sql);
    // console.log({rows});
    res.json(rows);
})

module.exports = router;