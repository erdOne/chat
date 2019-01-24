// /node/wsprocesser.js

function onMessage (msg, send) {
    try {
        switch(msg.request){
            case "join":
                break;
            case "message":
                send({
                    request: "message",
                    username: msg.username,
                    timestamp: new Date(),
                    content: msg.content
                });
                break;
        }
    } catch (err) {
        console.log(`An error occurred: ${err}`);
    }
}

function onClose (user, send, callback) {
    send({
        request: "leave",
        username: user.username
    });
    callback();
}

function onRequest (user, send) {
    send({
        request: "join",
        username: user.username
    });
}

exports.onMessage = onMessage;
exports.onClose = onClose;
exports.onRequest = onRequest;
