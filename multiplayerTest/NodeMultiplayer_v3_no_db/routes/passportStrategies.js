const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleStrategy = require('passport-google-oauth2');
const jwt = require('jsonwebtoken');
var config = require('../oauthCredentials.js');
var Account = require('../models/account');

module.exports = function(app) {
    // Passport Strategies
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL,
            profileFields: ['id', 'emails','displayName', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
        },
        function(accessToken, refreshToken, profile, done) {
            Account.findOne({
                socialLoginId: profile.id
            }, function(err, user) {
                if (err) {
                    console.log(err);
                }
                if (!err && user !== null) {
                    done(null, user);
                } else {
                    account = new Account({
                        username: "" + profile.id,
                        email: 'iseeyou4ever@me.com',
                        socialUsername: profile.displayName,
                        socialLoginId: profile.id,
                        created: Date.now(),
                        authenticationMethod: "Facebook",
                        facebokToken: accessToken
                    });
                    console.log("Your email adress is : " + profile.emails[0].value);
                    console.log("Your username is : " + profile.displayName);
                    account.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("saving user");
                            done(null, user);
                        }
                    })
                }
            })
        }
    ));

    passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret
    }, function(accessToken, refreshToken, profile, done) {
        Account.findOne({
            socialLoginId: profile.id
        }, function(err, user) {
            if (err) {
                console.log("first error: " + err);
            }
            if (!err && user !== null) {
                done(null, user);
            }else {
                account = new Account({
                    username: "" + profile.id,
                    socialUsername: profile.displayName,
                    socialLoginId: profile.id,
                    created: Date.now(),
                    authenticationMethod: "Facebook-token",
                    facebokToken: accessToken
                });
                var token = account.token;
                console.log("passport-token: " + token);
                if (token === "null") {
                    token = jwt.sign(account, 'ilovechocolate', {
                        expiresIn: 1440
                    });
                    account.token = token;
                }

                account.save(function (err) {
                    if (err) {
                        console.log("second error: " + err);
                    }else {
                        console.log("saving user");
                        done(null, user);
                    }
                })
            }
        })
    }))

    passport.use(new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackURL,
            passReqToCallback: true
        },
        function(request, accessToken, refreshToken, profile, done) {
            Account.findOne({
                socialLoginId: profile.id
            }, function(err, user) {
                if (err) {
                    console.log(err);
                }
                if (!err && user !== null) {
                    done(null, user);
                } else {
                    account = new Account({
                        username: "" + profile.id,
                        socialUsername: profile.displayName,
                        socialLoginId: profile.id,
                        created: Date.now(),
                        authenticationMethod: "Google"
                    });
                    account.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("saving user");
                            done(null, user);
                        }
                    })
                }
            })
        }
    ));

    app.get('/auth/facebook',
        passport.authenticate('facebook',{scope:['email']}),
        function(req, res) {
            res.redirect('/');
        });

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/',
            successRedirect: '/'
        }),
        function(req, res) {
            res.redirect('/');
        });

    app.get('/auth/facebook/token',
        passport.authenticate('facebook-token'),
        function(req, res) {
            var token = "null";
            if (req.user.token !== "null") {
                token = req.user.token
            }
            if (req.user) {
                res.status(200).send({"token":token});
            }else {
                res.status(400);
            }
            // res.send(req.user ? 200 : 400);
        }
    )

    app.get('/auth/google',
        passport.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/plus.login'
            ]
        })
    );

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/'
        }),
        function(req, res) {
            res.redirect('/');
        });
};
