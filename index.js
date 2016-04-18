var express = require('express');
var sfx = require("sfx");

var app = express();
var token = process.env.TOKEN;
var key = process.env.KEY;

require("jsdom").env("", function(err, window) {
  if (err) {
    console.error(err);
    return;
  }

  var $ = require("jquery")(window);

  $.get("https://api.trello.com/1/tokens/" + token
    + "/webhooks/?key="+ key).then(function(ret) {
    if (ret.length === 0) {
      $.post("https://api.trello.com/1/tokens/" + token
        + "/webhooks/?key=" + key,
        {
          description: "Listen for cards webhook.",
          callbackURL: "http://www.dcding.heroku.com/card",
          idModel: "4d5ea62fd76aa1136000000c",
        }
      );
    }
  });
});

app.post('/cards', function (req, res) {
  sfx.play("Submarine");
  res.send(200)
});

var server = app.listen(3002, function() {
  console.log('Server running at http://localhost:' + server.address().port)
});