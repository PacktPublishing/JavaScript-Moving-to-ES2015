var express = require("express");
var app = express();
var fs = require("fs");
var multipart = require("connect-multiparty")();

app.post("/store", multipart, function(httpRequest, httpResponse, next){
    var tmp_path = httpRequest.files.thumbnail.path;
    var target_path = "public/images/" + httpRequest.body.name;
    fs.rename(tmp_path, target_path, function(err) {
        if(err) return httpResponse.status(500).send("An error occured");

        httpResponse.send("Done");
    });	
});

app.get("/delete/:id", function(httpRequest, httpResponse, next){
    fs.unlink("public/images/" + httpRequest.params.id, function(err) {
    	if(err) return httpResponse.status(500).send("An error occured");

        httpResponse.send("Done");
    });
});

app.use(express.static(__dirname + "/public/images"));

app.listen(7070);