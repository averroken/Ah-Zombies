/**
 * Created by matth on 25/11/2016.
 */
const passport = require('passport');
const bodyParser = require('body-parser');
var Account = require('../models/account');
const jwt = require('jsonwebtoken');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
module.exports = function(app) {
    //checks (with request parameter) if user is logged in
    function isAuthenticated(req, res, next) {
        if (req.user) {
            return next();
        }

        res.render('login', {
            info: "Please login"
        })
    }

    //renders the homepage
    app.get('/', function(req, res) {
        console.log('user: ' + req.user);
        res.render('index', {
            user: req.user
        });
    });

    //renders register
    app.get('/register', function(req, res) {
        res.render('register', {});
    });

    //handles post on register
    app.post('/register', function(req, res) {
        Account.register(new Account({
                username: req.body.username,
                email: req.body.email,
                authenticationMethod: 'Local',
            }),
            req.body.password,
            function(err, account) {
                if (err) {
                    console.log("error: " + err);
                    return res.render('register', {
                        info: "Sorry. That username is already taken"
                    })
                }

                passport.authenticate('local')(req, res, function() {
                    res.redirect('/');
                });
            });
    });

    //renders login page
    app.get('/login', function(req, res) {
        res.render('login', {
            user: req.user
        });
    });

    //handles post of login
    app.post('/login', passport.authenticate('local'), function(req, res) {
        res.redirect('/');
    });

    //renders logout page
    app.get('/logout', function(req, res) {
        if (req.user.authenticationMethod === "Facebook") {
            console.log('https://www.facebook.com/logout.php?next=127.0.0.1:1337/logout&access_token=' + req.user.facebokToken);
        }
        req.logout();
        res.redirect('/');
    });

    //simple test page to check if user is logged in
    app.get('/ping', isAuthenticated, function(req, res) {
        res.send("pong!", 200);
    })

    //route to generate token for logged in users
    // TODO: Edit token saving to delete old value
    app.get('/authenticate', isAuthenticated, function(req, res) {
        var user = new Account(req.user);
        var json = {
            "username": user.username
        }
        var token = jwt.sign(json, 'ilovechocolate', {
            expiresIn: 1440
        });
        user.token = token;

        // res.json({
        //     user: req.user.username,
        //     success: true,
        //     message: 'Enjoy your token',
        //     token: token
        // });

        res.redirect('/');

        user.save();
    });

    app.get('/changePassword', function(req, res) {
        var errors = req.flash('error');
        res.render('changePassword', {
            error: errors
        });
    });
    //ADD PASSWORD CHANGE ROUTE
    app.post('/changePassword', function(req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                Account.findOne({
                    email: req.body.email
                }, function(err, user) {
                    if (!user) {
                        req.flash('error', 'No account with that email address exists.');
                        return res.redirect('/changePassword');
                    }
                    req.flash('error', 'An email has been sent to your address');
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'SendGrid',
                    auth: {
                        user: 'DarthSwedo',
                        pass: '123azerty'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'noreply@Tapio.com',
                    subject: 'Tapio Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/changePassword');
        });
    });
    app.get('/reset/:token', function(req, res) {
        Account.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }, function(err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/changePassword');
            }
            res.render('reset', {
                user: req.user
            });
        });
    });
    app.post('/reset/:token', function(req, res) {
        async.waterfall([
            function(done) {
                Account.findOne({
                    resetPasswordToken: req.params.token,
                    resetPasswordExpires: {
                        $gt: Date.now()
                    }
                }, function(err, user) {
                    if (!user) {
                        req.flash('error', 'Password reset token is invalid or has expired.');
                        return res.redirect('back');
                    }

                    user.setPassword(req.body.password, function(error) {
                        if (error) {
                            res.render('error');
                        } else {
                            user.resetPasswordToken = undefined;
                            user.resetPasswordExpires = undefined;

                            user.save(function(err) {
                                req.logIn(user, function(err) {
                                    done(err, user);
                                });
                            });
                        }
                    });

                });
            },
            function(user, done) {
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'SendGrid',
                    auth: {
                        user: 'DarthSwedo',
                        pass: '123azerty'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'noreply@Tapio.com',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    req.flash('success', 'Success! Your password has been changed.');
                    done(err);
                });
            }
        ], function(err) {
            res.redirect('/');
        });
    });
};
