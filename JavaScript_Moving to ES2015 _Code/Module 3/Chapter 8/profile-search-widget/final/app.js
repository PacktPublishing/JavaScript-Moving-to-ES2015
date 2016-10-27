var Bacon = require("baconjs").Bacon;
var express = require("express");
var app = express();
var fs = require("fs");

app.use(express.static(__dirname + "/public"));

app.listen(8080);

function route_eventstream(path) 
{
  	var bus = new Bacon.Bus();

  	app.get(path, function(req, res) {
    	bus.push({
      		req: req,
      		res: res
    	});
  	});

  	return bus;
}

var root_stream = route_eventstream("/");

root_stream.onValue(function(event){
	event.res.sendFile(__dirname + "/public/html/index.html");
})

var data = Bacon.fromNodeCallback(fs.readFile, "data.json", "utf8").map(function(event){
	return JSON.parse(event);
}).toProperty();

function findMatchingCompanyName(list, companyName)
{
  return list.filter(function(value){
    return companyName != "" && value.company.toLowerCase().indexOf(companyName.toLowerCase()) == 0;
  })
}

var company_dropdown_list_stream = route_eventstream("/company/dropdown");

var company_dropdown_list_data_stream = Bacon.combineAsArray([data, company_dropdown_list_stream]).map(function(event){
  return findMatchingCompanyName(event[0], event[1].req.query.companyName);
}).toEventStream();

Bacon.zipAsArray(company_dropdown_list_stream, company_dropdown_list_data_stream).onValues(function(event1, event2) {
  event1.res.send(event2);
});

function findMatchingProfilesForEmail(list, email)
{
  return list.filter(function(value){
    return value.email == email;
  })
}

function findMatchingProfiles(list, firstName, lastName, gender, skill, company, dob, address)
{
  var firstName_matches = list.filter(function(value){
    return firstName == "" || value.first_name.toLowerCase() == firstName.toLowerCase();
  })

  var lastName_matches = firstName_matches.filter(function(value){
    return lastName == "" || value.last_name.toLowerCase() == lastName.toLowerCase();
  })

  var gender_matches = lastName_matches.filter(function(value){
    return gender == "" || value.gender.toLowerCase() == gender.toLowerCase();
  })

  var skill_matches = gender_matches.filter(function(value){
    return skill == "" || value.skill.toLowerCase() == skill.toLowerCase();
  }) 

  var company_matches = skill_matches.filter(function(value){
    return company == "" || value.company.toLowerCase() == company.toLowerCase();
  })

  var dob_matches = company_matches.filter(function(value){
    return dob == "" || value.dob == dob;
  }) 

  var address_matches = dob_matches.filter(function(value){
    return address == "" || value.address.toLowerCase() == address.toLowerCase();
  })   

  return address_matches;
}

var profile_search_stream = route_eventstream("/search");

var profile_search_data_stream_for_email = Bacon.combineAsArray([data, profile_search_stream.filter(function(event){
  return event.req.query.email != "";
})]).map(function(event){
  return findMatchingProfilesForEmail(event[0], event[1].req.query.email);
}).toEventStream();

var profile_search_data_stream_for_others = Bacon.combineAsArray([data, profile_search_stream.filter(function(event){
  return event.req.query.email == "";
})]).map(function(event){
  return findMatchingProfiles(event[0], event[1].req.query.firstName, event[1].req.query.lastName, event[1].req.query.gender, event[1].req.query.skill, event[1].req.query.company, event[1].req.query.dob, event[1].req.query.address);
}).toEventStream();

Bacon.zipAsArray(profile_search_stream, Bacon.mergeAll([profile_search_data_stream_for_email, profile_search_data_stream_for_others])).onValues(function(event1, event2) {
  event1.res.send(event2);
});
