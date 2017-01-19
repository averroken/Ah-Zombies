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
const PORT = process.env.PORT || 6565;

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

app.use(function(req, res, next) {
    res.status(404);
    res.render('404', {});
});


var SOCKET_LIST = {};
var PLAYER_LIST ={};

var ENEMY_LIST={
    room_1: {},
    room_2: {},
    room_3: {},
    room_4: {},
    room_5: {},
    room_6: {},
    room_7: {},
    room_8: {},
};
// var ENEMY_LIST_ROOM1 ={};
// var ENEMY_LIST_ROOM2 ={};
// var ENEMY_LIST_ROOM3 ={};
// var ENEMY_LIST_ROOM4 ={};
// var ENEMY_LIST_ROOM5 ={};
// var ENEMY_LIST_ROOM6 ={};
// var ENEMY_LIST_ROOM7 ={};
// var ENEMY_LIST_ROOM8 ={};

var ITEM_LIST_ROOM1 ={};
var ITEM_LIST_ROOM2 ={};
var ITEM_LIST_ROOM3 ={};
var ITEM_LIST_ROOM4 ={};
var ITEM_LIST_ROOM5 ={};
var ITEM_LIST_ROOM6 ={};
var ITEM_LIST_ROOM7 ={};
var ITEM_LIST_ROOM8 ={};
var notConnected = true;


