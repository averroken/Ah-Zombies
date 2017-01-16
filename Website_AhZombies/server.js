/****************************
 *                          *
 *      DEPENDENCIES        *
 *                          *
 ****************************/
const http = require('http');
const express = require('express');
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
app.use(morgan('dev'));
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


var SOCKET_LIST = {};
var PLAYER_LIST ={};
var ITEM_LIST_ROOM1 ={};
var ITEM_LIST_ROOM2 ={};
var ITEM_LIST_ROOM3 ={};
var ITEM_LIST_ROOM4 ={};
var ITEM_LIST_ROOM5 ={};
var ITEM_LIST_ROOM6 ={};
var ITEM_LIST_ROOM7 ={};
var ITEM_LIST_ROOM8 ={};


io.on('connection', function(socket) {
    console.log("CONNECTED!");
    socket.x = 100;
    socket.y = 50;
    console.log("new connection: " + socket.id);
    socket.on('setItemList', function(items, room) {
        console.log("set room:" + room);
        // console.log("set items: "+ITEM_LIST.length);
        switch(room) {
            case "room_1":
                ITEM_LIST_ROOM1=items;
                console.log("room_1: " + ITEM_LIST_ROOM1.length);
                break;
            case "room_2":
                ITEM_LIST_ROOM2=items;
                console.log("room_2: " + ITEM_LIST_ROOM2.length);
                break;
            case "room_3":
                ITEM_LIST_ROOM3=items;
                console.log("room_3: " + ITEM_LIST_ROOM3.length);
                break;
            case "room_4":
                ITEM_LIST_ROOM4=items;
                break;
            case "room_5":
                ITEM_LIST_ROOM5=items;
                break;
            case "room_6":
                ITEM_LIST_ROOM6=items;
                break;
            case "room_7":
                ITEM_LIST_ROOM7=items;
                break;
            case "room_8":
                ITEM_LIST_ROOM8=items;
                break;
        }

        // ITEM_LIST=items;
    });
    socket.on('updateItemList', function(items, room) {
        // console.log("update from items: "+ITEM_LIST.length);
        // ITEM_LIST=items;
        // console.log("update to items: "+ITEM_LIST.length);
        // console.log(ITEM_LIST);
        console.log("update room:" + room);

        switch(room) {
            case "room_1":
                ITEM_LIST_ROOM1=items;
                socket.broadcast.emit('updateItems', ITEM_LIST_ROOM1, room);
                console.log("room_1: " + ITEM_LIST_ROOM1.length);
                break;
            case "room_2":
                ITEM_LIST_ROOM2=items;
                socket.broadcast.emit('updateItems', ITEM_LIST_ROOM2, room);
                console.log("room_2: " + ITEM_LIST_ROOM2.length);
                break;
            case "room_3":
                ITEM_LIST_ROOM3=items;
                console.log("room_3: " + ITEM_LIST_ROOM3.length);
                socket.broadcast.emit('updateItems', ITEM_LIST_ROOM3, room);
                break;
            case "room_4":
                ITEM_LIST_ROOM4=items;
                socket.broadcast.emit('updateItems', ITEM_LIST_ROOM4, room);
                break;
            case "room_5":
                ITEM_LIST_ROOM5=items;
                socket.broadcast.emit('updateItems', ITEM_LIST_ROOM5, room);
                break;
            case "room_6":
                ITEM_LIST_ROOM6=items;
                socket.broadcast.emit('updateItems', ITEM_LIST_ROOM6, room);
                break;
            case "room_7":
                ITEM_LIST_ROOM7=items;
                socket.broadcast.emit('updateItems', ITEM_LIST_ROOM7, room);
                break;
            case "room_8":
                ITEM_LIST_ROOM8=items;
                socket.broadcast.emit('updateItems', ITEM_LIST_ROOM8, room);
                break;
        }
    });
    addToSockets(socket, socket.id);
    socket.emit('yourId', socket.id);

    socket.on('initMap', function(){
        console.log(ITEM_LIST_ROOM1);
        socket.emit("setNewMap", ITEM_LIST_ROOM1);
    });

    socket.on('changeMap', function(room, id){
        console.log("get room:" + room);
        PLAYER_LIST[id].map=room;
        socket.broadcast.emit("newPlayer", {x: PLAYER_LIST[id].x, y: PLAYER_LIST[id].y, id: PLAYER_LIST[id].id, map: PLAYER_LIST[id].map});
        switch(room) {
            case "room_1":
                socket.emit("setMap", PLAYER_LIST, ITEM_LIST_ROOM1, room);
                console.log("room_1: " + ITEM_LIST_ROOM1.length);
                break;
            case "room_2":
                socket.emit("setMap", PLAYER_LIST, ITEM_LIST_ROOM2, room);
                console.log("room_2: " + ITEM_LIST_ROOM2.length);
                break;
            case "room_3":
                socket.emit("setMap", PLAYER_LIST, ITEM_LIST_ROOM3, room);
                console.log("room_3: " + PLAYER_LIST, ITEM_LIST_ROOM3.length);
                break;
            case "room_4":
                socket.emit("setMap", PLAYER_LIST, ITEM_LIST_ROOM4, room);
                break;
            case "room_5":
                socket.emit("setMap", PLAYER_LIST, ITEM_LIST_ROOM5, room);
                break;
            case "room_6":
                socket.emit("setMap", PLAYER_LIST, ITEM_LIST_ROOM6, room);
                break;
            case "room_7":
                socket.emit("setMap", PLAYER_LIST, ITEM_LIST_ROOM7, room);
                break;
            case "room_8":
                socket.emit("setMap", PLAYER_LIST, ITEM_LIST_ROOM8, room);
                break;
        }
    });
    Player.onConnect(socket);

    socket.on('disconnect', function() {
        socket.broadcast.emit('removePlayer', socket.id);
        deleteFromSockets(socket.id);
        deleteFromPlayers(socket.id);
        console.log("disconnect | id disconnected: " + socket.id);
    });

    socket.on('chat message', function(message) {
        console.log("qdfqsfq");
        socket.emit('chat message', message);
    })
});


