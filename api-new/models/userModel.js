var mongoose = require('mongoose'),
    schema = mongoose.Schema,
    bcrypt = require('bcryptjs');

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
    activated: Boolean,
    aCode: String,
    sessID: String,
    sharedFiles:[{type: schema.Types.ObjectId, ref: 'File'}],
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
        
userSchema.statics.login = function(credentials, callback){

    var c = credentials;
    


    this.find({email: c.email}, function(err, user){
        
        if(err){
            console.log(err);
        }else{
        
            if(user){
                
                //Match password with encrypted pass
                if(bcrypt.compareSync(c.pass, user.password)){
                    
                    this.findOne({
                        _id: user._id
                    }).populate('folders');
                }
            }else{
                return res.status(400).json({message: 'Incorrect credentials'});
            }
        }
    });

};
module.exports = mongoose.model('User', userSchema, collectionName);

