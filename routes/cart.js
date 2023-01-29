const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../modules/db_connect");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dayjs = require("dayjs");

const { HmacSHA256 } = require("crypto-js");
const Base64 = require("crypto-js/enc-base64");
require("dotenv").config();

const {
  LINEPAY_CHANNEL_ID,
  LINEPAY_CHANNEL_SECRET_KEY,
  LINEPAY_VERSION,
  LINEPAY_SITE,
  LINEPAY_RETURN_HOST,
  LINEPAY_RETURN_CONFIRM_URL,
  LINEPAY_RETURN_CANCEL_URL,
} = process.env;

router.post("/createOrder", async (req, res) => {
  const output = {
    success: false,
    error: "",
    postData: req.body,
  };

  const { order, member_sid, payWay } = req.body;

  const ordernum = dayjs(new Date()).format("YYYYMMDDHHmmss");

  let originTotal = 0;
  let total = 0;

  // 先撈商品金額＆資訊
  for(let i = 0; i < order.length; i++) {
    const data_sql = `SELECT * FROM products WHERE sid = ${order[i].id}`;
    const [result] = await db.query(data_sql);
    order[i].originalPrice = +result[0].price;
    order[i].price = order[i].member_price;
    order[i].name = result[0].name;

  }

  // 先寫入子訂單，順便加總金額
  for (let i = 0; i < order.length; i++) {
    const data_sql = `SELECT * FROM orders WHERE order_id = ${order[i].id}`;
    const [result] = await db.query(data_sql);
    order[i].price = +result[0].price;
    order[i].name = result[0].name;

    const details_sql = `INSERT INTO order_details (order_num, product_sid, product_name, quantity, origin_price, total_price) VALUES ()`;


  }
});

module.exports = router;
