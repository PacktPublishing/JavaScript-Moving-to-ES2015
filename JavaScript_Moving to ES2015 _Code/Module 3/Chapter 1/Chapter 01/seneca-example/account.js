module.exports = function account(options)
{
	this.add({init: "account"}, function(pluginInfo, respond){
		
		console.log(options.message);
		
		respond();
	})

	this.add({role: "accountManagement", cmd: "login"}, function(args, respond){
		var accounts = this.make("accounts");
		console.log(args.username);
		accounts.list$({username: args.username, password: args.password}, function(error, entity){
			if(error) return respond(error);

			if(entity.length == 0)
			{
				respond(null, {value: false});
			}
			else
			{
				respond(null, {value: true});
			}
		});
	});

	this.add({role: "accountManagement", cmd: "register"}, function(args, respond){
		var accounts = this.make("accounts");

		accounts.list$({username: args.username}, function(error, entity){
			if(error) return respond(error);

			if(entity.length == 0)
			{
				var data = accounts.data$({username: args.username, password: args.password})

				data.save$(function(error, entity){
					if(error) return respond(error);

					respond(null, {value: true});
				});
			}
			else
			{
				respond(null, {value: false});
			}
		});
	});

	return "account";
}