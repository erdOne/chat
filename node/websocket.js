// /node/websocket.js
var WebSocketServer = require("websocket").server;
var WebSocketProcessor = require("./wsprocessor.js");
var conns = {};

function send (msg, connNo) {
    if(connNo == undefined)
        for(var i in conns) send(msg, i);
    else if(conns[connNo] && conns[connNo].connected){
        msg.no = connNo;
        console.log(`Message sent to ${connNo}`);
        conns[connNo].send(JSON.stringify(msg));
    }
}

function onMessage (msg) {
    console.log(`Websocket message recieved from ${this.data.username}: ${msg.utf8Data}`);
    WebSocketProcessor.onMessage(JSON.parse(msg.utf8Data), send);
}

function onClose (reason, description) {
    console.log(`Websocket number ${this.data.no} disconnected with reason: ${reason}.`);
    WebSocketProcessor.onClose(this.data, send, ()=>{
        delete conns[this.data.no];
    });
}

function onRequest (request) {
    var conn = request.accept(null, request.origin);

    var no;
    do no = Math.round(Math.random() * 8999 + 1000);
    while (conns[no] != undefined);
    conn.data = { no, username: request.resourceURL.query.username };

    conns[no] = conn;
    conn.on("close", onClose);
    conn.on("message", onMessage);

    WebSocketProcessor.onRequest(conn.data, send);

    console.log(`Websocket from ${conn.data.username} accepted with number ${no}.`);
}

function createWSServer (Server) {
    var WSServer = new WebSocketServer({
        httpServer: Server,
        autoAcceptConnections: false
    });

    WSServer.on("request", onRequest);
}

exports.createWSServer = createWSServer;
