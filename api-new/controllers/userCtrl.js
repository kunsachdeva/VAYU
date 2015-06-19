var userModel = require('../models/userModel.js'),
    fileModel = require('../models/fileModel.js'),
    folderModel = require('../models/folderModel.js'),
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    request = require('request'),
    bcrypt = require('bcryptjs'),
    uuid = require('node-uuid'),
    aws = require('aws-sdk'),
    s3 = new aws.S3(),
    shortId = require('shortid'),
    sendgrid = require('sendgrid'),
    auth = require('basic-auth');


exports.register = function(req, res){

    var firstName, lastName, email, country, password;

    try{

        firstName = req.body.name.first;
        lastName = req.body.name.last;
        email = req.body.email;
        country = req.body.country;
        password = req.body.password;

    }catch(err){
        return res.status(400).end();
    }

    userModel.emailIsUnique(email, function(result){
   
        //If specified email is in use
        if(result)
            return res.status(402).json({message: "Email already exists"});

        var pass = bcrypt.hashSync(password, 8);

        var user = new userModel();
        user.name.first = firstName;
        user.name.last = lastName;
        user.email = email;
        user.admin = false;
        user.storageUsed = 0;
        user.password = pass;
        user.apiKey = uuid.v4();
        
        //Save user to db
        user.save(function(err, newUser) {
            if(err)
                return res.status(500).json({mongoError: err});

            //Home folder
            var folder = new folderModel({
                user: user._id,
                name: '~'
            });
            
            //Create home folder
            folder.save(function(err, homeFolder){
                if(err)
                    return res.status(500).json({mongoError: err});
                
                //Home folder ref ID into user document
                userModel.update({_id: newUser._id},{$push:{home: homeFolder._id}}, function(err){
                    if(err)
                        return res.status(500).json({mongoError: err});
                    
                    //Create S3 bucket
                    s3.createBucket({
                        Bucket: newUser._id.toString()
                    }, function(err) {
                        if(err)
                            return res.status(500).json({awsError: err});

                        //Delete password hash and send user data to client
                        delete newUser.password;
                        
                        //retrieve user and folders
                        userModel.find({_id: newUser._id})
                            .populate('folders')
                            .exec(function(err, user){
                                res.status(200).json(user);
                            });
                    });
                });
            });
        });
    });
};

exports.login = function(req, res){

    var cred = auth(req);
    
    userModel.findOne({email: cred.name}, function(err, user) {
        if(err)
            return res.status(500).json({mongoError: err});

        if(user){
            //Compare password to hash
            if(bcrypt.compareSync(cred.pass, user.password)){
                
                //Retrieve user and populate with folder and home folder
                userModel.findOne({_id: user._id})
                    .populate('folders')
                    .populate('home')
                    .exec(function(err, result){
                        if(err)
                            return res.status(500).json({mongoError: err});
                        
                        res.status(200).json(user);
                    });
            }
        //If email does not exist
        }else{
            res.status(400).json({message: "Incorrect credentials"});
        }
    });
};

//Update profile

exports.updateProfile = function(req, res){

        var userId,
            profile = {},
            newProfile;
    try
    {
        profile.name = {first: req.body.name.first, last: req.body.name.last};
        profile.phone = req.body.phone;
        profile.coutry = req.body.country;
        userId = req.body.userId;
    }
    catch(err)
    {
        return res.status(400).end(err.toString());
    }

    userModel.findByIdAndUpdate(userId, {$set:profile}, function(err, user){
        if(err)
            return res.status(500).json({mongoError: err});
        
        //If updated
        res.status(200).json(user);
    });

};

//Delete profile

exports.deleteUser = function(req, res){

    var userId = req.body.userId;

    userModel.findById(userId).remove(function(err){
        if(err)
            return res.status(500).json({mongoError: err});
        
        res.status(200).end();
    });
};
