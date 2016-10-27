var express = require("express");
var app = express();

app.use(express.static(__dirname + "/public"));

app.get("/", function(httpRequest, httpResponse, next){
	httpResponse.sendFile(__dirname + "/public/html/index.html");
})

var server = app.listen(8080);

var requestIp = require("request-ip");
var geoip = require("geoip-lite");

app.use("/signaling", function(httpRequest, httpResponse, next){

	var clientIp = requestIp.getClientIp(httpRequest);
	var geo = geoip.lookup(clientIp);

	if(geo != null)
	{
		if(geo.country == "IN")
		{
			next();
		}
		else
		{
			httpResponse.end();
		}
	}
	else
	{
		next();
	}
});

var ExpressPeerServer = require("peer").ExpressPeerServer(server);

app.use("/signaling", ExpressPeerServer);

var connected_users = [];

ExpressPeerServer.on("connection", function(id){
	var idx = connected_users.indexOf(id); 
  	if(idx === -1) //only add id if it's not in the array yet
  	{
  		connected_users.push(id);
  	}
});

ExpressPeerServer.on("disconnect", function(id){
	var idx = connected_users.indexOf(id); 
  	if(idx !== -1) 
  	{
  		connected_users.splice(idx, 1);
  	}

  	idx = waiting_peers.indexOf(id);
	if(idx !== -1) 
  	{
  		waiting_peers.splice(idx, 1);
  	}  	
});

var waiting_peers = [];

app.get("/find", function(httpRequest, httpResponse, next){

	var id = httpRequest.query.id;

	
	if(connected_users.indexOf(id) !== -1)
	{
		
		var idx = waiting_peers.indexOf(id); 
		if(idx === -1) 
	  	{
	  		waiting_peers.push(id);
	  	}

	  	if(waiting_peers.length > 1)
		{
			waiting_peers.splice(idx, 1);	
			var user_found = waiting_peers[0];
			waiting_peers.splice(0, 1);
	  		httpResponse.send(user_found);
		}
		else
		{
			httpResponse.status(404).send("Not found");
		}
	}
	else
	{
		httpResponse.status(404).send("Not found");
	}
})