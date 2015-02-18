var express = require('express');
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var async = require("async");
var twilio = require("twilio");
var db;
//invoked for any requests passed to this router
router.use(function(req, res, next) {
  // .. some logic here .. like any other middleware
  db = req.db;
  if (req.dberror)
    return res.redirect("/views/currentPriceError.html");
  else
    next();
});


//add an item to the watch list
router.get('/additem', function(req, res) {
  var name = req.query.Name;
  var url = req.query.Url;
  var item = new db.PriceFinderItem(name,url,null);
 
 db.saveItem(item,function (err) { if (err){	
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
  db.loadItems(function(items,err){
    res.send(items); 
  });
});

//delete all items
router.get('/clearall', function(req, res) {
	db.deleteAllItems(function(err){
	res.redirect("/views/displayall.html");
  });
});

//lookup prices
router.get('/getprices', function(req, res) {
	db.loadItems(function(items,err){
    var someError = false;
    async.eachSeries(items, function( item, cb) {
      request({
        uri: item.url,
      }, function(error, response, body) {
        if (!error){
          console.log(body);	
          var $ = cheerio.load(body);
          var price = $('#price').text();
          if (price) {
            item.price = price;
            db.updateItemPrice(item, item._id, function (err, res) {
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
    	
    	  try {    		  var client = new twilio.RestClient(req.twilioSid, req.twilioToken);

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
    	  catch(err) {
    		  return res.redirect("/views/displayall.html");
    	  }
      }
    });
  });
});





module.exports = router;