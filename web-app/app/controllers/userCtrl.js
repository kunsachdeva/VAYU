var User = require('../models/userModel.js');
var Sub = require('../models/subModel.js');
var mongoose = require('mongoose');

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 40; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return text;
}


module.exports.createUser = function (req, res) {
    
    user = new User();
    
    user.fname = req.body.fname;
    user.lname = req.body.lname;
    user.email = req.body.email;
    user.password = req.body.password;
    
    user.save(function (err) {
        if (err)
            res.send(err);
        
        console.log(req.body);
        
    });
    res.end();

};

module.exports.getUsers = function (req, res) {
    
    User.find(function (err, users) {
        if (err)
            res.send(err);
        
        res.json(users);
    });

};

module.exports.getUserById = function (req, res) {
    
    User.findById(req.params.user_id, function (err, user) {
        if (err)
            res.send(err);
        res.json(user);
    });
};



module.exports.subUser = function (req, res) {
    
    mongoose.connect(process.env.MONGO_CONN);

    sub = new Sub();

    sub.name = req.body.name;
    sub.email = req.body.email;
    sub.activation = makeid();
    sub.activated = 0;
    sub.invited = 0;
    
    sub.save(function (err) {
        if (err)
            console.log(err);
        
        console.log(req.body);
        
    });
    res.end();
    mongoose.connection.close();
    
};
