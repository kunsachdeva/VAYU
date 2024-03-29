var userModel = require('../models/userModel.js'),
    fileModel = require('../models/fileModel.js'),
    folderModel = require('../models/folderModel.js'),
mongoose = require('mongoose'),
exports = module.exports = {},
AWS = require('aws-sdk'),
s3 = new AWS.S3(),
fs = require('fs'),
uuid = require('node-uuid');

//Upload file
exports.uploadFile = function (req, res){

    var files = [],
        userId = req.body.userId,
        folderId = req.params.folderId;
        console.log(folderId);
    for(var key in req.files) {
        if(req.files.hasOwnProperty(key)){
            
            var fileUUID = uuid.v4(),
                mimeType = req.files[key].mimetype,
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

            //Object to insert to file model
            data = {
                name: req.files[key].originalname,
                type: req.files[key].mimetype,
                extension: req.files[key].extension,
                size: req.files[key].size,
                folder: folderId,
                icon: icon
            };
            
            file = new fileModel(data);

            file.save(function(err, newFile){
                if(err)
                    return res.status(500).json({mongoError: err});
                
                //Add file ID to folder
                folderModel.findByIdAndUpdate(folderId, {$push:{files:newFile._id}}, function(err){
                    if(err)
                        return res.status(500).json({mongoError: err});
                    
                    if(newFile){
                        s3.upload({
                            Bucket: userId,
                            Key: newFile._id.toString(),
                            Body: fs.createReadStream(req.files[key].path)
                        }, function (err, data){
                            if(err)
                                return res.status(500).json({awsError: err});
                            else
                                res.status(200).end();
                        });
                    }
                });
            });// jshint ignore:line
        }
    }
};
//End of upload file


//List files
exports.listFiles = function(req, res){

    var userId, folderId;

    try{
        userId = req.body.userId;
        folderId = req.params.folderId;
    }
    catch(err)
    {
        return res.status(400).end();
    }
    
    //Find specified folder
    folderModel.findOne({_id: folderId, user: userId})
        //Find files in folder
        .populate('files')
        .populate('folders')
        .exec(function(err, files){
            if(err)
                return res.status(500).json({mongoError: err});

            if(files){
                var data = {
                    files: files.files,
                    folders: files.folders
                };
                res.status(200).json(data);
            }else{
                res.status(400).json({"message": "Folder not found"});
            }
        });
};
//End of list files


//New folder
exports.newFolder = function(req, res){

    var userId, folderId, folder, name;

    try{
        userId = req.body.userId;
        folderId = req.params.folderId;
        name = req.body.name;
        console.log(name);
    }
    catch(err)
    {
        return res.status(400).end();
    }

    folder = new folderModel({
    
        user: userId,
        parent: folderId,
        name: name       

    });

    //Add folder to db
    folder.save(function(err, result){

        if(err)
            return res.status(500).json({mongoError: message});
    
        //Add folder id to parent folder
        folderModel.update({_id: folderId}, {$push: {folders: result._id}}).exec(function(err, r){

                if(err)
                    return res.status(500).json({mongoError: err});
                res.status(200).end();
                console.log(folderId, result._id);
            });
    });


};
//End of new folder

//Rename folder
exports.renameFolder = function(req, res){

    var userId, folderId, name;
    
    try{
        userId = req.body.userId;
        folderId = req.params.folderId;
        name = req.body.name;
        console.log(name);
    }
    catch(err)
    {
        return res.status(400).end();
    }

    //Find and rename folder
    folderModel.findByIdAndUpdate(folderId, {$set: {name: name}}).exec(function(err){
    
        if(err)
            return res.status(500).json({mongoError: err});
        
        res.status(200).end(); 
    });

};

//Delete folder
exports.deleteFolder = function(req, res){

    var userId, folderId;

    try{
        userId = req.body.userId;
        folderId = req.params.folderId;
    }
    catch(err)
    {
        return res.status(400).end();
    }

    folderModel.findById(folderId).remove(function(err){

        if(err)
            return res.statsu(500).json({mongoError: err});

        res.status(200).end();
    });

};

//Share file
exports.shareFile = function(req, res)
{
    var fileId, email;

    try{
        fileId = req.params.fileId;
        email = req.body.email;
    }
    catch(err)
    {
        return res.status(400).end();
    }

    //Update file 'sharedWith' field
/*    fileModel.findByIdAndUpdate(fileId, {$push: {sharedWith: userId}}).exec(function(err, result){

            if(err)
                return res.status(500).json({mongoError: err});
            
*/            //Also add to specified user
            userModel.update({email: email}, {$push: {sharedFiles: fileId}}).exec(function(err, result){
                
                if(err)
                    return res.status(500).json({mongoError: err});
                
                res.status(200).end();
                console.log('shared file', email, fileId);
                console.log(result);
            });
 //   });
};

//Rename file
exports.renameFile = function(req, res) {

    var fileId, name;

    try{
        fileId = req.params.fileId;
        name = req.body.name;
    }
    catch(err)
    {
        return res.status(400).end();
    }

    fileModel.findByIdAndUpdate(fileId, {$set: {name: name}}).exec(function(err, result){
    
        if(err)
            return res.status(500).json({mongoError: err});

        res.status(200).end();
    });
};

//Delete file
exports.deleteFile = function(req, res) {

    var fileId, userId;

    try{
        fileId = req.params.fileId;
        userId = req.body.userId;
    }
    catch(err)
    {
        return res.status(400).end();
    }

    fileModel.findById(fileId).remove(function(err, result){
        
        if(err)
            return res.status(500).json({mongoError: err});

        s3.deleteObject({
            Bucket: userId,
            Key: fileId
        }, function(err){
            if(err)
                return res.status(500).json({awsError: err});

            res.status(200).end();
        });
    });

};

//List shared files
exports.listSharedFiles = function(req, res) {

    var userId;

    try{
        userId = req.body.userId;
    }
    catch(err)
    {
        return res.status(400).end();
    }

    userModel.findById(userId).populate('sharedFiles').exec(function(err, result){
    
        if(err)
            return res.status(500).json({mongoError: err});

        res.status(200).json(result.sharedFiles);
    });

};
