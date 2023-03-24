const mysql = require('mysql2');

const conn = mysql.createConnection({
    host: '182.231.203.118',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'chat'
});

conn.connect((err, res) => {
    if(err) console.log(err);
});

module.exports = conn;