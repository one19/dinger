var express = require('express');
var request = require('request');
var sfx = require('sfx');
var redis = require('redis');

var port = process.env.PORT || 3000;
var redisURL = process.env.REDIS_URL;
var token = process.env.TOKEN;
var key = process.env.KEY;

var app = express();
var publisherClient = redis.createClient(redisURL, {no_ready_check: true});
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

request
  .get("https://api.trello.com/1/tokens/" + token
    + "/webhooks/?key="+ key, function (error, res, body) {
      if (error) console.log("Error1: ", error);
      if (JSON.parse(body).length <= 1) {
      request
        .post(
        {
          url: "https://api.trello.com/1/webhooks?key=" + key + "&token=" + token,
          formData: {
              description: "Listen for cards webhook.",
              callbackURL: "http://dcding.herokuapp.com/card",
              idModel: "56aad7ebfe2e61b85876235f"
          },
          headers: {
            'Content-Type': "application/x-www-form-urlencoded"
          }
        },
        function(error, res, body) {
          if (error) console.log("Error2: ", error);
          console.log("Yay response: ", body);
        });
      }
  });

app.post('/card', function (req, res) {
  publisherClient.publish( 'updates', ('"' + JSON.stringify(res) + '" card made') );
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('All clients have received "' + req.params + '"');
  res.end();
});

app.get('/update-stream', function(req, res) {
  // let request last as long as possible, roughly 24 days
  req.socket.setTimeout(0x7FFFFFFF);

  var messageCount = 0;
  var subscriber = redis.createClient(redisURL, {no_ready_check: true});

  subscriber.subscribe("updates");

  // In case we encounter an error...print it out to the console
  subscriber.on("error", function(err) {
    console.log("Redis Error: " + err);
  });

  // When we receive a message from the redis connection
  subscriber.on("message", function(channel, message) {
    messageCount++; // Increment our message count

    res.write('id: ' + messageCount + '\n');
    res.write("data: " + message + '\n\n'); // Note the extra newline
  });

  //send headers for event-stream connection
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  // The 'close' event is fired when a user closes their browser window.
  // In that situation we want to make sure our redis channel subscription
  // is properly shut down to prevent memory leaks...and incorrect subscriber
  // counts to the channel.
  req.on("close", function() {
    subscriber.unsubscribe();
    subscriber.quit();
  });
});

app.get(['/', '/card'], function (req, res) {
  res.render('index');
});

var server = app.listen(port, function() {
  console.log('Server running at http://localhost:' + port)
});