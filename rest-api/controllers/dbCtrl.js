var User = require('../models/user.js'),
    bcrypt = require('bcryptjs'),
    mongoose = require('mongoose'),
    exports = module.exports = {},
    auth = require('basic-auth');

exports.findUser = function (req, res, next) {

	cred = auth(req);

    if(cred.name.length !== 0 && cred.pass.length !== 0){

        var data = {
			_id : cred.name,
			ApiKey : cred.pass
		};

		User.findOne(data, function (err, user) {
			if(err)
			{
				res.status(500).json({
					message : 'Server error',
					mongoError : err
				});

			}
			else
			{
				if (user) {
	                	req.body.userLevel = user.level.toString();
	                	req.body.userId = user._id.toString();
	                    next();
	                    console.log('ey');
	            }
				else
				{
					res.status(401).json({message : 'Unauthorized'});
				}
			}
		});

    }else{

        console.log('eyre');
        res.status(401).json({message : 'Unauthorized'}).end();

    }
	
	
};