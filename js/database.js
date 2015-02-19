//mongoose driver
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create schema for items
var PriceSchema = new Schema({
    _id : String,
    url : String,
    price : Number,
    idtag : String
});

module.exports = mongoose.model('Prices', PriceSchema);