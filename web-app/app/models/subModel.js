var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ey = 4;
var schema = new Schema({
    name: String,
    email: String,
    activation : { type : String, default : ey },
    activated : { type : Number, default : 0 },
    invited : { type : Number, default : 0 }
}, { collection: 'subscribers' });


var collectionName = 'subscribers';

module.exports = mongoose.model('Subscriber', schema, collectionName);