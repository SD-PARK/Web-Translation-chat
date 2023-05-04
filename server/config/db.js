const mysql = require('mysql2');

const conn = mysql.createConnection({
    host: 'nodejs-rds.chnuv2z32zvq.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'root',
    password: 'rootroot',
    database: 'chat'
});

conn.connect((err, res) => {
    if(err) console.log(err);
});

module.exports = conn;