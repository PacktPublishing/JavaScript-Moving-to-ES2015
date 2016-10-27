var first_name_keypress_stream = $("#first-name").asEventStream("keyup");

var first_name = first_name_keypress_stream.scan("", function(value){
	return $("#first-name").val();
});

var last_name_keypress_stream = $("#last-name").asEventStream("keyup");

var last_name = last_name_keypress_stream.scan("", function(value){
	return $("#last-name").val();
});

var email_keypress_stream = $("#email").asEventStream("keyup");

var is_email_valid = email_keypress_stream.scan("", function(value){
	return $("#email").val();
}).map(function(value){
	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(value);
});

var email = Bacon.mergeAll(is_email_valid.filter(function(value){
	return value == true;
}).map(function(value){
	$("#email-error").addClass("hide");
	return $("#email").val();
}), is_email_valid.filter(function(value){
	return value == false;
}).map(function(value){
	$("#email-error").removeClass("hide");
	return "";
}))

var gender_select_stream = $("#gender").asEventStream("change");

var gender = gender_select_stream.scan("male", function(value){
	return $("#gender option:selected").val()
})

var company_keypress_stream  = $("#company").asEventStream("keyup");

var company = company_keypress_stream.scan("", function(value){
	return $("#company").val();
});

var address_keypress_stream  = $("#address").asEventStream("keyup");

var address = address_keypress_stream.scan("", function(value){
	return $("#address").val();
});

var skill_keypress_stream  = $("#skill").asEventStream("keyup");

var skill = skill_keypress_stream.scan("", function(value){
	return $("#skill").val();
});

var dob_keypress_stream  = $("#dob").asEventStream("keyup");

var dob = dob_keypress_stream.scan("", function(value){
	return $("#dob").val();
});

company.flatMap(function(event){
	return Bacon.fromPromise($.ajax({url:"/company/dropdown?companyName=" + encodeURIComponent(event)}));
}).flatMap(function(event){
	$("#companies").empty();
	return Bacon.fromArray(event);
}).onValue(function(event){
	$("#companies").append("<option value='" + event.company + "'>");
});

var search_button_click_stream = $("#search").asEventStream("click");

var search_result_request_stream = Bacon.mergeAll(Bacon.mergeAll([first_name_keypress_stream, last_name_keypress_stream, email_keypress_stream, company_keypress_stream, address_keypress_stream, skill_keypress_stream, search_button_click_stream, dob_keypress_stream]).filter(function(event){
	return event.keyCode == 13;
}), search_button_click_stream);

var search_result_request_data = Bacon.combineAsArray([first_name, last_name, email, gender, company, skill, dob, address]).sampledBy(search_result_request_stream).flatMap(function(event){
	return event;
});

var search_result_request_cancel = search_result_request_data.filter(function(event){
	return event[0] == "" && event[1] == "" && event[2] == "" && event[4] == "" && event[5] == "" && event[6] == "" && event[7] == "";
}).onValue(function(){
	$("#search-result").empty();
	alert("Enter enter some data");
});

var search_result_response = search_result_request_data.filter(function(event){
	return event[0] != "" || event[1] != "" || event[2] != "" || event[4] != "" || event[5] != "" || event[6] != "" || event[7] != "";
}).flatMap(function(event){
	return Bacon.fromPromise($.ajax({url:"/search?firstName=" + encodeURIComponent(event[0]) + "&lastName=" + encodeURIComponent(event[1]) + "&email=" + encodeURIComponent(event[2]) + "&gender=" + encodeURIComponent(event[3]) + "&company=" + encodeURIComponent(event[4]) + "&address=" + encodeURIComponent(event[7]) + "&skill=" + encodeURIComponent(event[5]) + "&dob=" + encodeURIComponent(event[6]) }));
}).toProperty();

search_result_response.onError(function(){
	$("#search-result").empty();
	alert("An error occured");
})

search_result_response.flatMap(function(value){
	$("#search-result").empty();
	return Bacon.fromArray(value);
}).onValue(function(value){
	var html = "<li>";
	html = html + "<p><b>Name: </b> <span>" + value.first_name + " " + value.last_name + "</span></p>";
	html = html + "<p><b>Email: </b> <span>" + value.email + "</span></p>";
	html = html + "<p><b>Gender: </b> <span>" + value.gender + "</span></p>";
	htmt = html + "<p><b>Company: </b> <span>" + value.company + "</span></p>";
	html = html + "<p><b>Address: </b> <span>" + value.address + "</span></p>";
	html = html + "<p><b>DOB: </b> <span>" + value.dob + "</span></p>";
	html = html + "<p><b>Skill: </b> <span>" + value.skill + "</span></p>";
	html = html + "</li>";

	$("#search-result").append(html);	
});

search_result_response.filter(function(value){
	return value.length == 0;
}).onValue(function(value){
	$("#search-result").empty();
	alert("Nothing found")
})

