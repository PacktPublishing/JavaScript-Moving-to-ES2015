var seneca = require("seneca")();
var express = require("express");
var app = express();
var basicAuth = require("basic-auth");
var request = require("request");

seneca.client({port: "5020", pin: {role: "url-config"}});
seneca.client({port: "5010", pin: {role: "coupons-store"}});

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.get("/", function(httpRequest, httpResponse, next){
	if(httpRequest.query.status == "submitted") {
		seneca.act({role: "coupons-store", cmd: "list", skip: 0}, function(err, coupons){
			if(err) return httpResponse.status(500).send("An error occured");

			seneca.act({role: "url-config", cmd: "image-storage-service"}, function(err, image_url){
				if(err) return httpResponse.status(500).send("An error occured");

				if(coupons.length > 20)
				{
					var next = true;
				}
				else
				{
					var next = false;
				}

				var prev = false;

				httpResponse.render("index", {prev: prev, next: next, current: 0, coupons: coupons, image_url: image_url.value, submitted: true});
			})
		})
		
		return;
	};

	if(parseInt(httpRequest.query.current) !== undefined && httpRequest.query.next == "true")
	{
		seneca.act({role: "coupons-store", cmd: "list", skip: parseInt(httpRequest.query.current) + 20}, function(err, coupons){
			if(err) return httpResponse.status(500).send("An error occured");

			seneca.act({role: "url-config", cmd: "image-storage-service"}, function(err, image_url){
				if(err) return httpResponse.status(500).send("An error occured");

				if(coupons.length > 20)
				{
					var next = true;
				}
				else
				{
					var next = false;
				}

				var prev = true;

				httpResponse.render("index", {prev: prev, next: next, current: parseInt(httpRequest.query.current) + 20, coupons: coupons, image_url: image_url.value});
			})
		})
	}
	else if(parseInt(httpRequest.query.current) != undefined && httpRequest.query.prev == "true")
	{
		seneca.act({role: "coupons-store", cmd: "list", skip: parseInt(httpRequest.query.current) - 20}, function(err, coupons){
			if(err) return httpResponse.status(500).send("An error occured");

			seneca.act({role: "url-config", cmd: "image-storage-service"}, function(err, image_url){
				if(err) return httpResponse.status(500).send("An error occured");

				if(coupons.length > 20)
				{
					var next = true;
				}
				else
				{
					var next = false;
				}

				if(parseInt(httpRequest.query.current) <= 20)
				{
					var prev = false;
				}
				else
				{
					prev = true;
				}

				httpResponse.render("index", {prev: prev, next: next, current: parseInt(httpRequest.query.current) - 20, coupons: coupons, image_url: image_url.value});
			})
		})
	}
	else
	{
		seneca.act({role: "coupons-store", cmd: "list", skip: 0}, function(err, coupons){
			if(err) return httpResponse.status(500).send("An error occured");

			seneca.act({role: "url-config", cmd: "image-storage-service"}, function(err, image_url){
				if(err) return httpResponse.status(500).send("An error occured");

				if(coupons.length > 20)
				{
					var next = true;
				}
				else
				{
					var next = false;
				}

				var prev = false;

				httpResponse.render("index", {prev: prev, next: next, current: 0, coupons: coupons, image_url: image_url.value});
			})
		})
	}
});

app.get("/add", function(httpRequest, httpResponse, next){
	seneca.act({role: "url-config", cmd: "upload-service"}, function(err, response){
		if(err) return httpResponse.status(500).send("An error occured");

        httpResponse.render("add", {upload_service_url: response.value});
	})
});

var auth = function (req, res, next){
	var user = basicAuth(req);
	
	if (!user || !user.name || !user.pass) 
	{
		res.set("WWW-Authenticate", "Basic realm=Authorization Required");
		res.sendStatus(401);
	}

	//check username and password
	if (user.name === "narayan" && user.pass === "mypassword") 
	{
		next();
	} 
	else 
	{
		res.set("WWW-Authenticate", "Basic realm=Authorization Required");
		res.sendStatus(401);
	}
}

app.all("/admin/*", auth);
app.all("/admin", auth);

app.get("/admin", function(httpRequest, httpResponse, next){
	seneca.act({role: "coupons-store", cmd: "admin_list", skip: 0}, function(err, coupons){
		if(err) return httpResponse.status(500).send("An error occured");

		seneca.act({role: "url-config", cmd: "image-storage-service"}, function(err, image_url){
			httpResponse.render("admin", {coupons: coupons, image_url: image_url.value});
		});
	});
});

app.get("/admin/accept", function(httpRequest, httpResponse, next){
	seneca.act({role: "coupons-store", cmd: "verified", id: httpRequest.query.id}, function(err, verified){
		if(err) return httpResponse.status(500).send("An error occured");

		if(verified.value == true)
		{
			httpResponse.redirect("/admin");  
		}
		else
		{
			httpResponse.status(500).send("An error occured");
		}
	});
});

app.get("/admin/reject", function(httpRequest, httpResponse, next){
	seneca.act({role: "url-config", cmd: "image-storage-service"}, function(err, storage_server_url){
		if(err) return httpResponse.status(500).send("An error occured");

		request.get(storage_server_url.value + "/delete/" + httpRequest.query.thumbnail_id, function(err, resp, body){
			if(err) return httpResponse.status(500).send("An error occured");

			seneca.act({role: "coupons-store", cmd: "delete", id: httpRequest.query.id}, function(err, deleted){
				if(err) return httpResponse.status(500).send("An error occured");

				if(deleted.value == true)
				{
					console.log(storage_server_url.value + "/delete/" + httpRequest.query.id);
					httpResponse.redirect("/admin");  
				}
				else
				{
					httpResponse.status(500).send("An error occured");
				}
			});
		});	
	})
});

app.listen(8080);