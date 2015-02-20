/**
 * I hate node.js!!! Give me type safety and release me from being lost in
 * Callbacks!
 */
var cloudant;

var dbCredentials = {
        dbName : 'pricefinder'
};
var db;

var PriceFinderItem = function(name, url, pricetag, price) {
    this.name = name;
    this.url = url;
    this.pricetag = pricetag;
    this.price = price;
};

function initDBConnection(url) {
    cloudant = require('cloudant')(url);
    cloudant.db.create(dbCredentials.dbName, function(err, res) {
        if (err) {
            console.log('could not create db ', err);
        } else {
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
        pricetag : item.pricetag,
        price : item.price
    }, function(err, doc) {
        if (err) {
            console.log(err);
            response(err);
        }
        response(err);
    });
}

var loadItems = function(list, err) {
    db.list({
        include_docs : true
    }, function(err, body) {
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
    db.get(key, function(error, existing) {
        if (!error)
            obj._rev = existing._rev;
        db.insert(obj, key, callback);
    });
}

var deleteAllItems = function(callback) {
    db.list({
        include_docs : true
    }, function(err, body) {
        if (!err) {
            body.rows.forEach(function(doc) {
                console.log('deleting id: %s, rev: %s', doc.id, doc.value.rev)
                db.destroy(doc.id, doc.value.rev, function(er, body) {
                    if (er)
                        console.log('ERROR: %s', er);
                    else
                        console.log(body);
                })
            });
        }
        callback(err);
    });
}

module.exports.db = db;
module.exports.initDBConnection = initDBConnection;
module.exports.PriceFinderItem = PriceFinderItem;
module.exports.saveItem = saveItem;
module.exports.loadItems = loadItems;
module.exports.updateItemPrice = updateItemPrice;
module.exports.deleteAllItems = deleteAllItems;
