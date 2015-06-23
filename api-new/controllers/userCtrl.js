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
    sendGrid = require('sendgrid')(process.env.SENDGRID_USER, process.env.SENDGRID_KEY),
    auth = require('basic-auth'),
    templates = {
        activation: 'https://api.sendgrid.com/v3/templates/499b44cf-b34b-4f36-a734-26f2e803ee9e' 
    };


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
        user.activated = false;
        user.aCode = crypto.randomBytes(15);
        
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
                
                //Add home folder to user document
                userModel.update({_id: newUser._id},{$push:{home: homeFolder._id}}, function(err){
                    //User created, now send activation
                    if(err)
                        return res.status(500).json({mongoError: err});
                    
                    
                    //Options for sendgrid template retrieval
                    var options = {
                        url: templates.activation,
                        headers: {
                            'Authorization': 'Basic ' + new Buffer(process.env.SENDGRID_USER + ':' + process.env.SENDGRID_KEY).toString('base64') 
                        } 

                    };
                    
                    //Request activation email template
                    request.get(options, function(error, response, body){
                        //Parse template response
                        var template = JSON.parse(body);
                        
                        //Prepare email + add template
                        var email = new sendGrid.Email({
                            to: 'anthony.r.shuker@gmail.com',//newUser.email,
                            from: 'noreply@vayu.com',
                            subject: 'Activation',
                            html: template.versions[0].html_content,
                            text: template.versions[0].plain_content
                        });

                        //Add substitutions
                        email.addSubstitution('%userId%', newUser._id);
                        email.addSubstitution('%code%', newUser.aCode.toString("base64"));
                        email.addSubstitution('%name%', newUser.name.first);
                        email.addSubstitution('<%subject%>', 'Vayu activation');
                        //Hide body sub tag
                        email.addSubstitution('<%body%>', '');
                        
                        sendGrid.send(email, function(err, json){

                            if(err){
                                console.log(err);
                                return res.status(500).json({message: "Sendgrid error"});
                            }

                            console.log(json, "sent");
                            res.status(200).end();


                        });
                
                    });

                    //Create S3 bucket
                   /* s3.createBucket({
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
                    });*/
                });
            });
        });
    });
};

//Activation
exports.activation = function(req, res) {

    var userId, code;

    try
    {
        userId = req.params.userId;
        code = req.params.code;
    }
    catch(err)
    {
        return res.status(400).end();
    }

    userModel.update({_id: userId, aCode: code}, {$set: {activated: true}}, function(err, result){

        if(err)
            return res.status(500).json({mongoError: err});

        if(!result)
            return res.status(400).end();
        
        res.status(200).end();
    });

};

//Forgot password
exports.forgotPassword = function(req, res){

    var email;

    try
    {
        email = req.body.email;
    }
    catch(err)
    {
        return res.status(400).end();
    }

    userModel.findOne({email: email}, function(err, user) {
        if(err)
            return res.status(500).json({mongoError: err});

        if(user){
           var code = crypto.randomBytes(15);

           userModel.findByIdAndUpdate(user._id, {$set: {resetCode: code}}, function(err){
               if(err)
                   return res.status(500).json({mongoError: err});

               res.status(200).end();
           });
        }
        else
        {
            return res.status(404).end();
        }
    });
};

//Reset pass
exports.resetPassword = function(req, res){

    var code, userId;

    userModel.update({_id: userId, resetCode: code}, function(err, user){ 
        if(err)
            return res.status(500).json({mongoError: err});

        if(user)
            return res.status(200).end();
        else
            return res.status(400).end();

        
    });
};
//Login
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

//TODO Change email
/*exports.changeEmail = function(req, res){
    
};
*/

//TODO Change password
/*exports.changePassword = function(req, res){

};
*/
//Delete profile

exports.deleteUser = function(req, res){

    var userId = req.body.userId;

    userModel.findById(userId).remove(function(err){
        if(err)
            return res.status(500).json({mongoError: err});
        
        res.status(200).end();
    });
};
