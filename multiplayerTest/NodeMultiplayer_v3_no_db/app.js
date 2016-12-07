// var mongojs = require('mongojs');
var db = null; //('localhost:27017/myGame', ['account', 'progress']);

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var profiler = require('v8-profiler');
var fs = require('fs');
var io = require('socket.io')(serv, {});

var frameCount = 0;
var SOCKET_LIST = {};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);

console.log('server started');

var Entity = function (param) {
    var self = {
        x: 250,
        y: 250,
        spdX: 0,
        spdY: 0,
        id: "",
        map: 'forest'
    };

    if (param) {
        if (param.x) self.x = param.x;
        if (param.y) self.y = param.y;
        if (param.map) self.map = param.map;
        if (param.id) self.id = param.id;
        if(param.category) self.category=param.category;
    }

    self.update = function () {
        self.updatePosition();
    };
    self.updatePosition = function () {
        self.x += self.spdX;
        self.y += self.spdY;
    };
    self.getDistance = function (pt) {
        return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2))
    };
    return self;
};

//#region "Player"

var Player = function (param) {
    var self = Entity(param);
    self.number = "" + Math.floor(10 * Math.random());
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.mouseAngle = 0;
    self.maxSpd = 10;
    self.hp = 10;
    self.hpMax = 40;
    self.score = 0;
    self.atkSpd = 1;
    self.atkSpdCounter = 0;

    var super_update = self.update;

    self.update = function () {
        self.updateSpd();
        super_update();
        self.atkSpdCounter += self.atkSpd;

        if (self.pressingAttack) {
            self.shootBullet(self.mouseAngle);
        }
    };

    self.shootBullet = function(angle){
        if(self.atkSpdCounter > 25){	//every 1 sec
            self.atkSpdCounter = 0;
            self.generate(angle);
        }
    };

    self.generate = function (angle) {
        Bullet({
            parent: self.id,
            angle: angle,
            x: self.x,
            y: self.y,
            map: self.map
        });
    };

    self.updateSpd = function () {
        // console.log(self.pressingRight);
        if (self.pressingRight) {
            self.spdX = self.maxSpd;
        } else if (self.pressingLeft) {
            self.spdX = -self.maxSpd;
        } else {
            self.spdX = 0;
        }
        if (self.pressingUp) {
            self.spdY = -self.maxSpd;
        } else if (self.pressingDown) {
            self.spdY = self.maxSpd;
        } else {
            self.spdY = 0;
        }
    };

    self.getInitPack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            number: self.number,
            hp: self.hp,
            hpMax: self.hpMax,
            score: self.score,
            map: self.map
        }
    };

    self.getUpdatePack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            number: self.number,
            hp: self.hp,
            score: self.score
        }
    };

    Player.list[self.id] = self;
    initPack.player.push(self.getInitPack());
    return self;
};

Player.list = {};

Player.onConnect = function (socket) {
    var map = 'forest';
    if (Math.random() > 0.5) map = 'field';

    var player = Player({
        id: socket.id,
        map: map
    });

    socket.on('keyPress', function (data) {
        if (data.inputId === "left") {
            player.pressingLeft = data.state;
        }
        else if (data.inputId === "right") {
            player.pressingRight = data.state;
        }
        else if (data.inputId === "up") {
            player.pressingUp = data.state;
        }
        else if (data.inputId === "down") {
            player.pressingDown = data.state;
        } else if (data.inputId === "attack") {
            player.pressingAttack = data.state;
        } else if (data.inputId === "mouseAngle") {
            player.mouseAngle = data.state;
        }
    });

    socket.emit('init', {
        selfId: socket.id,
        player: Player.getAllPlayersPack(),
        bullet: Bullet.getAllBulletsPack(),
        upgrade: Upgrade.getAllUpgradesPack()
    });
};

Player.getAllPlayersPack = function () {
    var players = [];
    for (var i in Player.list) {
        players.push(Player.list[i].getInitPack());
    }
    return players;
};

Player.onDisconnect = function (socket) {
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
};

Player.update = function () {
    var pack = [];
    for (var i in Player.list) {
        var player = Player.list[i];
        player.update();
        pack.push(player.getUpdatePack());
    }
    return pack;
};

//#endregion "Player"

