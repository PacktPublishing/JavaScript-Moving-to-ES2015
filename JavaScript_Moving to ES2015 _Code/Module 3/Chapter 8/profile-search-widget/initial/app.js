var Bacon = require("baconjs").Bacon;
var express = require("express");
var app = express();
var fs = require("fs");

app.use(express.static(__dirname + "/public"));

app.listen(8080);