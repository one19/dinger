var express = require('express');
var sfx = require("sfx");

var app = express();

app.get('/', function(req, res) {
  console.log('request made: ', req)
  sfx.say("The human torch was denied a bank loan.");
  res.send(200, "ok")
});

var server = app.listen(3002, function() {
  console.log('Server running at http://localhost:' + server.address().port)
});