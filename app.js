const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const md5 =require("md5");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/linktrDB",{useNewUrlParser:true,useUnifiedTopology: true})


const linktrSchema = new mongoose.Schema({
    email:String,
    username:String,
    password:String
});

linktrSchema.plugin(passportLocalMongoose);

const linktr = mongoose.model("linktr",linktrSchema);

// passport.use(new LocalStrategy(linktr.authenticate()));
passport.use(linktr.createStrategy());
 
passport.serializeUser(linktr.serializeUser());
passport.deserializeUser(linktr.deserializeUser());

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
app.get("/mylinks",function(req,res){
    if(req.isAuthenticated()){
        res.render("mylinks",{linklist:linklist});
    }else{
        res.redirect("/login");
    }
});
app.get("/finalsite",function(req,res){
    res.render("finalsite",{linklist:linklist});
});
app.get("/logout",function(req,res){
     req.logout();
    res.redirect("/");
})
app.post("/register",function(req,res){
    linktr.register({username: req.body.username,email:req.body.email},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/mylinks");
            });
        }
    });
    // const user=new linktr({
    //     username:req.body.username,
    //     password:md5(req.body.password),
    //     email:req.body.email
    // });
    // user.save(function(err){
    //     if(!err){
    //         res.render("mylinks",{linklist:linklist});
    //     }
    //     else
    //     {
    //         res.render(err);
    //     }
    // });
});

app.post("/login",function(req,res){
    const user= new linktr({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else
        {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/mylinks");
            })
        }
    })
    // linktr.findOne({username:req.body.username},function(err,foundeduser){
    //     if(err){
    //         res.send(err)
    //     }
    //     else
    //     {
    //         if(foundeduser)
    //         {
    //             if(foundeduser.password==md5(req.body.password)){
    //                 res.render("mylinks",{linklist:linklist});
    //             }
    //         }
    //     }
    // });
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