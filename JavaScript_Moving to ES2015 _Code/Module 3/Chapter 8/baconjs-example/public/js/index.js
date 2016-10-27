var myButton_click_stream = $("#myButton").asEventStream("click").filter(function(e){
	return e.shiftKey === true;
});

myButton_click_stream.onValue(function(e){
	console.log(e);
	console.log("Button Clicked");
})

var button_click_counter = myButton_click_stream.scan(0, function(value, e){
	return ++value;
})

button_click_counter.onValue(function(value){
	console.log("Button is clicked " + value + " number of times");
})

var button_click_time = button_click_counter.scan({}, function(value, count){
	return {time: Date.now(), clicks: count};
}).map(function(value){
	var date = new Date(value.time);
	return (date).getHours() + ":" + (date).getMinutes();	
})

button_click_time.onValue(function(value){
	console.log(value);
})

var merged_property = Bacon.mergeAll([button_click_counter, button_click_time]);

merged_property.onValue(function(e){
	console.log(e);
})

var enter_key_click_stream = $("#url").asEventStream("keyup").filter(function(e){
	return e.keyCode == 13;
})

var url = enter_key_click_stream.scan("", function(value, e){
	return e.currentTarget.value;
})

var response = url.flatMap(function(value){
	try
	{
		return Bacon.retry({
			source: function(){ return Bacon.fromPromise($.ajax({url:value})); },
			retries: 5,
			isRetryable: function (error) { return error.status !== 404; },
			delay: function(context) { return 2000; }
		})
	}
	catch(e)
	{
		return new Bacon.Error(e);
	}
	
}).toProperty();

response.onValue(function(value){
	console.log(value);
})

response.onError(function(error){
	console.log("An error occured while fetching the page", error);
})

var script_start_time = Bacon.constant(Date.now()).map(function(value){
	var date = new Date(value);
	return (date).getHours() + ":" + (date).getMinutes() + ":" + (date).getSeconds();
});

script_start_time.onValue(function(value){
	console.log("This script started running at : " + value);
})

script_start_time.onEnd(function(){
	console.log("Script start time has been successfully calculated and logged");
})

var bus1 = new Bacon.Bus();

bus1.onValue(function(event){
	console.log(event);
})

bus1.push(1);
bus1.push(2);
var bus2 = new Bacon.Bus();
bus1.plug(bus2);
bus2.push(3); 
bus1.error("Unknown Error"); //pushed an Bacon.Error
bus1.end();
bus2.push(4); //this will not be pushed as bus has ended

var custom_stream = Bacon.fromBinder(function(sink) {
	sink(10);
	sink(20);
	sink(new Bacon.End()); //event stream ends here
	sink(30); //this will not be pushed
});

custom_stream.onValue(function(event){
	console.log(event);
});

var myButton_click_stream1 = $("#myButton").asEventStream("click").map(function(event){
	console.log(event);
	return event;
});

myButton_click_stream1.onValue(function(event){})




var myBus_1 = Bacon.Bus();
var myBus_2 = Bacon.Bus();

var myProperty_1 = myBus_1.map(function(event){
	console.log("Executing 1");
	return event;
}).toProperty();

var myStream_1 = myProperty_1.sampledBy(myBus_2);

myStream_1.onValue(function(event){
	console.log("Logged", event);
})

myBus_1.push(1);
myBus_1.push(2);
myBus_2.push();

var x1 = new Bacon.Bus();
var x2 = new Bacon.Bus();
var x3 = new Bacon.Bus();

Bacon.combineAsArray(x1, x2, x3).onValue(function(value){
	console.log(value);
})

x1.push(0);
x1.push(1);
x2.push(2);
x3.push(3);
x3.push(4);

var y1 = new Bacon.Bus();
var y2 = new Bacon.Bus();
var y3 = new Bacon.Bus();

Bacon.zipAsArray(y1, y2, y3).onValue(function(value){
	console.log(value);
})

y1.push(0);
y1.push(1);
y2.push(2);
y3.push(3);
y3.push(4);
x1.push(5);