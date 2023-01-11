require('dotenv').config();
const express = require('express');
const app = express();
const db = require(__dirname + '/modules/db_connect');

// 解析 body
const myParser = require('body-parser');

app.use(myParser.json());
app.use(myParser.urlencoded({ extend: false}));

//白名單

//靜態資料夾
app.use(express.static('public'));

// router
// 首頁
app.get('/', (req, res) => {
    res.send('寵物商城！');
})

// 其他路由
app.use('/member', require(__dirname + '/routes/member'))

// 404
app.use((req, res) => {
    res.status(404).send('<h3>找不到這個頁面！</h3>')
})

// port num
const port = process.env.SERVER_PORT;
app.listen(port, ()=> {
    console.log(`server started, server port: ${port}`);
})