var seneca = require("seneca")();
var app = require("express")();

app.use(seneca.export("web"));

seneca.client({port: "9090", pin: {role: "accountManagement"}});

app.get('/account/register', function(httpRequest, httpResponse, next){
	httpRequest.seneca.act({role: "accountManagement", cmd: "register", username: httpRequest.query.username, password: httpRequest.query.password}, function(error, response){
		if(error) return httpResponse.send(error);

		if(response.value == true)
		{
			httpResponse.send("Account has been created");
		}
		else
		{
			httpResponse.send("Seems like an account with same username already exists");
		}
	});
});

app.get('/account/login', function(httpRequest, httpResponse, next){
	httpRequest.seneca.act({role: "accountManagement", cmd: "login", username: httpRequest.query.username, password: httpRequest.query.password}, function(error, response){
		if(error) return httpResponse.send(error);

		if(response.value == true)
		{
			httpResponse.send("Logged in!!!");
		}
		else
		{
			httpResponse.send("Please check username and password");
		}
	});
});

app.listen(8080);