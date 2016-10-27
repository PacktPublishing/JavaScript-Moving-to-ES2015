var express = require("express");
var app = express();
var Chance = require("chance"),
chance = new Chance();

app.use(express.static(__dirname + "/public"));

app.get("/getData", function(httpRequest, httpResponse, next){

	var result = [];

	for(var i = 0; i < 10; i++)
	{
		result[result.length] = {
			title: chance.sentence(),
			desc: chance.paragraph()
		}
	}

	httpResponse.send(result);
})

app.get("/*", function(httpRequest, httpResponse, next){
	httpResponse.sendFile(__dirname + "/public/html/index.html");
})

app.listen(8080); 