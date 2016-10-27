var parser = require("./index.js")

function test1() {
    var test = "<test><test>nested bug</test></test>"
    var result = parser.toJson(test, {reversible: true});
    console.log(result);

    var result2 = parser.toXml(result);
    console.log(result2)
}

function test2() {
   var test = "<test>(testing)</test>";
   var result = parser.toJson(test, {reversible: true});
   console.log(result);

   var result2 = parser.toXml(result);
    console.log(result2)
}

test1();
test2();
