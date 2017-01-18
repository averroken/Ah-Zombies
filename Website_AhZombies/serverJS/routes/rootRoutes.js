const passport = require('passport');
const bodyParser = require('body-parser');
var Account = require('../models/account');
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
    /****************************
     *                          *
     *       PAGE ROUTES        *
     *                          *
     ****************************/
    app.get('/', function (req, res) {
        var user = req.user;
        var info = req.info;
        // console.log(user);
        res.render('index', {user: user, info: info});
    });

    app.get('/index.html', function (req, res) {
        res.render('index');
    });

    app.get('/game', function (req, res) {
        res.render('game', {
            user: {
                username: "Antoon"
            }
        });
    });

    app.get('/contact', function (req, res) {
        res.render('contact', {
            user: req.user
        });
    });

    // app.get('/index.html', function (req, res) {
    //     res.render('index');
    // });

    // io.on('connection', function (socket) {
    //     console.log('a user connected');
    //     socket.on('disconnect', function () {
    //         console.log('user disconnected');
    //     });
    //
    //     socket.on('chat message', function (message) {
    //         console.log("qdfqsfq");
    //         socket.emit('chat message', message);
    //     })
    // });
};