Actor = function(type,id,x,y,width,height,img,hp,atkSpd){
    var self = Entity(type,id,x,y,width,height,img);

    self.hp = hp;
    self.atkSpd = atkSpd;
    self.attackCounter = 0;
    self.aimAngle = 0;

    var super_update = self.update;
    self.update = function(){
        super_update();
        self.attackCounter += self.atkSpd;
    }

    self.performAttack = function(){
        if(self.attackCounter > 25){	//every 1 sec
            self.attackCounter = 0;
            generateBullet(self);
        }
    }

    self.performSpecialAttack = function(){
        if(self.attackCounter > 50){	//every 1 sec
            self.attackCounter = 0;
            /*
             for(var i = 0 ; i < 360; i++){
             generateBullet(self,i);
             }
             */
            generateBullet(self,self.aimAngle - 5);
            generateBullet(self,self.aimAngle);
            generateBullet(self,self.aimAngle + 5);
        }
    }


    return self;
};

//#region "Enemies"

var Enemy = function(id,xPos,yPos,speed,health){
    var self = Actor('enemy',id,xPos,yPos,speed,health,Img.enemy,10,1);
    enemyList[id] = self;

    var super_update = self.update;
    self.update = function(){
        super_update();
        self.updateAim();
    };

    ctx.drawImage(Img.enemy, 0, 0, Img.enemy.width, Img.enemy.height, x - width / 2, y - height / 2,
        width, height);


    self.updateAim = function(){
        var diffX = player.x - self.x;
        var diffY = player.y - self.y;

        self.aimAngle = Math.atan2(diffY,diffX) / Math.PI * 180;
    };

    self.updatePosition = function(){
        var diffX = player.x - self.x;
        var diffY = player.y - self.y;

        if(diffX > 0)
            self.x += 3;
        else
            self.x -= 3;

        if(diffY > 0)
            self.y += 3;
        else
            self.y -= 3;
    };

    self.randomlyGenerateEnemy = function(){
        //Math.random() returns a number between 0 and 1
        var xPos = Math.random()*currentMap.width;
        var yPos = Math.random()*currentMap.height;
        var speed = 64;	//between 10 and 40
        var health = 64;
        var id = Math.random();
        Enemy(id,xPos,yPos,speed,health);
    };

};


//#endregion "Enemies"

//#region "Bullet"

var Bullet = function (param) {
    var self = Entity(param);
    self.id = Math.random();
    self.spdX = Math.cos(param.angle / 180 * Math.PI) * 10;
    self.spdY = Math.sin(param.angle / 180 * Math.PI) * 10;
    self.parent = param.parent;
    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;

    self.update = function () {
        if (self.timer++ > 100) {
            self.toRemove = true;
        }
        super_update();

        for (var i in Player.list) {
            var p = Player.list[i];
            if (self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id) {
                p.hp -= 1;
                var shooter = Player.list[self.parent];

                if (p.hp <= 0) {
                    if (shooter) {
                        shooter.score += 1;
                    }
                    p.hp = p.hpMax;
                    p.x = Math.random() * 500;
                    p.y = Math.random() * 500;
                }
                self.toRemove = true;
            }
        }
    };
    self.getInitPack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            map: self.map
        }
    };
    self.getUpdatePack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y
        }
    };

    Bullet.list[self.id] = self;
    initPack.bullet.push(self.getInitPack());
    return self;
};

Bullet.list = {};

Bullet.update = function () {
    var pack = [];
    for (var i in Bullet.list) {
        var bullet = Bullet.list[i];
        bullet.update();
        if (bullet.toRemove) {
            delete Bullet.list[i];
            removePack.bullet.push(bullet.id);
        } else {
            pack.push(bullet.getUpdatePack());
        }
    }
    return pack;
};

Bullet.getAllBulletsPack = function () {
    var bullets = [];
    for (var i in Bullet.list) {
        bullets.push(Bullet.list[i].getInitPack());
    }
    return bullets;
};

//#endregion "Bullet"

//#region "Upgrade"

var Upgrade = function (param) {
    var self = Entity(param);
    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function () {
        if (self.timer++ > 100) {
            self.toRemove = true;
        }
        super_update();

        for (var i in Player.list) {
            var p = Player.list[i];
            if (self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id) {
                console.log(self.category);
                if(self.category==="health") p.hp+=5;
                else if(self.category==="atkSpd") p.atkSpd+=1;
                self.toRemove = true;
            }
        }
    };
    self.getInitPack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            category: self.category,
            map: self.map
        }
    };

    self.getUpdatePack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            category: self.category,
        }
    };

    Upgrade.list[self.id] = self;
    initPack.upgrade.push(self.getInitPack());
    return self;
};

