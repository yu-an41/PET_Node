const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../modules/db_connect");

router.get("/list/api", async (req, res) => {
  const { prodCate } = req.query;
  const where = +prodCate ? `&& pc.parent_sid =${prodCate}` : "";

  const sql = `SELECT p.* FROM products p JOIN product_categories pc ON p.category = pc.sid WHERE on_sale = 1 ${where}`;
  console.log(sql);

  const [rows] = await db.query(sql);
  // console.log({rows});
  res.json(rows);
});

module.exports = router;
