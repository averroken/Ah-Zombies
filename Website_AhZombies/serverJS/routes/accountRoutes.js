const passport = require('passport');
const bodyParser = require('body-parser');
var Account = require('../models/account');
let time = new Date();
// const jwt = require('jsonwebtoken');
// const async = require('async');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');

function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }

    res.render('signin', {
        info: "Please login"
    })
}

module.exports = function (app) {
    /*********SIGN IN*********/
    app.get('/signin', function (req, res) {
        var info = req.flash('error');
        if (info != ""){
            console.log("INFO: " + info);
            return res.render('signin', {info: info});
        }
        return res.render('signin');
    });

    app.post('/signin', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: true
    }), function (req, res) {
        console.log(req.user);
        res.redirect('/');
    });

    /*********SIGN UP*********/
    app.get('/signup', function (req, res) {
        res.render('signup');
    });

    app.post('/signup', function (req, res) {
        console.log(req.body);
        Account.register(new Account({
                username: req.body.username,
                email: req.body.email,
                authenticationMethod: 'Local'
            }),
            req.body.password,
            function (err, account) {
                if (err) {
                    console.log("error: " + err);
                    return res.render('signup', {
                        info: "Sorry. That username is already taken"
                    })
                }

                passport.authenticate('local')(req, res, function () {
                    res.redirect('/signup');
                });
            });
    });

    /*********LOG OUT*********/
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    /*********ACCOUNT*********/
    app.get('/account', isAuthenticated, function (req, res) {
        var user = req.user;
        res.render('account', {user: user});
    });

    /******ACCOUNT UPDATE*****/
    app.post('/update', function (req, res, next) {
        // console.log(req.user);
        // console.log(req.user._id);
        Account.findById(req.user._id, function (err, account) {
            if (err)
            // res.status(500).send(err);
                console.log("---ERROR=========");
            else if (account) {
                console.log("---------ACCOUNT--------");
                console.log(account);
                account.username = req.body.username;
                account.email = req.body.email;
                account.save(function (err) {
                        if (err) {
                            return res.render('404');
                        } else {
                            return res.render('index', {info: "Account details updated, please login"});
                        }
                    }
                )
            }
            else {
                console.log("===========ERROR-------");
                // res.status(404).send('no account found');
            }
        });
    });


//    io.on('connection', function(socket) {
//        socket.on('chat message', function(message) {
//            time = new Date();
//            // console.log("------> chat message: " + message.message);
//            // console.log("------> chat user: " + message.user);
//            // console.log("------> chat time: " + time.getHours() + ":" + time.getMinutes());
//            io.emit('message', {
//                message: message.message,
//                user: message.user,
//                time: time.getHours() + ":" + time.getMinutes()
//            });
//        });
//    });
};