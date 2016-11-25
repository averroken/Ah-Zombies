const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
var Account = require('./models/account');
var express = require('express');
var rootRoutes = require('./routes/rootRoutes.js');
// var testRoutes = express.Router();

// TODO: add password change route
// TODO: make sure users don't register with empty password
// TODO: token verieferen en routes uitbreiden (Brian)

module.exports = function(app) {
    app.use('/api', rootRoutes);
    require('./routes/rootRoutes')(app);
    require('./routes/passportStrategies')(app);

    app.use(function(req, res, next) {
        res.status(404);
        res.render('404', {});
    });

    app.use(function(req, res, next) {
        res.status(403);
        res.render('403', {});
    });
};
