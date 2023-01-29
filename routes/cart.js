const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../modules/db_connect");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post("linePay", async (req, res) => {
  const ordernum = dayjs(new Date()).format("YYYYMMDDHHmmss");
});

module.exports = router;
