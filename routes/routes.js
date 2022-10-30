const express = require('express');
const router  = express.Router();
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads');
    },
    filename: function(req,file,cb){
        cb(null, file.fieldname + "_" + Date.now());
    }
});

const upload = multer({storage : storage}).single("image");

const userSchema = require('../models/userSchema')

router.get("/",(req,res)=>{
    res.render('index',{title: "CRUDder"});
})
router.get("/home",(req,res)=>{
    userSchema.find().exec((err,users)=>{
        if(err){
            console.log({message : message.err})
        }
        res.render("home",{title: 'CRUDer | Home', Users: users})
    })
    
})
router.get("/edit/:id",(req,res)=>{
    let id = req.params.id;
    userSchema.findById(id,(err,user)=>{
        if(err){
            res.redirect('home')
        }else if(user == null){
            res.redirect('home')
        }else{
            res.render("edit",{title:'CRUDer | Edit', user:user})
        }
    })
})
router.post("/update/:id",upload,(req,res)=>{
    let id = req.params.id; 
    let new_image = "";
    if(req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync("./uploads/"+ req.body.old_image);
        }catch(err){
            console.log(err);
        }
    }else{
        new_image = req.body.old_image;
    }
    userSchema.findByIdAndUpdate(id,{
        Name:   req.body.Name,
        Email:  req.body.Email,
        Phone:  req.body.Phone,
        Image:  new_image,
    },(err,result)=>{
        if(err){
            console.log(err);
        }else{
            console.log(result);
        }
    })
    res.redirect('/home');
})
router.get("/add",(req,res)=>{
    res.render("add",{title:'CRUDer | Add Users'})
})
router.post('/add', upload, async (req,res)=>{
    const User = new userSchema({
        Name:   req.body.Name,
        Email:  req.body.Email,
        Phone:  req.body.Phone,
        Image:  req.file.filename,
    })
    const result = await User.save();
    res.redirect('home');
    console.log(result);
})
router.get('/delete/:id',async(req,res)=>{
    let id = req.params.id;
    userSchema.findByIdAndRemove(id,(err,result)=>{
        if(result.Image !=""){
            try{
                fs.unlinkSync('./uploads/' + result.Image);
            }catch(err){
                console.log(err);
            }
        }else if(err){
            console.log(err);
        }else{
            console.log("User Deleted");
        }
    });
    res.redirect('/home');
})
router.get('/about',(req,res)=>{
    res.render('about',{title: 'CRUDer | About'});
})
module.exports = router;