var User = require('../models/user.js'),
    File = require('../models/file.js'),
    Folder = require('../models/folder.js'),
    mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    azure = require('azure-storage'),
    crypto = require('crypto'),
    exports = module.exports = {},
    request = require('request'),
    auth = require('basic-auth'),
    bcrypt = require('bcryptjs'),
    uuid = require('node-uuid'),
    common = require('../common'),
    AWS = require('aws-sdk'),
    shortID = require('shortid'),
    s3 = new AWS.S3(),
    config = common.config(),
    base = config.apiURL,
    sendgrid = require('sendgrid')(config.sendgriduser, config.sendgridkey);


AWS.config.update({
    accessKeyId: config.awsKey,
    secretAccessKey: config.awsSecret
});

console.log(AWS.config);

/*
 * Registration
 */
exports.register = function(req, res) {

    fName = req.body.name.first;
    lName = req.body.name.last;
    email = req.body.email;
    password = req.body.password;

    if (fName && lName && email && password) {

        User.findOne({
            email: email
        }, function(err, user) {

            if (err) {
                res.status(500).json({
                    mongoError: err
                });
            } else {
                if (user) {
                    res.status(422).json({
                        message: 'Email already exists'
                    });
                } else {

                    var pass = bcrypt.hashSync(password, 8);

                    user = new User();
                    user.name.first = fName;
                    user.name.last = lName;
                    user.email = email;
                    user.level = 'user';
                    user.storageUsed = 0;

                    // bcrypt hash
                    user.password = pass;

                    user.ApiKey = uuid.v4();

                    //create user
                    user.save(function(err, newUser) {
                        if (err) {
                            res.status(500).json({
                                success: false,
                                error: {
                                    message: 'Unable to create user',
                                    mongoError: err
                                }
                            });
                        } else {

                            var folder = new Folder({
                                user: user._id,
                                name: '~'
                            });

                            folder.save(function(err, newFolder) {
                                if (err) {
                                    res.status(500).json({
                                        success: false,
                                        error: {
                                            message: 'Unable to create user',
                                            mongoError: err
                                        }
                                    });
                                } else {
                                    User.update({
                                        _id: user._id
                                    }, {
                                        $push: {
                                            folders: newFolder._id
                                        }
                                    }, function(err) {
                                        if (err){
                                            res.status(500).json({
                                                error: {
                                                    message: 'Unable to create user',
                                                    mongoError: err
                                                }
                                            });
										}else{
											s3.createBucket({
                                Bucket: newUser._id.toString()
                            }, function(err) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).json({
                                        message: 'Server error',
                                        awsError: err
                                    });
                                } else {
                                    delete newUser.password;
                                    res.status(200).json(newUser);
                                }
                            });	


										}
                                    });
                                }
                            });

                            
                        }
                    });


                }
            }

        });
    } else {
        res.status(400).json({
            message: 'Invalid data'
        });
    }


};


/*
 * Login
 */
exports.login = function(req, res) {

    //basic auth
    var cred = auth(req);

    User.findOne({
        email: cred.name
    }, function(err, user) {
        if (err) {
            res.status(500).json({
                success: false,
                error: {
                    message: 'Unable to login',
                    mongoError: err
                }
            });
        } else {

            if (user) {
                if (bcrypt.compareSync(cred.pass, user.password)) {

                    User.findOne({
                        _id: user._id
                    }).populate('folders');


                    res.status(200).json(user);
                } else {
                    res.status(401).end();
                }
            }

            //If no user is found
            else {
                res.status(401).json({
                    success: false,
                    error: {
                        message: 'Incorrect credentials'
                    }
                });
            }

        }
    });

};


/*
 * Password Reset
 */
