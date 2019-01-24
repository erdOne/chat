// ./index.js
var { router } = require('./node/router.js');
var { createServer } = require('./node/server.js');
var { postProcessor } = require('./node/ajax.js');
var { createWSServer } = require('./node/websocket.js');

var Server = createServer(router, postProcessor);

createWSServer(Server);

process.on("end",()=>Server.close());
