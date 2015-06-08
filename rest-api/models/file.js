var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    name: String,
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    size: Number,
    mime: String,
    path: String,
    sharing: Boolean,
    type: String,
    icon: String,
    folder: {
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    }

}, { collection : 'File' });

var collectionName = 'File';

module.exports = mongoose.model('File', schema, collectionName);
