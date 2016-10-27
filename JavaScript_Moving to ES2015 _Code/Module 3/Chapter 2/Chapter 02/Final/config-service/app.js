var seneca = require("seneca")();

seneca.add({role: "url-config", cmd: "upload-service"}, function(args, respond){
	respond(null, {value: "http://localhost:9090"});
});

seneca.add({role: "url-config", cmd: "monolithic-core"}, function(args, respond){
	respond(null, {value: "http://localhost:8080"});
});

seneca.add({role: "url-config", cmd: "image-storage-service"}, function(args, respond){
	respond(null, {value: "http://localhost:7070"});
});

seneca.listen({port: "5020", pin: {role: "url-config"}});