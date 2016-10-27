var express = require("express");
var app = express();
var request = require("request");
var parser = require("xml2json");


app.use(express.static(__dirname + "/public"));

app.get("/feed", function(httpRequest, httpResponse, next){
	request(httpRequest.query.url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	httpResponse.send(parser.toJson(body));
	  }
	})
})

app.get("/*", function(httpRequest, httpResponse, next){
	httpResponse.sendFile(__dirname + "/public/html/index.html");
})

app.listen(8080);