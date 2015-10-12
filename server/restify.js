var restify = require('restify');
var mongoose = require('mongoose/');

mongoose.connect('mongodb://localhost:27017/test'); // connect to our database

var Bear = require('./bear');

var server = restify.createServer();

server.use(restify.bodyParser());

server.get('/',
    function (req, res) {
      Bear.find(function (err, bears) {
        if (err)
          res.send(err);

        res.send(bears);
      });
    }
);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});