var mongoose = require('mongoose'),
    schema = mongoose.Schema;

//User schema
var  userSchema = new schema({

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
    level: String,
    sessID: String,
    folders: [{type: schema.Types.ObjectId, ref: 'Folder'}],
    home: {type: schema.Types.ObjectId, ref: 'Folder'}

}, { collection : 'User' });

var collectionName = 'User';

//Static methods

userSchema.statics.emailIsUnique = function(email, callback){

    this.find({email: email}, function(err, result){
        if(err){
            console.log(err);
        } else {
            
            if(result)
                callback(false);

            else
                callback(true);
        }
    });
};
        
module.exports = mongoose.model('User', userSchema, collectionName);


