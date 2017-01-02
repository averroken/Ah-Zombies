var express = require('express');
var app = express();
var serv = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(serv, {
    httpCompression: true
});
var compression = require('compression');
var port = process.env.PORT || 2000;

app.use(compression());

app.get("/", function(req, res, next) {
    res.sendFile(__dirname + "/index.html");
});

app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/dist', express.static(__dirname + '/dist'));


serv.listen(port);
console.log('server started on:' + port);

var SOCKET_LIST = {};

io.sockets.on('connection', function(socket) {
    socket.id = Math.random();
    socket.x = 100;
    socket.y = 50;
    console.log("new connection: " + socket.id);
    socket.emit('yourId', {
        id: socket.id
    });
    addToSockets(socket, socket.id);
    sendAllBuddies(socket);

    socket.on('disconnect', function() {
        io.sockets.emit('deleteBuddy', {
            id: socket.id
        });
        deleteFromSockets(socket.id);
        console.log("disconnect | id disconnected: " + socket.id);
    });
});

function addToSockets(socket, id) {
    if (!SOCKET_LIST[id]) {
        socket.broadcast.emit("newBuddy", {
            id: id
        });
        SOCKET_LIST[socket.id] = socket;
        countSockets();
    }
}

function deleteFromSockets(id) {
    delete SOCKET_LIST[id];
    countSockets();
}

function countSockets() {
    var count = 0;
    for (var s in SOCKET_LIST) {
        console.log(s);
        count++;
        console.log("updated size of SOCKET_LIST: " + count);
    }
}

function sendAllBuddies(socket) {
    var x = Math.random() * 1000;
    var y = Math.random() * 100;
    var count = 0;
    for (var s in SOCKET_LIST) {
        console.log("buddy id: " + s);
        console.log("x: " + x + "  ||  y: " + y);
        socket.broadcast.emit("newBuddy", {
            id: s,
            x: x + count,
            y: y + count
        });
        count += 100;
    }
}
