const express =require('express');
const multer = require('multer');
const ejs = require('ejs');
const path =require('path');
const imgModel = require('./modules/File');
const imgData = imgModel.find({});

//Set stroage engine
const storage = multer.diskStorage({
    destination : './public/uploads/',
    filename : function(res,file,cb){
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
});

//Init upload
const upload = multer({
    storage: storage,
    limits : {fileSize : 1000000},
    fileFilter : function(req,file,cb){
        checkFileType(file,cb);
    }
}).single('myImg');

//Check File Type
function checkFileType(file,cb) {
    //Allowed ext
    const fileTyps = /jpeg|jpg|png|gif/;
    //check ext
    const extname = fileTyps.test(path.extname(file.originalname).toLowerCase());
    //chack mimetype
    const mimetype = fileTyps.test(file.mimetype);
    if(extname && mimetype){
        cb(null,true);
    }else{
        cb('Error: Images only!');
    }
}


//Init app
const app = express();

//ejs
app.set('view engine','ejs');

//public Folder
app.use(express.static('./public'));

app.get('/', (req , res) => {
    imgData.exec(function(err,data){
        if(err) throw err;
        res.render('index',{msg:"Welcome!",records:data});
    });
});

app.post('/upload',(req,res)=>{
    upload(req, res, (err)=>{
        if(err){
            imgData.exec(function(err1,data){
                if(err1) throw err1;
                res.render('index',{msg : err,records:data});
            });          
        }else{
            if(req.file == undefined){
                imgData.exec(function(err,data){
                    if(err) throw err;
                    res.render('index',{msg:"Select a Image!",records:data});
                });
            }else{
                // const imgName = req.file.filename;
                // const imgDetails = new 
                imgModel({
                    imgfile: req.file.filename
                }).save(function(err,doc){
                    if(err) throw err;
                    imgData.exec(function(err,data){
                        if(err) throw err;
                        res.render('index',{msg:"Image Upload Successfully!",records:data});
                    });
                });
                
            }
        }
    });
});

const port = 3000;
app.listen(port,()=>console.log(`Server started on port ${port}`));