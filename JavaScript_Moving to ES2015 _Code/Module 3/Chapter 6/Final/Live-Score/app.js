var express = require("express");  
var app = express();  
var server = require("http").createServer(app);  
var io = require("socket.io")(server, {path: "/socket-io"});

server.listen(8080); 

app.use(express.static(__dirname + "/public"));

app.get("/", function(httpRequest, httpResponse, next){
	httpResponse.sendFile(__dirname + "/public/html/index.html");
})

var basicAuth = require("basic-auth");

function uniqueNumber() {
    var date = Date.now();
    
    if (date <= uniqueNumber.previous) {
        date = ++uniqueNumber.previous;
    } else {
        uniqueNumber.previous = date;
    }

    return date;
}

uniqueNumber.previous = 0;

var authenticated_users = {};

var auth = function (req, res, next){
	var user = basicAuth(req);

	if(!user || user.name !== "admin" || user.pass !== "admin")
	{
		res.statusCode = 401;
	    res.setHeader("WWW-Authenticate", "Basic realm='Authorization Required'");
	    res.end("Access denied");
	}
	else
	{
		var id = uniqueNumber();
		authenticated_users[id] = id;
		res.cookie("authentication_id", id);
		next();
	}
}

app.get("/admin", auth, function(httpRequest, httpResponse, next){
	httpResponse.sendFile(__dirname + "/public/html/admin.html");
})

var cookieParser = require("socket.io-cookie");

var admin = io.of("/admin");

admin.use(cookieParser);

admin.use(function(socket, next) {
	if(socket.request.headers.cookie.authentication_id in authenticated_users)
	{
		next();
	}
	else
	{
		next(new Error("Authentication required"));
	}
});

admin.on("connection", function(socket){
	socket.on("message", function(message){
  		io.send(message);
    });
})

