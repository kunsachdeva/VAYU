var port = process.env.PORT || 1337,
    express = require('express'),
    app = express(),
    api = express.Router(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    User = require('./models/user.js'),
    userCtrl = require('./controllers/userctrl.js'),
    fileCtrl = require('./controllers/fileCtrl.js'),
    multer = require('multer'),
    crypto = require('crypto'),
    auth = require('basic-auth'),
    common = require('./common'),
    config = common.config(),
    base = config.apiUrl,
    db = require('./controllers/dbCtrl.js'),
    RateLimit = require('express-rate-limit'),
    limiter = RateLimit({
        // window, delay, and max apply per-ip unless global is set to true
        windowMs: 60 * 1000, // miliseconds - how long to keep records of requests in memory
        delayMs: 1000, // milliseconds - base delay applied to the response - multiplied by number of recent hits from user's IP
        max: 5, // max number of recent connections during `window` miliseconds before (temporarily) bocking the user.
        global: false // if true, IP address is ignored and setting is applied equally to all requests
    }),
    cors = require('cors');

app.enable('trust proxy');

mongoose.connect(config.mongocon);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization']
}));


/*app.use('/api', function (req, res, next){
    
    cred = auth(req);
    if(cred.name.length !== 0 && cred.pass.length !== 0){

        req.body.id = cred.name;
        req.body.key = cred.pass;
        console.log(cred);

        next();
    }else{
        console.log('eyre');
        res.status(401).json({message : 'Unauthorized'}).end();
    }
}, db.findUser, api);*/
/*
 * 
 * 
 * 
 * USER ROUTES
 * 
 * 
 * 
 */

app.post('/users', limiter, userCtrl.register);

//login
app.get('/users', userCtrl.login);

app.route('/users/:userID')
    .all(db.findUser)
    .delete(userCtrl.deleteUser)
    .put(userCtrl.updateProfile);


app.route('/user/:userEmail/resetRequest')
    .all(db.findUser)
    .post(userCtrl.sendPasswordReset);

/*
 * 
 * 
 * 
 * FILE ROUTES
 * 
 * 
 * 
 */

//upload file
app.route('/files/:userID')
    .all(db.findUser)
    .get(fileCtrl.listFiles)
    .post(multer({
        dest: __dirname + '/uploads',
        limits: {
            fieldNameSize: 100,
            files: 2,
            fields: 5,
            fileSize: 314572800
        }
    }), fileCtrl.uploadFile);

//new folder
app.route('/folder/:folderId')
    .all(db.findUser)
    .post(fileCtrl.newFolder);

app.route('/files/:userID/:folderID')
    .all(db.findUser)
    .get(fileCtrl.listFiles)
    .post(multer({
        dest: __dirname + '/uploads',
        limits: {
            fieldNameSize: 100,
            files: 2,
            fields: 5,
            fileSize: 314572800
        }
    }), fileCtrl.uploadFile);

app.route('/files/:fileID')
    .all(db.findUser)
    .delete(fileCtrl.deleteFile);

app.get('/', function(req, res) {
    res.status(401).json({
        message: 'Unauthorized'
    });
});

//start server
app.listen(port, function() {
    console.log("backend", config);

    //console.log(config)
});
