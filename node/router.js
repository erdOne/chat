// ./node/router.js
var fs = require("fs");
var mime = require("mime");

async function router(path, send){
    var msg = "jizz";
    fs.readFile("./htdocs" + path, function (error, data) {
        if (error) {
            console.log(`404 ${error}`);
            send(404,"Oops this page doesn't exist - 404");
        } else {
            var extension = path.substr(1+path.lastIndexOf("."));
            var type = mime.getType(extension) || "text/plain";
            send(200, data, {"Content-Type": type});
        }
    });
}

exports.router = router;
