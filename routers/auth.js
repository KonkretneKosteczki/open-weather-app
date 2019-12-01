const express = require("express");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const router = express.Router();
const database = require("../database");
const bCrypt = require("bcrypt");
const ObjectID = require("mongodb").ObjectID;
const config = require("../config");
const session = require("express-session");
const bodyParser = require("body-parser");

passport.use(new Strategy((username, password, cb) => database
    .collection("users")
    .readEntry({user: username})
    .then(user => {
        if (!user) return cb(null, false);
        bCrypt.compare(password, user.password, (err, isValid) => {
            if (err) return cb(err);
            if (!isValid) return cb(null, false);
            return cb(null, user);
        })
    })
    .catch(cb)
));

passport.serializeUser((user, cb) => cb(null, user._id));
passport.deserializeUser((id, cb) => database
    .collection("users")
    .readEntry({_id: new ObjectID(id)})
    .then(user => user ? cb(null, user) : cb("invalid user"))
);

router.use(bodyParser.urlencoded({extended: true}));
router.use(session({secret: config.sessionEncodingSecret, resave: false, saveUninitialized: false}));
router.use(passport.initialize({}));
router.use(passport.session({}));
router.use("/login", express.static(__dirname + "/../public/login.html"));

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/"
}));

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
});

router.use(require("connect-ensure-login").ensureLoggedIn());

module.exports = router;
