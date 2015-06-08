var port = process.env.PORT || 1338,
    express = require('express'),
    app = express(),
    optional = require('optional'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    cookie = require('cookie-parser'),
    pubPath = __dirname + '/public',
    User = require('./app/models/userModel'),
    File = require('./app/models/fileModel'),
    multer = require('multer'),
    uuid = require('node-uuid'),
    api = express.Router(),
    crypto = require('crypto'),
    request = require('request'),
    common = require('./common'),
    config = common.config(),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    base = config.apiURL,
    fs = require('fs'),
    auth = require('basic-auth'),
    FormData = require('form-data'),
    MongoStore = require('connect-mongo')(session);

mongoose.connect(config.mongocon);
//add the middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: './uploads/'}));
app.use(session({
    genid : function (req) {
        return uuid.v1();
    },
    secret : '4£"$%s',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));


app.route('/session')
    .post(function (req, res){

        req.session.user = req.body._id;
        res.json({user: req.session.user.toString()});

    })
    .get(function(req, res){
        console.log(req.session.user, "ey");
        if(req.session.user)
        {
            User.findOne({_id: req.session.user}, '-password', function (err, user){ 
                console.log(user);
                if(err)
                {
                    res.status(500).json({mongoError: err});
                }
                else
                {
                    if(user){
                        res.status(200).json(user);
                    }
                    else
                    {
                        res.status(404).end();
                    }
                }

            });
        }
        else
        {
            res.status(404).end();
        }
    })
    .delete(function (req, res){
        if(req.session.user)
        {
            req.session.destroy();
            res.status(200);
        }
    });



app.post('/files/:userID', function (req, res) {
    
    //var fd = new FormData();
    var fd = {};

    /*$.each(req.files, function(i, file) {
                fd.append('file-'+i, file);
            });*/

    for (var key in req.files) {
        if (req.files.hasOwnProperty(key)) {

            //fd.append(key, fs.createReadStream(req.files[key].path));
            fd[key] = fs.createReadStream(req.files[key].path);
            console.log(fd);
        }
    }
    
    request.post({
        url : base + '/files/' + req.params.userID,
        headers : {
            'X-VAYU-TOKEN' : createHmac(req.body.apiKey + req.params.userID),
            'X-VAYU-USER' : req.params.userID
        },
        formData : fd
    }, function (error, response, body) {
    
        res.end(body);

    });
});

app.get('/download/:fileID', function (req, res){

    var fileID = req.params.fileID,
        userID = req.session.user;
    console.log(fileID, userID);
    File.findOne({ _id : fileID, userID : userID }, function (err, file) { 
        //Error
        if (err) {
            console.log(1);
            res.status(500).json({
                success : false,
                error : {
                    message : 'Unable to upload file',
                    mongoError : err
                }
            });
        }

        //Retrieve file data
        if (file) {
            name = file.name;
            console.log(2, name, userID, file);
            //create stream
            var params = {Bucket: userID, Key: name};
            var stream = require('fs').createWriteStream(__dirname + '/downloads/' + name);
            console.log(params);
                        
            s3.getObject(params/*, function(err, data){
                res.attachment(__dirname + '/downloads/' + name);
                if (err) console.log(err, err.stack);
                res.status(200).send(data);
                //console.log(data);
            }*/).createReadStream().pipe(stream);

            stream.on('close', function(){

                fs.readFile('./downloads/' + name, function (err, data){
                    if(err)
                        throw err;

                    
                    res.download('./downloads/' + name);

                });
            });

            /**/

            //res.download(stream);
        }
        else
        {
            console.log(3);
            res.status(404).end();
        }
    });

});

//html src redirects
app.use('/lib', express.static(pubPath + '/lib'));
app.use('/js', express.static(pubPath + '/js'));
app.use('/views', express.static(pubPath + '/views'));
app.use('/controllers', express.static(pubPath + '/js/controllers/'));
app.use('/img', express.static(pubPath + '/img'));
app.use('/css', express.static(pubPath + '/css'));
app.use('/fonts', express.static(pubPath + '/fonts'));
app.use('/templates', express.static(pubPath + '/templates'));

//index
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: pubPath });
});



//start server
app.listen(process.env.PORT || 1338, function () {
    console.log("frontend");
});
