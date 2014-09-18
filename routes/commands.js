var express = require('express');
var router = express.Router();
var Prices = require('../js/database.js');
var request = require("request");
var cheerio = require("cheerio");

//invoked for any requests passed to this router
router.use(function(req, res, next) {
  // .. some logic here .. like any other middleware
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
    for(i=0; i<items.length; i++){
      var last = (i===items.length-1);
      request({
        uri: items[i].url,
      }, function(error, response, body) {
        if (!error){
          var $ = cheerio.load(body);
          var price = $('#price').text();
          if (price) {
            this.item.price = price;
            this.item.save(function (err) {
              if (err){	
                console.log('Error item ', err);
              }
            });	
          }
          if (this.finish === true) {
            return res.redirect("/views/currentPrice.html");
          }
        }
      }.bind({item:items[i], finish:last}));
    }
  });
});

module.exports = router;