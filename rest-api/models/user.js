var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema( {

    name: {
        first: String,
        last: String
    },
    email: String,
    password: String,
    country: String,
    phone: Number,
    storageUsed: Number,
    apiKey: String,
    resetCode: String,
    admin: Boolean,
    sessID: String,
    folders: [{type: Schema.Types.ObjectId, ref: 'Folder'}]

}, { collection : 'User' });

var collectionName = 'User';

module.exports = mongoose.model('User', schema, collectionName);