io.on('connection', function(socket) {
    notConnected = false;
    console.log("CONNECTED!");
    socket.x = 100;
    socket.y = 50;
    socket.emit('yourId', socket.id);
    console.log("new connection: " + socket.id);
    socket.on('setItemList', function(items, room) {
        console.log("set room:" + room);
        // console.log("set items: "+ITEM_LIST.length);
        switch(room) {
            case "room_1":
                ITEM_LIST_ROOM1=items;
                break;
            case "room_2":
                ITEM_LIST_ROOM2=items;
                break;
            case "room_3":
                ITEM_LIST_ROOM3=items;
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
    });

    socket.on('updateItemList', function(items, room) {
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
    // socket.on('updateEnemyList', function(zombies, room) {
    //     console.log("update room:" + room);
    //     switch(room) {
    //         case "room_1":
    //             ENEMY_LIST_ROOM1=items;
    //             socket.broadcast.emit('updateItems', ENEMY_LIST_ROOM1, room);
    //             console.log("room_1: " + ENEMY_LIST_ROOM1.length);
    //             break;
    //         case "room_2":
    //             ENEMY_LIST_ROOM2=items;
    //             socket.broadcast.emit('updateItems', ENEMY_LIST_ROOM2, room);
    //             console.log("room_2: " + ENEMY_LIST_ROOM2.length);
    //             break;
    //         case "room_3":
    //             ENEMY_LIST_ROOM3=items;
    //             console.log("room_3: " + ENEMY_LIST_ROOM3.length);
    //             socket.broadcast.emit('updateItems', ENEMY_LIST_ROOM3, room);
    //             break;
    //         case "room_4":
    //             ENEMY_LIST_ROOM4=items;
    //             socket.broadcast.emit('updateItems', ENEMY_LIST_ROOM4, room);
    //             break;
    //         case "room_5":
    //             ENEMY_LIST_ROOM5=items;
    //             socket.broadcast.emit('updateItems', ENEMY_LIST_ROOM5, room);
    //             break;
    //         case "room_6":
    //             ENEMY_LIST_ROOM6=items;
    //             socket.broadcast.emit('updateItems', ENEMY_LIST_ROOM6, room);
    //             break;
    //         case "room_7":
    //             ENEMY_LIST_ROOM7=items;
    //             socket.broadcast.emit('updateItems', ENEMY_LIST_ROOM7, room);
    //             break;
    //         case "room_8":
    //             ENEMY_LIST_ROOM8=items;
    //             socket.broadcast.emit('updateItems', ENEMY_LIST_ROOM8, room);
    //             break;
    //     }
    // });
    addToSockets(socket, socket.id);

    socket.on('initMap', function(){
        console.log(ITEM_LIST_ROOM1);
        socket.emit("setNewMap", ITEM_LIST_ROOM1, ENEMY_LIST["room_1"]);
    });

    socket.on('changeMap', function(room, id){
        console.log("get room:" + room);
        PLAYER_LIST[id].map=room;
        socket.broadcast.emit("newPlayer", {x: PLAYER_LIST[id].x, y: PLAYER_LIST[id].y, id: PLAYER_LIST[id].id, map: PLAYER_LIST[id].map});
        switch(room) {
            case "room_1":
                socket.emit("setMap", ITEM_LIST_ROOM1, room);
                break;
            case "room_2":
                socket.emit("setMap", ITEM_LIST_ROOM2, room);
                break;
            case "room_3":
                socket.emit("setMap", ITEM_LIST_ROOM3, room);
                break;
            case "room_4":
                socket.emit("setMap", ITEM_LIST_ROOM4, room);
                break;
            case "room_5":
                socket.emit("setMap", ITEM_LIST_ROOM5, room);
                break;
            case "room_6":
                socket.emit("setMap", ITEM_LIST_ROOM6, room);
                break;
            case "room_7":
                socket.emit("setMap", ITEM_LIST_ROOM7, room);
                break;
            case "room_8":
                socket.emit("setMap", ITEM_LIST_ROOM8, room);
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

    socket.on('setEnemyLocation', function(enemy){
        console.log("set Enemy x" +ENEMY_LIST[enemy.map][enemy.id].x);
        ENEMY_LIST[enemy.map][enemy.id].x=enemy.x;
        ENEMY_LIST[enemy.map][enemy.id].y=enemy.y;
    });
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
    let length =Object.keys(SOCKET_LIST).length;
    if(length==0) notConnected= true;
    console.log("updated size of PLAYER_LIST: " + length);
}

function countPlayers() {
    let length =Object.keys(PLAYER_LIST).length;
    console.log("updated size of PLAYER_LIST: " + length);
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

var Enemy =function (id,map,enemylist) {
    var self=
    {
        id: id,
        map: map,
        x: 0,
        y: 0,
        spd: 2
    };
    enemylist[id] = self;
    // console.log("New Enemy List: "+enemylist[id].map);
    // console.log(ENEMY_LIST.room_1)

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

    socket.on('getPlayersAndEnemies', function(room) {
        console.log(PLAYER_LIST);
        console.log(ENEMY_LIST[room]);
        socket.emit('sendPlayersAndEnemies', PLAYER_LIST, ENEMY_LIST[room]);
    });

    socket.on('moveMyPlayer', function(player) {
        // console.log(player.x);
        // console.log(player);
        //console.log(PLAYER_LIST);
        //console.log(player.map);
        // console.log(PLAYER_LIST[player.id].x);
        // console.log(player.x);
        if (PLAYER_LIST[player.id] === undefined) return;
        if(PLAYER_LIST[player.id].x !== player.x || PLAYER_LIST[player.id].y !== player.y) {
            PLAYER_LIST[player.id].x = player.x;
            PLAYER_LIST[player.id].y = player.y;
            PLAYER_LIST[player.id].map = player.map;
            // console.log("moving player " +player.id);
            // console.log(player);
            //console.log(PLAYER_LIST);
            socket.broadcast.emit('movePlayerByOtherPlayers', player);
        }
    });
};

Enemy.onCreate = function () {
    if(notConnected)return;
    // if(SOCKET){
    let id = (function () {
        return '_' + Math.random().toString(36).substr(2, 9);
    })();

    for (let i = 8; i > 0; i--) {
        let currentRoom = "room_" + i;
        if (Object.keys(ENEMY_LIST[currentRoom]).length <= 5) addEnemy(ENEMY_LIST[currentRoom], currentRoom);
    }

    function addEnemy(ENEMY_LIST_ROOM, room) {
            console.log("currentListEnemies:" + ENEMY_LIST_ROOM);
            console.log("currentListEnemiesLength:" + Object.keys(ENEMY_LIST_ROOM).length);

            console.log("add enemy");
            let enemy = new Enemy(id, room, ENEMY_LIST_ROOM);
        io.emit("newEnemy", {
                id: enemy.id,
                map: enemy.map
            });
     }
    // }
};

function moveEnemyToPlayer(){
    if(notConnected)return;
    // console.log(Object.keys(ENEMY_LIST.room_1).length);

    for(let enemy in ENEMY_LIST.room_1){
        if(ENEMY_LIST.room_1[enemy].x != 0 || ENEMY_LIST.room_1[enemy].y !=0) checkClosestplayer(ENEMY_LIST.room_1[enemy]);
    }
    for(let enemy in ENEMY_LIST.room_2){
        if(ENEMY_LIST.room_2[enemy].x != 0 || ENEMY_LIST.room_2[enemy].y !=0) checkClosestplayer(ENEMY_LIST.room_2[enemy]);
    }
    for(let enemy in ENEMY_LIST.room_3){
        if(ENEMY_LIST.room_3[enemy].x != 0 || ENEMY_LIST.room_3[enemy].y !=0) checkClosestplayer(ENEMY_LIST.room_3[enemy]);
    }
    for(let enemy in ENEMY_LIST.room_4){
        if(ENEMY_LIST.room_4[enemy].x != 0 || ENEMY_LIST.room_4[enemy].y !=0) checkClosestplayer(ENEMY_LIST.room_4[enemy]);
    }
    for(let enemy in ENEMY_LIST.room_5){
        if(ENEMY_LIST.room_5[enemy].x != 0 || ENEMY_LIST.room_5[enemy].y !=0) checkClosestplayer(ENEMY_LIST.room_5[enemy]);
    }
    for(let enemy in ENEMY_LIST.room_6){
        if(ENEMY_LIST.room_6[enemy].x != 0 || ENEMY_LIST.room_6[enemy].y !=0) checkClosestplayer(ENEMY_LIST.room_6[enemy]);
    }
    for(let enemy in ENEMY_LIST.room_7){
        if(ENEMY_LIST.room_7[enemy].x != 0 || ENEMY_LIST.room_7[enemy].y !=0) checkClosestplayer(ENEMY_LIST.room_7[enemy]);
    }
    for(let enemy in ENEMY_LIST.room_8){
        if(ENEMY_LIST.room_8[enemy].x != 0 || ENEMY_LIST.room_8[enemy].y !=0) checkClosestplayer(ENEMY_LIST.room_8[enemy]);
    }
}

function checkClosestplayer(enemy){
    var diffX=1000;
    var diffY=1000;
    // console.log(Object.keys(PLAYER_LIST).length);
    // console.log(PLAYER_LIST);

    for(let playerId in PLAYER_LIST){
        //console.log(PLAYER_LIST[playerId].map);
        // console.log(enemy.map);
        if(PLAYER_LIST[playerId].map==enemy.map) {
            var playerXPos = PLAYER_LIST[playerId].x;
            var playerYPos = PLAYER_LIST[playerId].y;
            // console.log(playerXPos);
            // console.log(playerYPos);

            var newdiffX = playerXPos - Math.round(enemy.x);
            var newdiffY = playerYPos - Math.round(enemy.y);

            if (Math.abs(newdiffY) < Math.abs(diffX)) diffX = newdiffX;
            if (Math.abs(newdiffY) < Math.abs(diffY)) diffY = newdiffY;
        }
    }
    // console.log(diffX);
    // console.log(diffY);
    if(diffX != 1000 && diffY !=1000) {
        if (diffX > 1) enemy.x += enemy.spd;
        if (diffX < -1) enemy.x -= enemy.spd;
        if (diffY > 1) enemy.y += enemy.spd;
        if (diffY < -1) enemy.y -= enemy.spd;
    }
    io.emit("updateEnemy", {
        id: enemy.id,
        map: enemy.map,
        x: enemy.x,
        y: enemy.y
    });
}
    setInterval(function(){ Enemy.onCreate()}, 2000);
    setInterval(function () {moveEnemyToPlayer()}, 60);


/****************************
 *                          *
 *      START SERVER        *
 *                          *
 ****************************/
server.listen(PORT, function() {
    console.log('Server started on: localhost:' + PORT);
});