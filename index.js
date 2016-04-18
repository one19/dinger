var express = require('express');
var request = require('request');
var sfx = require('sfx');

var app = express();
var token = process.env.TOKEN;
var key = process.env.KEY;
console.log('key',key, 'token',token)

request
  .get("https://api.trello.com/1/tokens/" + token
    + "/webhooks/?key="+ key, function (error, res, body) {
      if (error) console.log("Error1: ", error);
      if (JSON.parse(body).length === 0) {
      request
        .post(
        {
          url: "https://api.trello.com/1/webhooks?key=" + key + "&token=" + token,
          formData: {
              description: "Listen for cards webhook.",
              callbackURL: "http://www.dcding.heroku.com/card",
              idModel: "56aad7ebfe2e61b85876235f"
          },
          headers: {
            'Content-Type': "application/x-www-form-urlencoded"
          }
        },
        function(error, res, body) {
          if (error) console.log("Error2: ", error);
          console.log("Yay response: ", res);
        });
      }
  });

app.post('/card', function (req, res) {
  sfx.play("Submarine");
  res.send(200)
});

app.get('/', function (req, res) {
  res.send(200)
});

var server = app.listen(3002, function() {
  console.log('Server running at http://localhost:' + server.address().port)
});