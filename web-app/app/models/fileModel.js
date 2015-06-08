var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    name : String,
    userID : String,
    size : Number,
    mime : String,
    sharing : Boolean,
    type : String,
    parent : String

}, { collection : 'Files' });

var collectionName = 'Files';

module.exports = mongoose.model('Files', schema, collectionName);