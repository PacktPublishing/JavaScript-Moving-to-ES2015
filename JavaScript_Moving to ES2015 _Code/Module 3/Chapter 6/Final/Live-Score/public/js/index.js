var socket = io("http://localhost:8080", {path: "/socket-io"});

socket.on("connect", function () {
	socket.on("message", function (msg) {
    	document.getElementById("messages").innerHTML = "<li><div><h4>" + msg.team1_name + "(" + msg.team1_goals + ") : " + msg.team2_name + "(" + msg.team2_goals + ")" + "</h4><p>" + msg.desc + "</p></div></li>" + document.getElementById("messages").innerHTML; 
    });
});