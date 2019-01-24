// ./node/server.js
var http = require("http");
var url = require('url');
var qs = require('querystring');
getByteLen = val => Buffer.byteLength(String(val), 'utf8');

function createServer(route, processPost){
    function processor(request, response) {
        function sender(status, msg, type = "text/plain", header = {}){
            response.writeHead(status,{
                "Content-Length": getByteLen(msg),
                "Content-Type" : type,
                ...header
            });
            response.write(msg, "utf-8");
            response.end();
        }

        var path = url.parse(request.url, true);
        if (path.pathname == "/ajax") {
            var data = ""
            request.on("data", chunk => data += chunk);
            request.on("end", () => processPost(qs.parse(data), sender));
        } else {
            console.log(`Request for ${path.pathname} recieved.`);
            route(path.pathname, sender);
        }
    }

    var Server = http.createServer(processor);
    Server.listen(7122);

    return Server;
}

exports.createServer = createServer;
