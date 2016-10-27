var React = require("react");
var ReactDOMServer = require("react-dom/server");
var express = require("express");
var app = express();

var anchorWithBoldItalic = React.createClass({
    render: function() {
        return React.createElement(
            "a", 
            {href: this.props.href}, 
            React.createElement("b", {}, this.props.boldText), 
            React.createElement("i", {}, this.props.italicText)
        );
    }
});

var HelloWorld = React.createElement(anchorWithBoldItalic, {href: "#", boldText: "Hello", italicText: " World" });

app.get("/", function(httpRequest, httpResponse, next){
	var reactHtml = ReactDOMServer.renderToString(HelloWorld);
	httpResponse.send(reactHtml)
})

app.listen(8080); 

