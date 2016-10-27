var socket = io("http://localhost:8080/admin", {path: "/socket-io"});

document.getElementById("submit-button").addEventListener("click", function(){
	var team1_name = document.getElementById("team1-name").value;
	var team2_name = document.getElementById("team2-name").value;
	var team1_goals = document.getElementById("team1-goals").value;
	var team2_goals = document.getElementById("team2-goals").value;
	var desc = document.getElementById("desc").value;

	if(team1_goals == "" || team2_goals == "" || team1_name == "" || team2_name == "")
	{
		alert("Please enter all details");
	}

	socket.send({team1_name: team1_name, team2_name: team2_name, team1_goals: team1_goals, team2_goals: team2_goals, desc: desc});
}, false)