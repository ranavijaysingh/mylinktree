const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const md5 =require("md5");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const e = require("express");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
const oldMongoLink = "mongodb://localhost:27017/linktrDB"
const newMongoLink = "mongodb+srv://our-first-user:muY2VV2o8x48lML3@ranavijaycluster.58sli.mongodb.net/tinderdb?retryWrites=true&w=majority"
mongoose.connect(newMongoLink, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const urllistSchema = new mongoose.Schema({
  title: String,
  url: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "linktr",
  },
});
const urllist = mongoose.model("urllist", urllistSchema);
const urlslistSchema = urllist.schema;
const linktrSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  urlslist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "urllist",
    },
  ],
});

linktrSchema.plugin(passportLocalMongoose);

const linktr = mongoose.model("linktr", linktrSchema);
const redirectUrl = process.env.PORT ?'https://linktree-e4mq.onrender.com/' : 'localhost:3050';
// passport.use(new LocalStrategy(linktr.authenticate()));
passport.use(linktr.createStrategy());

passport.serializeUser(linktr.serializeUser());
passport.deserializeUser(linktr.deserializeUser());

var username = "";
var title = "";
var url = "";
var linklist = [
  { title: "mygoogle", url: "https://google.com" },
  { title: "myfacebook", url: "https://facebook.com" },
];
app.get("/", function (req, res) 
{ 
  var logstatus=req.user;
  res.render("index",{logstatus:logstatus});
});

app.get("/register", function (req, res) {
  res.render("register",{username:ns});
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/mylinks", function (req, res) {
  if (req.isAuthenticated()) {
    // important console.log(req.user._id);
     var use=req.user.username;
    linktr
      .findById(req.user._id)
      .populate("urlslist")
      .exec()
      .then((resp) => {
        res.render("mylinks", { linklist: resp.urlslist,use:use, redirectUrl: redirectUrl });
      })
      .catch((err) => {
        console.log(err);
      });

    //console.log(req);
  } else {
    res.redirect("/login");
  }
});
app.get("/finalsite/:use", function (req, res) {
  linktr
    .findOne({ username: req.params.use })
    .populate("urlslist")
    .exec()
    .then((resp) => {
      if (resp) {
        //console.log(resp.urlslist);
        return res.render("finalsite", { linklist: resp.urlslist });
      } else {
        return res.send("error");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
// app.get("/finalsite/:use", function (req, res) {
//   linktr
//   .findOne({username:req.params.use})
//   .populate("urlslist")
//   .exec()
//   .then((resp) => {
//     //res.send("success");
//     console.log(resp.urlslist);
//     res.render("finalsite",{ linklist:resp.urlslist });
//   })
//   .catch((err) => {
//     console.log(err);});
// });
//logout get route
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});
app.post("/register", function (req, res) {
  linktr.register(
    { username: req.body.username, email: req.body.email },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/mylinks");
        });
      }
    }
  );
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

app.post("/login", function (req, res) {
  const user = new linktr({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/mylinks");
      });
    }
  });
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

app.post("/mylinks", function (req, res) {
  //console.log(req.body);
  var newobj = new urllist({
    title: req.body.title,
    url: req.body.url,
    user_id: req.user._id,
  });

  newobj.save(function (err, result) {
    if (err) {
      console.log(err);
      res.send("err occured");
    } else {
      
      linktr
        .findByIdAndUpdate(req.user._id, { $push: { urlslist: result._id } })
        .then((resp) => {
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
  res.redirect("/mylinks");
});
var ns;
app.post("/registeruser",function(req,res){
     ns=req.body.username;
    res.redirect("/register");
});
app.listen(process.env.PORT || 3050, () => console.log("server started"));
