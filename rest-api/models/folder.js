var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    parent: {
    	type: Schema.Types.ObjectId
    },
    files: [{
    	type: Schema.Types.ObjectId,
    	ref: 'File'
    }],
    folders: [{
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    }],
    name: String

}, { collection : 'Folder' });

var collectionName = 'Folder';

module.exports = mongoose.model('Folder', schema, collectionName);