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
  uri,
} = process.env;

function createLinePayBody(order) {
  return {
    ...order,
    currency: "TWD",
    redirectUrls: {
      confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
      cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`,
    },
  };
}

function createSignature(uri, linePayBody) {
  const nonce = parseInt(new Date().getTime() / 1000);

  const encrypt = HmacSHA256(
    `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(
      linePayBody
    )}${nonce}`,
    LINEPAY_CHANNEL_SECRET_KEY
  );

  const signature = Base64.stringify(encrypt);

  const headers = {
    "Content-Type": "application/json",
    "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
    "X-LINE-Authorization-Nonce": nonce,
    "X-LINE-Authorization": signature,
  };
  return headers;
}

router.post("/createOrder", async (req, res) => {
  const output = {
    success: false,
    error: "",
    postData: req.body,
  };

  const { order, member_sid, payWay } = req.body;
  console.log(member_sid);

  const ordernum = dayjs(new Date()).format("YYYYMMDDHHmmss");

  let originTotal = 0;
  let total = 0;

  // 先撈商品金額＆資訊
  for (let i = 0; i < order.length; i++) {
    // console.log(order[i]);
    // console.log(`id: `, order[i].id);
    const data_sql = `SELECT * FROM products WHERE sid = ${order[i].id}`;
    const [result] = await db.query(data_sql);
    order[i].member_price = result[0].member_price;
    order[i].origin_subtotal = +result[0].price * order[i].quantity;
    order[i].total_subtotal = result[0].member_price * order[i].quantity;
    order[i].product_name = result[0].name;
    // console.log(order[i].product_name);
    // console.log(result[0].name);

    // 順便加總母訂單金額
    originTotal += order[i].origin_subtotal;
    total += order[i].total_subtotal;

    // 先寫入子訂單
    const details_sql = `INSERT INTO order_details (order_num, product_sid, product_name, quantity, origin_subtotal, total_subtotal) VALUES (?, ?, ?, ?, ?, ?)`;
    const [details_result] = await db.query(details_sql, [
      ordernum,
      order[i].id,
      order[i].product_name,
      order[i].quantity,
      order[i].origin_subtotal,
      order[i].total_subtotal,
    ]);
  }

  // 寫入母訂單
  const history_sql = `INSERT INTO order_history (order_num, original_total, total, member_sid, payment_sid, order_status) VALUES (?,?,?,?,?,?)`;
  const [history_result] = await db.query(history_sql, [
    ordernum,
    originTotal,
    total,
    member_sid,
    payWay,
    5,
  ]);

  // 把東西整理成 linePay 格式
  const uri = "/payments/request";

  const linePayData = {
    channel_id: LINEPAY_CHANNEL_ID,
    channel_secret: LINEPAY_CHANNEL_SECRET_KEY,
    version: LINEPAY_VERSION,
    site: LINEPAY_SITE,
  };

  const items = order.map((i) => {
    return {
      name: i.product_name,
      quantity: i.quantity,
      price: i.member_price,
    };
  });

  const linePayBody = {
    orderId: ordernum,
    amount: total,
    currency: "TWD",
    redirectUrls: {
      confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
      cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`,
    },
    packages: [
      {
        id: "1",
        amount: total,
        products: items,
      },
    ],
  };

  const headers = createSignature(uri, linePayBody);
  const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
  const { data } = await axios.post(url, linePayBody, { headers });
  console.log(data);

  if (data.returnCode === "0000") {
    output.success = true;
    output.url = data.info.paymentUrl.web;
    output.ordernum = ordernum;
  } else {
    output.error = "LinePay 請求失敗";
  }

  res.json({ output });
});

router.get("/linePayConfirm", async (req, res) => {
  const output = {
    success: false,
    error: "",
  };

  //接下來處理linepay二次請求
  //先找出此訂單的價格塞進amount
  const { transactionId, orderId } = req.query;
  const sql = `SELECT * FROM order_history WHERE order_num = "${orderId}"`;
  const [result] = await db.query(sql);

  try {
    // 建立 LINE Pay 請求規定的資料格式
    const uri = `/payments/${transactionId}/confirm`;
    const linePayBody = {
      amount: result[0].total,
      currency: "TWD",
    };

    // CreateSignature 建立加密內容
    const headers = createSignature(uri, linePayBody);

    // API 位址
    const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
    const { data } = await axios.post(url, linePayBody, { headers });

    console.log(data);
    
    if (data.returnCode === "0000") {
      const sql = `UPDATE order_history SET order_status = 1 WHERE order_num = "${orderId}"`;
      const result = await db.query(sql);
      output.success = true;
    } else {
      output.error = "LinePay訂單失敗";
    }
  } catch (err) {
    console.log(err);
  }
  res.json({ output });
});
module.exports = router;
