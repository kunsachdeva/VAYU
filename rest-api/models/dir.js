var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

var schema = new Schema({
    name: String,
    userID: String,
    size: Number,
    mime: String,
    path: String,
    sharing: Boolean,
    type: String,
    parent: String

}, { collection : 'Dir' });

var collectionName = 'Dir';

module.exports = mongoose.model('Dir', schema, collectionName);