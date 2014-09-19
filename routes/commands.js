var express = require('express');
var router = express.Router();
var Prices = require('../js/database.js');
var request = require("request");
var cheerio = require("cheerio");
var async = require("async");
var twilio = require("twilio");

//invoked for any requests passed to this router
router.use(function(req, res, next) {
  // .. some logic here .. like any other middleware
  if (req.dberror)
    return res.redirect("/views/currentPriceError.html");
  else
    next();
});


//add an item to the watch list
router.get('/additem', function(req, res) {
  var name = req.query.Name;
  var url = req.query.Url;
  var item = new Prices({_id:name, url:url, idtag:"price"});
  item.save(function (err) {
    if (err){	
      console.log('Error item ', err);
      res.send(err);
    }
    else {	
      console.log('OK saving item ', item);
      res.send("done");
    }  
  });	
});

//get all items
router.get('/getitems', function(req, res) {
  Prices.find(function(err, items){
    res.send(items); 
  });
});

//lookup prices
router.get('/getprices', function(req, res) {
  Prices.find(function(err, items){
    var someError = false;
    async.eachSeries(items, function( item, cb) {
      request({
        uri: item.url,
      }, function(error, response, body) {
        if (!error){
          var $ = cheerio.load(body);
          var price = $('#price').text();
          if (price) {
            item.price = price;
            item.save(function (err) {
              if (err){ 
                console.log('Error item ', err);
                someError = true;
                cb();
              }
              else {
                console.log("saved price");
                cb();
              }
            });
          }
          else {
            console.log("no price tag");
            someError = true;
            cb();
          }
        }
        else {
          console.log("failed loading url");
          someError = true;
          cb();
        }
      });
    }, function(err){
      if (someError)
        return res.redirect("/views/currentPriceError.html");
      else {
        var client = new twilio.RestClient(req.twilioSid, req.twilioToken);
        
        client.sendMessage({
            to:'number',
            from:'number',
            body:'congrats, prices were updated'
        }, function(err, message) {
          if (err)
            console.log('error sending message');
          else
            console.log('Message sent! ID: '+message.sid);
        });
        return res.redirect("/views/currentPrice.html");
      }
    });
  });
});

module.exports = router;