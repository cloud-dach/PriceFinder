//required modules
var express = require("express");
var mongoose = require('mongoose');

//create application
var app = express();

//get the core cfenv application environment
var cfenv = null;
try { 
  cfenv = require('cfenv');
}
catch(err) {
}
var mongo = ""
  var port = 3000;
var host = "localhost";
if (cfenv) {
  var appEnv = cfenv.getAppEnv();

  //  setup database
  if (appEnv.services && appEnv.services['mongolab']) {
    var mongoService = appEnv.services['mongolab'][0];
    console.log(mongoService);
    if (mongoService) {
      var mongo = mongoService.credentials;
    }
  }

  port = appEnv.port;
  host = appEnv.host;
}

//connect to database
if (mongo == "") { 
  mongo = {
      "username" : "user1",
      "password" : "secret",
      "uri" : "mongodb://localhost:27017/pricefinder"
  };
}
mongoose.connect(mongo.uri, function(err) {
  if (err) {
    console.log("connect to mongodb failed");
  };
});

//application context
var commands = require('./routes/commands');
app.use(express.static(__dirname + '/public'));
app.use('/commands', commands);

//ready to go
app.listen(port);
console.log("Server listening on port " + port);