Upgrade.list = {};

Upgrade.update = function () {
    var pack = [];
    for (var i in Upgrade.list) {
        var upgrade = Upgrade.list[i];
        upgrade.update();
        if (upgrade.toRemove) {
            delete Upgrade.list[i];
            removePack.upgrade.push(upgrade.id);
        } else {
            pack.push(upgrade.getUpdatePack());
        }
    }
    return pack;
};

Upgrade.getAllUpgradesPack = function () {
    var upgrades = [];
    for (var i in Upgrade.list) {
        upgrades.push(Upgrade.list[i].getInitPack());
    }
    return upgrades;
};

Upgrade.randomlyGeneratedUpgrade = function(){
    //Math.random() returns a number between 0 and 1
    var x = Math.random()*500;
    var y = Math.random()*500;
    var id = Math.random();
    var category;

    //randomlyGenerateEnemy();

    if(Math.random()<0.5){
        category = 'health';
    } else {
        category = 'atkSpd';
    }
    Upgrade({id:id,x:x,y:y,category:category});
};

//#endregion "Upgrade"

//#region "Account & validatie"

var isValidPassword = function (data, cb) {
    // db.account.find({username: data.username, password: data.password}, function (err, res) {
    //     if (res[0]) cb(true);
    //     else cb(false);
    // });
    cb(true);
};

var isUsernameTaken = function (data, cb) {
    // db.account.find({username: data.username}, function (err, res) {
    //     if (res[0]) cb(true);
    //     else cb(false);
    // });
    cb(false);
};

var addUser = function (data, cb) {
    // db.account.insert({username: data.username, password: data.password}, function (err) {
    //     cb();
    // });
    cb();
};

//#endregion "Account & validatie"

io.sockets.on('connection', function (socket) {
    console.log("socket connection");
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('signIn', function (data) {
        isValidPassword(data, function (res) {
            if (res) {
                Player.onConnect(socket);
                socket.emit('signInResponse', {success: true});
            } else {
                socket.emit('signInResponse', {success: false});
            }
        });
    });

    socket.on('signUp', function (data) {
        isUsernameTaken(data, function (res) {
            if (res) {
                socket.emit('signUpResponse', {success: false});
            } else {
                addUser(data, function () {
                    socket.emit('signUpResponse', {success: true});
                });
            }
        });
    });

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });

    socket.on('sendMsgToServer', function (data) {
        var playerName = ("" + socket.id).slice(2, 7);
        for (var i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
        }
    });

    socket.on('evalServer', function (data) {
        var res = eval(data);
        socket.emit('evalAnwser', res);
    })
});

var initPack = {player: [], bullet: [], upgrade: []};
var removePack = {player: [], bullet: [], upgrade: []};
var enemyPack = {id: Enemy.id, xPos: Enemy.xPos,yPos: Enemy.yPos, speed: Enemy.speed, health: Enemy.health };

setInterval(function () {
    frameCount++;
    if(frameCount > 100) {
        frameCount = 0;
        Upgrade.randomlyGeneratedUpgrade();
        Enemy.randomlyGenerateEnemy();
    }

    var pack = {
        player: Player.update(),
        bullet: Bullet.update(),
        upgrade: Upgrade.update()
    };

    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('init', initPack);
        socket.emit('update', pack);
        socket.emit('remove', removePack);
        socket.emit('enemy', enemyPack);
    }
    initPack.player = [];
    initPack.bullet = [];
    initPack.upgrade= [];
    removePack.player = [];
    removePack.bullet = [];
    removePack.upgrade = [];
}, 1000 / 25);

// var startProfiling = function (duration) {
//     profiler.startProfiling('1', true);
//     setTimeout(function () {
//         var profile1= profiler.stopProfiling('1');
//
//         profile1.export(function (err, res) {
//             fs.writeFile('./profile.cpuProfile',res);
//             profile1.delete();
//             console.log('Profile saved');
//         });
//     }, duration);
// }
//
// startProfiling(10000);