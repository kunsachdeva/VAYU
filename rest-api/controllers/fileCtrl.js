var User = require('../models/user.js'),
    File = require('../models/file.js'),
Folder = require('../models/folder.js'),
mongoose = require('mongoose'),
exports = module.exports = {},
AWS = require('aws-sdk'),
s3 = new AWS.S3(),
fs = require('fs'),
common = require('../common.js'),
config = common.config(),
base = config.apiURL,
uuid = require('node-uuid');

AWS.config.update({accessKeyId: config.awsKey, secretAccessKey: config.awsSecret});

exports.uploadFile = function (req, res){

var files = [];
var fileUUID;
var userId = req.params.userID;
var folderId = (req.params.folderID) ? req.params.folderID : undefined;
console.log(userId);
for (var key in req.files) {
	if (req.files.hasOwnProperty(key)) {

		fileUUID = uuid.v4(); // file path
        
        var mimeType = req.files[key].mimetype,
            ext = req.files[key].extension,
            icon = "";

        if(mimeType.indexOf('image') > -1){
            icon = 'image-';
        }else if(mimeType.indexOf('audio') > -1){
            icon = 'audio-';
        }else if(mimeType.indexOf('text/plain') > -1){
            icon = 'text-';
        }else if(ext === "docx"){
            icon = 'word-';
        }else if(ext === "zip" || ext === "rar" || ext.indexOf('tar') > -1){
            icon = 'archive-';
        }else {
           icon = '';
        } 
        console.log(mimeType, icon, ext);
        console.log(mimeType.indexOf('image'));

		data = {
			name: req.files[key].originalname,
			path: fileUUID,
			type: req.files[key].mimetype,
			extension: req.files[key].extension,
			size: req.files[key].size,
			folder: folderId,
            icon: icon
		};

		file = new File(data);

		file.save(function (err, newFile){
			if(err)
			{
				res.status(500).json({mongoError: err});
			}
			else
			{
				//If no folder ID specified, use home(~) folder
				var match = (folderId) ? {_id: folderId, user: userId} : {name: '~', user: userId};

				
				if(newFile){

					Folder.update(match, {
						$push: {
							files: newFile._id
						}
					}, function (err)
					{
						if (err)
							res.status(500).json({
								error : {
									message : 'Unable to create file',
									mongoError : err    
								}
							});
						else
						{
							s3.upload({
									Bucket: userId,
									Key: fileUUID,
									Body: fs.createReadStream(req.files[key].path)
								}, function (err, data){
									if(err)
									{
										console.log(err);
									}
									else
									{
										res.status(200).end();
									}
								});// jshint ignore:line
						}
					});
				}
			}
		});// jshint ignore:line


	}
}



/*File.create(files, function(err, newFiles){

	if (err) {
		res.status(500).json({
			success : false,
			error : {
				message : 'Unable to upload file',
				mongoError : err
			}
		}).end();
		//If no errors, upload the file to azure
	} else {

		
		
		res.status(200).json({
			success : true,
			data : null
		});
	}

});*/

};

exports.newFolder = function (req, res) {
	
	var data = {
		user: req.body.userId,
		parent: req.body.parent,
		name: req.body.name
	};
	folder = new Folder(data);

	folder.save(function (err, folder){

		if(err)
		{
			res.status(500).json({success : false});
		}
		else
		{
			if(folder)
			{
				User.update({_id: userId}, {$push: {folders: folder._id}}, function(err){
					if (err)
						res.status(500).end();
					else
						res.status(200).end();
				});
			}else
			{
				res.status(500).json({success : false});
			}
		}

	});

};

exports.downloadFile = function (req, res){
var fileName, mime;
var fileID = req.params.fileID,
	userID = req.body.userId;

//Find file
File.findOne({ _id : fileID, userID : userID }, function (err, file) { 
	//Error
	if (err) {
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
		name = file.path;
		
		//create stream
		var params = {Bucket: userID, Key: name};
		var stream = require('fs').createWriteStream('./downloads/' + name);
					
		s3.getObject(params, function(err, data){
			res.attachment('./downloads/' + name);
			if (err) console.log(err, err.stack);
			res.send(data.Body);
		
		});

		/*fs.readFile('./downloads/' + name, function (err, data){
			if(err)
				throw err;

			
			res.download('./downloads/' + name);

		});*/

		//res.download(stream);
	}
});  
};

exports.listFiles = function (req, res) {

//list specified folder
	var userId = req.params.userID,// jshint ignore:line
		folderId = req.params.folderID;

	Folder.find({_id: folderId, user: userId}).populate('files').exec(function (err, files){
		if(err)
		{
			res.status(500);
		}
		else
		{
			if(files)
			{
				//di
				//res.status(200).json(files);
				console.log(files);
			}
			else
			{
				res.status(404).json({message : 'No files found'});
			}
		}
	});

};

exports.deleteFile = function (req, res){

var fileID = req.params.fileID;
var userID = req.body.userId;

    File.findByIdAndRemove({
        _id : req.params.fileID,
        userID : userID
    }, function (err, file) {
        if (err) {
            res.status(500).json({
                success : false,
                error : {
                    message : 'Unable to rename file',
                    mongoError : err
                }
                
            });
        }
        else
        {
            if(file){
                console.log(file, 'ey');
                var params = {Bucket: userID.toString(), Key: file.path};
                            
                s3.deleteObject(params, function(err, data){
                    if(err)
                    {
                        res.status(500);
                        console.log(err, err.stack);
                    }
                    else
                    {
                        res.status(200).json(data);
                        console.log(file);
                    }
                });
            }
            else
            {
                console.log(file);
            }
        }
    });
};

exports.updateFileInfo = function (req, res){

    var fileID = req.params.fileID,
        userID = req.body.userID,
        newFileName = req.body.newFileName;

    File.update({ _id : fileID, userID : userID }, { name : newFileName }, function (err, numAffected, raw) {
        
        //If unable to rename file
        if (err) {
            res.status(500).json({
                success : false,
                error : {
                    message : 'Unable to rename file',
                    mongoError : err
                }
                
            });
        }
        //If successsful
        else {
            res.status(200).json({
                success : true,
                data : null
            });
        }
    
    });
};
