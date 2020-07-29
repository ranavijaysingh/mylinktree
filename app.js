const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 =require("md5");


app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/linktrDB",{useNewUrlParser:true,useUnifiedTopology: true})


const linktrSchema = {
    email:String,
    username:String,
    password:String,
    
};
const linktr = mongoose.model("linktr",linktrSchema);

var username="";
var title="";
var url="";
var linklist=[{title:"mygoogle",url:"https://google.com"},{title:"myfacebook",url:"https://facebook.com"}];
app.get("/",function(req,res)
{
    res.render("index");
});
app.get("/register",function(req,res){
    res.render("register",{username:username});
});
app.get("/login",function(req,res){
    res.render("login");
});
// app.get("/mylinks",function(req,res){
//     res.render("mylinks",{linklist:linklist});
// });
app.get("/finalsite",function(req,res){
    res.render("finalsite",{linklist:linklist});
});
app.get("/logout",function(req,res){
    // req.logout();
    res.redirect("/");
})
app.post("/register",function(req,res){
    const user=new linktr({
        username:req.body.username,
        password:md5(req.body.password),
        email:req.body.email
    });
    user.save(function(err){
        if(!err){
            res.render("mylinks",{linklist:linklist});
        }
        else
        {
            res.render(err);
        }
    });
    // console.log("saved data");
    // const articletitle=req.body.titlepost;
    // const articlecontent=req.body.newcontent;
    // const newpost=new article({
    //     Title:articletitle,
    //     Content:articlecontent
    // });
    // newpost.save();
});

app.post("/login",function(req,res){
    linktr.findOne({username:req.body.username},function(err,foundeduser){
        if(err){
            res.send(err)
        }
        else
        {
            if(foundeduser)
            {
                if(foundeduser.password==md5(req.body.password)){
                    res.render("mylinks",{linklist:linklist});
                }
            }
        }
    });
});

app.post("/mylinks",function(req,res){
     var newobj={
         title:req.body.title,
        url:req.body.url
    }
    linklist.push(newobj);
    res.redirect("/mylinks");
});

app.post("/registeruser",function(req,res){
     username=req.body.username;
    res.redirect("/register");
})
app.listen(process.env.PORT||3000,()=>console.log("server started"));