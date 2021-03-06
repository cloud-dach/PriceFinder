
//required modules
var express = require("express");
//create application
var app = express();
var cloudantSvcName= 'cloudantNoSQLDB';

//get the core cfenv application environment
var cfenv = null;
try { 
  cfenv = require('cfenv');
}
catch(err) {
    console.log('No CF Environment running locally!');
}

var db = require('./js/cloudantdb.js');

var port = 3000;
var host = "localhost";

var twilioSid = "";
var twilioToken = "";

if (cfenv) {
  var appEnv = cfenv.getAppEnv();
  //  setup database
  if (appEnv.services && appEnv.services[cloudantSvcName]) {
      
      var service = appEnv.services[cloudantSvcName];
      var url = service[0].credentials.url;
      console.log(url);
      // remove the following comment to enable Cloudant connection on Bluemix 
      //db.initDBConnection(url);
  }
  else
  {
      console.log('No Cloudant Service in Env ' + cloudantSvcName);
      console.log('You must bind Cloudant Service to that application on Bluemix!');
  }
  
  // twilio
  if (appEnv.services && appEnv.services['user-provided']) {
    var userProvided = appEnv.services['user-provided'];
    userProvided.forEach(function(service) {
      if (service.name.indexOf('Twilio') == 0) {
        twilioSid = service.credentials.accountSID;
        twilioToken = service.credentials.authToken;
        console.log(twilioSid);
      }
    });
  }

  port = appEnv.port;
  host = appEnv.host;
}
else
{
    console.log('Try direct connection to Cloudant DB');
    var url = 'https://your bluemix Cloudant URL';
    db.initDBConnection(url);	
}

//Make some objects accessible to our router
app.use(function(req,res,next){
  //req.dberror = dberror;
  req.twilioSid = twilioSid;
  req.twilioToken = twilioToken;
  req.db = db;
  next();
});

//application context
var commands = require('./routes/commands');
app.use(express.static(__dirname + '/public'));
app.use('/commands', commands);

//ready to go
app.listen(port);
console.log("Server listening on port " + port);