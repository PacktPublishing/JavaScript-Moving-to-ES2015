var Server = require("socket.io");
var io = new Server({path: "/websocket"});

io.listen(3000);

io.on("connection", function(socket){

    socket.send("Hi, from server");

    socket.on("message", function(message){
      console.log(message);
    });
    
    socket.on("disconnect", function(){ 
      console.log("User Disconnected");
    });

    socket.on("custom-event", function (parameter1, parameter2) {
      console.log(parameter1, parameter2);
    });

    socket.emit("custom-event", "parameter1", "parameter2");

    socket.broadcast.send("A new user have joined");

    console.log(socket.id);

    socket.join("my-custom-room");

    socket.broadcast.to("my-custom-room").send("Hi everyone. I just joined this group");
});

io.origins("localhost:8080");

var nsp = io.of("/custom-namespace");

nsp.on("connection", function(socket){
    socket.send("Hi, from custom-namespace");

    socket.on("message", function(message){
      console.log(message);
    });
    
    socket.on("disconnect", function(){ 
      console.log("User Disconnected");
    });

    socket.on("custom-event", function (parameter1, parameter2) {
      console.log(parameter1, parameter2);
    });

    socket.emit("custom-event", "parameter1", "parameter2");

    console.log(socket.id);

    socket.join("my-custom-room");

    socket.broadcast.to("my-custom-room").send("Hi everyone. I just joined this group");
});

setInterval(function(){
  //sending message and custom-event-2 to all clients of default namespace
  io.emit("custom-event-2");
  io.send("Hello Everyone. What's up!!!");

  //sending message and custom-event-2 to all clients of /custom-namespace namespace
  nsp.emit("custom-event-2");
  nsp.send("Hello Everyone. What's up!!!");
}, 5000)

setInterval(function(){
    //sending message and custom-event-3 to all clients in my-custom-room room of default namespace
    io.to("my-custom-room").send("Hello to everyone in this group");
    io.to("my-custom-room").emit("custom-event-3");

    ///sending message and custom-event-3 to all clients in my-custom-room room of /custom-namespace namespace
    nsp.to("my-custom-room").send("Hello to everyone in this group");
    nsp.to("my-custom-room").emit("custom-event-3");
}, 5000)

io.use(function(socket, next) {  
  //request object
  //socket.request
  
  //to reject
  //next(new Error("Reason for reject"));
  
  //to continue
  next();
});