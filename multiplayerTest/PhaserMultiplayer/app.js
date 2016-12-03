// var mongojs = require('mongojs');
var db = null; //('localhost:27017/myGame', ['account', 'progress']);
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(serv, {});
var port = process.env.PORT || 2000;


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/part1.html');
});

app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

serv.listen(port);
console.log('server started on:' + port);

var SOCKET_LIST = {};

io.sockets.on('connection', function(socket) {
    // console.log("socket connection");
    socket.id = Math.random();
    socket.x = 0;
    socket.y = 0;
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

    socket.on('moveMyPlayer', function (data) {
      // console.log("moving player");
      // socket.broadcast.emit('movePlayerOnBuddy', data);

      if(SOCKET_LIST[data.id] === undefined) return;
      if (SOCKET_LIST[data.id].x === undefined || SOCKET_LIST[data.id].y === undefined) {
        SOCKET_LIST[data.id].x = data.x;
        SOCKET_LIST[data.id].y = data.y;
      }
      if (SOCKET_LIST[data.id].x !== data.x || SOCKET_LIST[data.id].y !== data.y) {
        console.log("moving player");
        socket.broadcast.emit('movePlayerOnBuddy', data);
      }
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
  for(var s in SOCKET_LIST){
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

setInterval(function() {
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.x++;
        socket.y++;
        socket.emit('newPosition', {
            x: socket.x,
            y: socket.y
        });
    }
}, 1000 / 25);
