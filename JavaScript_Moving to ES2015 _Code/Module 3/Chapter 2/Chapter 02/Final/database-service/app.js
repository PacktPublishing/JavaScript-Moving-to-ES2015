var seneca = require("seneca")();

seneca.use("mongo-store", {
  name: "gocoupons",
  host: "127.0.0.1",
  port: 27017
});

seneca.add({role: "coupons-store", cmd: "add"}, function(args, respond){
	var coupons = seneca.make$("coupons");
	var data = coupons.data$({title: args.title, desc: args.desc, email: args.email, url: args.url, price: args.price, discount: args.discount, thumbnail_id: args.thumbnail_id, verified: false});
	data.save$(function(err, entity){
		if(err) return respond(err);
		
		respond(null, {value: true});
	});
});

seneca.add({role: "coupons-store", cmd: "list"}, function(args, respond){
	var coupons = seneca.make$("coupons");
	coupons.list$({verified: true, limit$:21, skip$: args.skip}, function (err, entity){
		if(err) return respond(err);

		respond(null, entity);
	})
});

seneca.add({role: "coupons-store", cmd: "admin_list"}, function(args, respond){
	var coupons = seneca.make$("coupons");
	coupons.list$({verified: false}, function (err, entity){
		if(err) return respond(err);

		respond(null, entity);
	})
});

seneca.add({role: "coupons-store", cmd: "verified"}, function(args, respond){
	var coupons = seneca.make$("coupons");
	var data = coupons.data$({id: args.id, verified: true});
	data.save$(function(err, entity){
		if(err) return respond(error);

		respond(null, {value: true});
	});
});

seneca.add({role: "coupons-store", cmd: "delete"}, function(args, respond){
	var coupons = seneca.make$("coupons");
	coupons.remove$({id: args.id});
	respond(null, {value: true});	
});

seneca.listen({port: "5010", pin: {role: "coupons-store"}});