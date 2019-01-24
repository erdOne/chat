// ./node/ajax
var db = require("./mysql.js");
var { createHash } = require("crypto");

var sha256 = msg => createHash("sha256").update(msg).digest("hex");

async function postProcessor(data, send){
    console.log(`Recieved post data: ${JSON.stringify(data)}`);
    var msg = { request: data.request };
    try {
        switch(data.request){
            case "new user":
                var result = await db.query(`SELECT * FROM users WHERE username = '${data.username}';`);
                if(result && result[0]) throw "username taken";
                var uid = Math.random().toString(36).substr(2,6);
                await db.query(`INSERT INTO users (username, password, uid)
                    VALUES ('${data.username}', '${sha256(data.password)}', '${uid}');`);
                msg.uid = uid;
                break;
            case "login":
                var result = await db.query(`SELECT * FROM users WHERE username = '${data.username}';`);
                if(!result || !result[0]) throw "no such user";
                if(result[0].password != sha256(data.password)) throw "wrong password";
                msg.uid = result[0].uid;
                break;
            case "get user":
                var result = await db.query(`SELECT * FROM users WHERE uid = '${data.uid}';`);
                if(!result || !result[0]) throw "no such user";
                msg.username = result[0].username;
                break;
        }
    } catch (err) {
        console.log(`An error occurred: ${err}`);
        msg.error = err;
    }
    send(200, JSON.stringify(msg), "application/json");
}

exports.postProcessor = postProcessor;
