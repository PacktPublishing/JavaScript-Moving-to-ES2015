var Bacon = require("baconjs").Bacon;
var express = require("express");
var app = express();

app.use(express.static(__dirname + "/public"));

app.get("/", function(httpRequest, httpResponse, next){
	httpResponse.sendFile(__dirname + "/public/html/index.html");
})

app.listen(8080); 