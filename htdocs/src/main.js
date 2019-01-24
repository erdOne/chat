function showLoginModal() {
    console.log("login")
    $("#loginModal").modal({
        closable: false,
        selector: {
            approve: "#loginBtn",
            deny: "#toSignupBtn"
        },
        onOpen: function() {
            $("#loginModal .label").addClass("hidden");
        },
        onApprove: function() {
            // login
            $("#loginModal .label").addClass("hidden");
            var username = $("#login_username").val()
            $.post("/ajax", {
                request: "login",
                username,
                password: $("#login_password").val()
            }, response => {
                if (response.error) {
                    if (response.error == "no such user")
                        $("#loginModal .username.label").removeClass("hidden");
                    else if (response.error == "wrong password")
                        $("#loginModal .password.label").removeClass("hidden");
                } else {
                    Cookies.set("uid", response.uid);
                    $("#loginModal").modal("hide");
                    startService(username);
                }
            });
            return false;
        },
        onDeny: function() {
            showSignupModal();
            return true;
        }
    }).modal("show");
}

function showSignupModal() {
    $("#signupModal").modal({
        closable: false,
        selector: {
            approve: "#signupBtn",
            deny: "#toLoginBtn"
        },
        onOpen: function() {
            $("#signupModal .label").addClass("hidden");
        },
        onApprove: function() {
            // sign up
            if ($("#signup_password").val() != $("#confirm_password").val()) {
                $("#signupModal .password.label").removeClass("hidden");
                return false;
            }
            var username = $("#signup_username").val();
            $.post("/ajax", {
                request: "new user",
                username,
                password: $("#signup_password").val()
            }, response => {
                if (response.error) {
                    console.log(response.error, response.error == "username taken")
                    if (response.error == "username taken")
                        $("#signupModal .username.label").removeClass("hidden");
                } else {
                    Cookies.set("uid", response.uid);
                    $("#signupModal").modal("hide");
                    startService(username);
                }
            });
            return false;
        },
        onDeny: function() {
            showLoginModal();
            return true;
        }
    }).modal("show");
}


function display(timestamp) {
    var now = new Date();
    var str = ""
    if(now.getFullYear() != timestamp.getFullYear())
        str += `${timestamp.getFullYear()} `;
    if(now.getUTCMonth() != timestamp.getUTCMonth()
        || now.getUTCDate() != timestamp.getUTCDate())
        str += `${now.getUTCMonth()}/${now.getUTCDate()} `;
    return str+timestamp.toTimeString().substr(0,5)
}

{
    let scrollable = true;
    function setScrollable(x){ scrollable = x; }
    function scroll(){
        if(!scrollable)return;
        $("#msgDiv").each((no,el)=>el.scrollTop = el.scrollHeight - el.clientHeight);
    }
}

function startService (username) {
    if (username == undefined) return init();
    var wsconn = new WebSocket(`ws://220.132.13.65:7122?username=${username}`);

    wsconn.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        console.log(msg);
        try {
            switch (msg.request) {
                case "message":
                    var $el = $(`<div class="message">
                        <div class="ui ${msg.username == username?"right":"left"} floated compact segment">
                            ${msg.username == username?"":`<div class="author"></div>`}
                            <div class="text"><p></p></div>
                        </div>
                    </div>`)
                    .appendTo("#msgDiv")
                    .popup({
                        content: "",
                        exclusive: true,
                        onShow: function(el){
                            this.html(display(new Date(msg.timestamp)));
                        }
                    });
                    $el.find(".author").text(msg.username);
                    $el.find(".text p").text(msg.content);
                    scroll();
                    break;
                case "join":
                    $(`<div class="ui compact system message">
                        <p><span></span> has joined the chat</p>
                    </div>`)
                    .appendTo("#msgDiv")
                    .find("span").text(msg.username);
                    scroll();
                    break;
                case "leave":
                    $(`<div class="ui compact system message">
                        <p><span></span> has left the chat</p>
                    </div>`)
                    .appendTo("#msgDiv")
                    .find("span").text(msg.username);
                    scroll();
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    };

    $("#sendBtn").click(function() {
        var content = $("#msgInput").val();
        $("#msgInput").val("");
        if (content) {
            wsconn.send(JSON.stringify({
                request: "message",
                username,
                content
            }))
        }
    });
    $("#msgInput").keydown(function(event) {
        if(event.keyCode == 13)
            $("#sendBtn").click();
    });

    $("#logoutBtn").click(function(){
        Cookies.remove("uid");
        wsconn.close();
        $("#sendBtn").off("click");
        $("#msgInput").off("keydown");
        $("#msgDiv").html("");
        init();
    })
}

function init() {
    new Promise(resolve => {
        if (Cookies.get("uid")) {
            $.post("/ajax", {
                request: "get user",
                uid: Cookies.get("uid")
            }, response => {
                if (response.error) {
                    Cookies.remove("uid");
                    resolve("");
                } else {
                    resolve(response.username);
                }
            })
        } else resolve("");
    }).then(username => {
        if (username == "") {
            showLoginModal();
        } else {
            startService(username);
        }
    });
}

$(init);
