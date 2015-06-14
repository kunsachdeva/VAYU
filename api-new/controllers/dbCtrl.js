var userModel = require('../models/userModel.js'),
    bcrypt = require('bcryptjs'),
    mongoose = require('mongoose'),
    exports = module.exports = {},
    auth = require('basic-auth');

exports.findUser = function (req, res, next) {

	cred = auth(req);

    if(cred.name.length !== 0 && cred.pass.length !== 0){

        var data = {
			_id : cred.name,
			apiKey : cred.pass
		};

		userModel.findOne(data, function (err, user) {
			if(err)
		        return res.status(401).end();	

				if (user) {
	                	req.body.userId = user._id.toString();
	                    next();
	                    console.log('ey');
	            }
				else
				{
					res.status(401).json({message : 'Unauthorized'});
                    console.log(data);
				}
			
		});

    }else{

        console.log('eyre');
        res.status(401).json({message : 'Unauthorized'}).end();

    }
	
	
};