function addToSockets(socket, id) {
    if (!SOCKET_LIST[id]) {
        SOCKET_LIST[socket.id] = socket;
        countSockets();
    }
}

function deleteFromSockets(id) {
    delete SOCKET_LIST[id];
    countSockets();
}

function deleteFromPlayers(id){
    delete PLAYER_LIST[id];
    countPlayers();
}

function countSockets() {
    var count = 0;
    for (var s in SOCKET_LIST) {
        console.log("socket "+s);
        count++;
    }
    console.log("updated size of SOCKET_LIST: " + count);
}

function countPlayers() {
    var count = 0;
    for (var s in PLAYER_LIST) {
        console.log("player "+s);
        count++;
    }
    console.log("updated size of PLAYER_LIST: " + count);
}
var Player =function (x,y,id,map) {
    var self=
    {
        x: x,
        y: y,
        id: id,
        map: map
    };
    PLAYER_LIST[id] = self;
    console.log("New Player List: "+PLAYER_LIST[id].map);

    return self;
};

Player.onConnect = function (socket) {
    console.log("add player");
    var player = new Player(100, 50, socket.id, "room_1");
    countPlayers();
    // console.log("id "+player.id);
    socket.broadcast.emit("newPlayer", {
        x: player.x,
        y: player.y,
        id: player.id,
        map: player.map
    });

    socket.on('getPlayers', function() {
        console.log("getPlayers: "+PLAYER_LIST);
        socket.emit('sendPlayers', PLAYER_LIST);
    });

    socket.on('moveMyPlayer', function(player) {
        // console.log(player.x);
        // console.log(player);
        console.log(PLAYER_LIST);
        console.log(player.map);
        // console.log(PLAYER_LIST[player.id].x);
        // console.log(player.x);
        if (PLAYER_LIST[player.id] === undefined) return;
        if(PLAYER_LIST[player.id].x !== player.x || PLAYER_LIST[player.id].y !== player.y) {
            PLAYER_LIST[player.id].x = player.x;
            PLAYER_LIST[player.id].y = player.y;
            PLAYER_LIST[player.id].map = player.map;
            // console.log("moving player " +player.id);
            // console.log(player);
            console.log(PLAYER_LIST);
            socket.broadcast.emit('movePlayerByOtherPlayers', player);
        }
    });
};


/****************************
 *                          *
 *      START SERVER        *
 *                          *
 ****************************/
server.listen(PORT, function() {
    console.log('Server started on: localhost:' + PORT);
});