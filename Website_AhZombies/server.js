/****************************
 *                          *
 *      DEPENDENCIES        *
 *                          *
 ****************************/
const http = require('http');
const express = require('express');
// const app = require('express')();
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const compression = require('compression');
const morgan = require('morgan'); //logger
const errorHandler = require('errorhandler');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const methodOverride = require('method-override');
const expressSession = require('express-session');
const flash = require('connect-flash');
const PORT = process.env.PORT || 3000;

/****************************
 *                          *
 *       APP SETUP          *
 *                          *
 ****************************/
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: false});
// app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(cookieParser('ilovechocolate'));
app.use(expressSession({
    secret: 'ilovechocolate',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(compression());
app.use(flash());

app.use('/public', express.static('public'));
app.use('/pages', express.static('pages'));
// app.use('/public/css', express.static('public/css'));
// app.use('/pages', express.static('pages'));

/****************************
 *                          *
 *     DEPLOYMENT CHECK     *
 *                          *
 ****************************/
//enviroment check (change for final deploy on heroku)
var enviroment = process.env.NODE_ENV || 'development';
if (enviroment == 'development') {
    app.use(errorHandler({dumpExceptions: true, showStack: true}));
}else if (enviroment == 'production') {
    app.use(errorHandler());
}

/****************************
 *                          *
 *     ACCOUNT CONFIG       *
 *                          *
 ****************************/
//Needed account functions
var Account = require('./serverJS/models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

/****************************
 *                          *
 *     MONGOOSE CONFIG      *
 *                          *
 ****************************/
//solving deprecated warning
mongoose.Promise = global.Promise;

//connecting to database
mongoose.connect('mongodb://localhost:27017/ZOMBIES');
// mongoose.connect(process.env.MONGODB_URI);

/****************************
 *                          *
 *      ROUTE CONFIG        *
 *                          *
 ****************************/
require('./serverJS/routes/rootRoutes')(app);
require('./serverJS/routes/accountRoutes')(app);

app.use(function(req, res, next) {
    res.status(404);
    res.render('404', {});
});

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('chat message', function(message) {
        console.log("qdfqsfq");
        socket.emit('chat message', message);
    });

    socket.on('chat message', function(message) {
        console.log("message: " + message);
        io.emit('message', message);
    })
});


/****************************
 *                          *
 *      START SERVER        *
 *                          *
 ****************************/
server.listen(PORT, function() {
    console.log('Server started on: localhost:' + PORT);
});