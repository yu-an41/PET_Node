// 環境變數
require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./modules/db_connect');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const myParser = require('body-parser');


// 解析 body
app.use(myParser.json());
app.use(myParser.urlencoded({ extended: false}));

//白名單
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
      // console.log({ origin: origin });
    callback(null, true);
    },
  }

app.use(cors(corsOptions));

//靜態資料夾
app.use(express.static('public'));

app.use(async (req, res, next) => {
    // JWT auth
    res.locals.auth = {};
    let auth = req.get("Authorization");

    //待補上

    next();
})
// router
// 首頁
app.get('/', (req, res) => {
    res.send('寵物商城！');
})

// 其他路由
app.use('/member', require(__dirname + '/routes/member'))
app.use('/products', require(__dirname + '/routes/products'))
app.use('/cart', require(__dirname + '/routes/cart'))

// 404
app.use((req, res) => {
    res.status(404).send('<h3>找不到這個頁面！</h3>')
})

// port num
const port = process.env.SERVER_PORT;
app.listen(port, ()=> {
    console.log(`server started, server port: ${port}`);
})