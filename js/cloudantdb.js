/**
 * I hate node.js!!!
 * Give me type safety and release me from being lost in Callbacks!
 */
var cloudant;

var dbCredentials = {
		dbName : 'pricefinder'
	};
var db;

var PriceFinderItem = function(name, url, price) {
	  this.name = name;
	  this.url = url;
	  this.price = price;
};

function initDBConnection() {
	if(process.env.VCAP_SERVICES) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		if(vcapServices.cloudantNoSQLDB) {
			dbCredentials.host = vcapServices.cloudantNoSQLDB[0].credentials.host;
			dbCredentials.port = vcapServices.cloudantNoSQLDB[0].credentials.port;
			dbCredentials.user = vcapServices.cloudantNoSQLDB[0].credentials.username;
			dbCredentials.password = vcapServices.cloudantNoSQLDB[0].credentials.password;
			dbCredentials.url = vcapServices.cloudantNoSQLDB[0].credentials.url;
		}
		console.log('VCAP Services: '+JSON.stringify(process.env.VCAP_SERVICES));
	}
	cloudant = require('cloudant')(dbCredentials.url);
	//check if DB exists if not create
	cloudant.db.create(dbCredentials.dbName, function (err, res) {
		if (err) { console.log('could not create db ', err); }
		else
			{
			console.log('created DB');
			}
    });
	db = cloudant.use(dbCredentials.dbName);
}

function initLocalConnection(){
	
	var url = 'https://de8fd9c9-f5fc-4d91-86ac-4947783453f0-bluemix:c1f9266c89ff1bb2893b8d33463b58a82f3be09bec47da0558f656d47c48f8a8@de8fd9c9-f5fc-4d91-86ac-4947783453f0-bluemix.cloudant.com'
	cloudant = require('cloudant')(url);
	cloudant.db.create(dbCredentials.dbName, function (err, res) {
	if (err) { console.log('could not create db ', err); }
		else
			{
			console.log('created DB');
			}
	    });
	db = cloudant.use(dbCredentials.dbName);
}

var saveItem = function(item, response) {
	
	console.log(item);
	db.insert({
		name : item.name,
		url : item.url,
		price : item.price 
	}, function(err, doc) {
		if(err) {
			console.log(err);
			response(err);
		}response(err);
	});
}

var loadItems = function(list, err){
	db.list({include_docs:true}, function(err,body){
		if (!err) {
		    var items = [];
			body.rows.forEach(function(doc) {
		      items.push(doc.doc); 
		    });
		    console.log(items);
			list(items);
		  }
	}); 
}

var updateItemPrice = function(obj, key, callback) {
	 db.get(key, function (error, existing) { 
	  if(!error) obj._rev = existing._rev;
	  db.insert(obj, key, callback);
	 });
	}

var deleteAllItems = function(callback){
	db.list({include_docs:true}, function(err,body){
		if (!err) {
		    body.rows.forEach(function(doc) {
				console.log('deleting id: %s, rev: %s', doc.id, doc.value.rev)
				db.destroy(doc.id, doc.value.rev, function(er, body){
				if (er) console.log('ERROR: %s', er);
				else console.log(body);
				}) 
		    });
		  }
     callback(err);
	}); 
}


module.exports.db = db;
module.exports.initDBConnection = initDBConnection;
module.exports.initLocalConnection = initLocalConnection;
module.exports.PriceFinderItem = PriceFinderItem;
module.exports.saveItem = saveItem;
module.exports.loadItems = loadItems;
module.exports.updateItemPrice =  updateItemPrice;
module.exports.deleteAllItems = deleteAllItems;
