const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../modules/db_connect");

router.get("/list/api", async (req, res) => {
  const { prodCate, page } = req.query;

  // 分頁參數設定
  const perPage = 20;
  let nowPage = +page || 1;
  let totalPages = 0;

  // 產品分類條件
  let where = `WHERE on_sale = 1 `;
  where += +prodCate ? `&& pc.parent_sid =${prodCate}` : "";

  // 總共筆數&頁數
  const sql_count = `SELECT COUNT(1) count FROM products p JOIN product_categories pc ON p.category = pc.sid ${where}`;
  // const sql_count = `SELECT COUNT(1) count FROM products p JOIN product_categories pc ON p.category = pc.sid WHERE on_sale = 1 && pc.parent_sid = 1`;
  const [[{ count }]] = await db.query(sql_count);
  if (count > 0) totalPages = Math.ceil(count / perPage);
  // console.log(count);

  // 每頁內容
  const sql_data = `SELECT p.* FROM products p JOIN product_categories pc ON p.category = pc.sid WHERE on_sale = 1 ${where} LIMIT ${
    perPage * (nowPage - 1)
  } ,${perPage}`;

  const [rows] = await db.query(sql_data);
  // console.log({rows});
  res.json({ rows, count, totalPages }); 
});

module.exports = router;
