var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var User = require("./models/user.js");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost/auctions_db", { useNewUrlParser: true } ); 


// =========================================

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
	secret: "i worth a lot!!!",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============================================

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));  // tell express to serve the public dir


// ROUTES
app.get("/", function(req, res) {
	res.render("home.ejs");
});

app.get("/secret", isLoggedIn, function(req ,res) {
	res.render("secret.ejs");
});

// sign up routes
app.get("/register", function(req, res) {
	res.render("register.ejs");
});

app.post("/register", function(req, res) {
	User.register(new User({ username: req.body.username , category: req.body.category }), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			res.render("register.ejs");
		}
		else {														// if the registration of the user is done correctly 
			passport.authenticate("local")(req, res , function() { 	// we authenticate the user (here we use the 'local' strategy)
				console.log(req.body.category);
				res.redirect("/secret" );												// but there are 300 strategies (px twitter, facebook klp)
			});
		}
	});
});


// login routes
app.get("/login", function(req, res) {
	res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/secret",
	failureRedirect: "/login"
}));

// logout route
app.get("/logout", function(req ,res) {
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

app.listen(3000, function() {
	console.log("auctions app server has started!!!");
});