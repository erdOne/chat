//./node/mysql.js

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: "localhost",
    user: "root",
    password: "root",
    database: "db"
});

async function query(sql) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, conn) {
            if (err) reject(err);
            console.log("MySQL queried with sql: " + sql);
            return conn.query(sql, function(err, result) {
                conn.release();
                if (err) reject(err);
                console.log("database returned result " + JSON.stringify(result));
                resolve(result);
            });
        });
    });
}

exports.query = query;
