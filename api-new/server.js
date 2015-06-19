var port = process.env.PORT || 1337,
    express = require('express'),
    app = express(),
    api = express.Router(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    userCtrl = require('./controllers/userCtrl.js'),
    fileCtrl = require('./controllers/fileCtrl.js'),
    multer = require('multer'),
    crypto = require('crypto'),
    auth = require('basic-auth'),
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

mongoose.connect(process.env.mongocon || 'localhost');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization']
}));
//app.use(limiter);

app.use('/api', db.findUser, api);

//Doesn't require auth
app.post('/users', userCtrl.register);

//Login
app.get('/users', userCtrl.login);

//User edits
api.route('/users')
    //Delete user
    .delete(userCtrl.deleteUser)
    //Edit user
    .put(userCtrl.updateProfile);
    
api.route('/share/:fileId/:userId')
    .post(fileCtrl.shareFile);

//File edits
api.route('/file/:fileId')

    //Rename file
    .put(fileCtrl.renameFile)

    //Delete file
    .delete(fileCtrl.deleteFile);


api.route('/files/:folderId')

    //List files
    .get(fileCtrl.listFiles)
    
    //Upload file
    .post(multer({
        dest: __dirname + '/uploads',
        limits: {
            fieldNameSize: 100,
            files: 2,
            fields: 5,
            fileSize: 314572800
        }
    }), fileCtrl.uploadFile);
 
api.route('/folder/:folderId')
    //Create folder
    .post(fileCtrl.newFolder)

    //Delete folder
    .delete(fileCtrl.deleteFolder)

    //Rename Folder
    .put(fileCtrl.renameFolder);

app.get('/', function(req, res) {
    res.status(401).end();
});

app.listen(port, function() {
    console.log("API running on port: " + port);
});