exports.resetPassword = function(req, res) {

    var userID = req.params.userID,
        resetCode = req.params.resetCode;

    User.find({
        id: userID,
        resetCode: resetCode
    }, function(err, user) {
        //If reset code is correct, send email
        if (user) {

            var htmlBody, subject, textBody;
            var userEmail = user.email;

            //Retrieve reset pass template
            request.get({
                url: "https://api.sendgrid.com/v3/templates/40c4ff03-e03f-46e0-89e3-18729f48d2a6",
                headers: headers
            }, function(error, response, body) {
                htmlBody = JSON.parse(body);

                htmlBody = htmlBody.versions[0].html_content;
                textBody = htmlBody.versions[0].plain_content;
                subject = emailBody.versions[0].subject;
            });

            //Send email
            var resetEmail = new sendgrid.Email({
                to: userEmail,
                from: 'noreply@vayudrive.com',
                subject: subject,
                text: textBody,
                html: htmlBody
            });

            resetEmail.addSubstitution('newpassword', newPass);

        }
    });
};

//pass reset request
exports.sendPasswordReset = function(req, res) {

    var userID = req.body.email;
    //Basic auth for SendGrid
    var headers = {
        'Authorization': 'Basic: YXp1cmVfZTNkZWI5ZjM2N2E1NzU5YzY2YWRmMDVkYTgzMzEyZDVAYXp1cmUuY29tOlp6UzVla0N6Tlg5OHdiSA==',
    };

    var htmlBody, subject, textBody, resetCode;

    //Retrieve reset pass template
    request.get({
        url: "https://api.sendgrid.com/v3/templates/40c4ff03-e03f-46e0-89e3-18729f48d2a6",
        headers: headers
    }, function(error, response, body) {
       
		//parse response from sendgrid
	   	htmlBody = JSON.parse(body);
		
        htmlBody = htmlBody.versions[0].html_content;
        textBody = htmlBody.versions[0].plain_content;
        subject = emailBody.versions[0].subject;
    });

	
    resetCode = crypto.randomBytes(8).toString('hex');

    User.findByIdAndUpdate(userID, {
        $set: {
            resetCode: resetCode
        }
    });

    //send email
    var resetEmail = new sendgrid.Email({
        to: userEmail,
        from: 'noreply@vayudrive.com',
        subject: subject,
        text: 'Click here to reset your password: https://vayudrive.azurewebsites.net/resetPass?e=' + userID + '&c=' + resetCode
    });
};

exports.resetPassword = function(req, res) {
	
	var userId = req.params.userId,
		rCode = req.params.resetCode;

	User.find({_id: userId, resetCode: rCode}, function(err, user){
	
		if(err)
		{
			res.status(500).json({mongoError: err});
		}
		else
		{
			if(user)
			{
				var newPass = crypto.randomBytes(8).toString('hex');	

				User.update({
					_id: user.id
				},{
				   	$set: {
						resetCode: null,
						password: newPass
					}
				}	
				);
			}
		}

	});

};

exports.updateProfile = function(req, res) {
    profile = req.body.user;

    if (profile) {

        //Update profile
        User.findByIdAndUpdate({
                _id: req.body.id
            }, {
                $set: profile
            },
            function(err, user) {
                if (err) {
                    res.status(500).json({
                        error: mongoerror
                    });
                }
            }
        );
    } else {
        res.status(400).json({
            message: 'Invalid data'
        });
    }
};

exports.getAllUsers = function(req, res) {


    User.find({}, function(err, users) {
        if (err)
            res.status(500).json({
                success: false,
                error: {
                    message: 'Unable to rename file',
                    mongoError: err
                }

            });

        res.status(200).json({
            success: true,
            data: users
        });
    });
};

exports.getUser = function(req, res) {

    User.findById(req.params.userID, function(err, user) {
        if (err)
            res.status(500).json({
                success: false,
                error: {
                    message: 'Unable to rename file',
                    mongoError: err
                }
            });
        res.status(200).json({
            success: true,
            data: user
        });
    });
};

exports.deleteUser = function(req, res) {

    User.remove({
        _id: req.params.userID
    }, function(err) {
        if (err)
            res.status(500).json({
                success: false,
                error: {
                    message: 'Unable to rename file',
                    mongoError: err
                }

            });

        res.status(200).json({
            success: true,
            data: null
        });
    });
};
