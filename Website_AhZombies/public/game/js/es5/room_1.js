'use strict';

var TopDownGame = TopDownGame || {};
var result;

TopDownGame.room_1 = function () {};

TopDownGame.room_1.prototype = {
    create: function create() {
        this.createMap();
        this.map.addTilesetImage('cute_lpc', 'dungeonTiles');
        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        this.map.setCollisionBetween(1, 2000, true, 'blockedLayer');

        this.backgroundlayer.resizeWorld();

        this.count = 0;

        // var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');
        result = this.findSpawnPoint('playerStart', this.map, 'objectsLayer', this.position);

        this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
        this.player.id = Player.Id;
        console.log("My id: " + Player.Id);

        socket.emit('getPlayers');

        console.log(Player.Map);

        socket.emit("moveMyPlayer", {
            id: this.player.id,
            x: this.player.x,
            y: this.player.y,
            map: Player.Map
        });
        this.player.velocity = 75;

        this.game.physics.arcade.enable(this.player);

        this.game.camera.follow(this.player);

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        this.game.input.onDown.add(this.gofull, this);

        this.createItems();
        this.createDoors();
    },
    gofull: function gofull() {
        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        } else {
            this.game.scale.startFullScreen(false);
        }
    },
    createMap: function createMap() {
        this.map = this.game.add.tilemap('room_1');
        if (!this.position) this.position = "down";
    },
    createItems: function createItems() {
        console.log(this.map);
        this.items = this.game.add.group();
        this.items.enableBody = true;
        var item;
        console.log(items.length);
        if (!(items.length >= 0)) {
            console.log("length new: :" + items.length);
            result = this.findObjectsByType('item', this.map, 'objectsLayer');
            items = result;
            socket.emit("setItemList", items, this.map.key);
        } else console.log(items.length);
        console.log(this.items.length);
        items.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
        console.log(this.items.length);
    },
    createDoors: function createDoors() {
        this.doors = this.game.add.group();
        this.doors.enableBody = true;
        result = this.findObjectsByType('door', this.map, 'objectsLayer');

        result.forEach(function (element) {
            this.createFromTiledObject(element, this.doors);
        }, this);
    },
    findSpawnPoint: function findSpawnPoint(type, map, layer, spawnPosition) {
        var result = new Array();
        if (result.length < 0) return;
        map.objects[layer].forEach(function (element) {
            var offset = 0;
            if (element.properties.offset != undefined) {
                offset = element.properties.offset;
            }
            if (element.properties.spawnPoint === spawnPosition) {
                console.log("-------> spawn point found");
            } else {
                console.log("-------> spawn NOT point found --------------");
                return;
            }
            if (element.properties.type === type) {
                element.y -= map.tileHeight + 45 + offset;
                result.push(element);
            }
        });
        return result;
    },
    findObjectsByType: function findObjectsByType(type, map, layer) {
        var result = new Array();
        if (result.length < 0) return;
        map.objects[layer].forEach(function (element) {
            var offset = 0;
            if (element.properties.offset != undefined) {
                offset = element.properties.offset;
            }
            if (element.properties.type === type) {
                element.y -= map.tileHeight + 45 + offset;
                result.push(element);
            }
        });
        return result;
    },
    createFromTiledObject: function createFromTiledObject(element, group) {
        var sprite = group.create(element.x, element.y, element.properties.sprite);

        Object.keys(element.properties).forEach(function (key) {
            sprite[key] = element.properties[key];
        });
    },
    collect: function collect(player, collectable) {
        console.log(this.map);
        var Map = this.map;
        if (collectable.sprite == 'bluecup' || collectable.sprite == 'greencup') {
            player.velocity = 100;
        }
        collectable.destroy();
        items.forEach(function (element) {
            if (element.x === collectable.position.x && element.y === collectable.position.y) {
                var index = items.indexOf(element);
                items.splice(index, 1);
                console.log(items.length);
                console.log(Map.key);
                socket.emit("updateItemList", items, Map.key);
            }
        });
        // socket.emit("updateItemList", items);
    },
    enterDoor: function enterDoor(player, door) {
        var targetRoom = door.targetTileMap.split('|');
        console.log('entering the door');
        console.log('targetTileMap: ' + targetRoom[0]);
        socket.emit('changeMap', targetRoom[0], Player.Id);
        TopDownGame.game.state.start(targetRoom[0]);
        console.log('entering the door');
        console.log('targetTileMap: ' + targetRoom[0]);
        console.log('targetSpawnPoint: ' + targetRoom[1]);

        if (targetRoom[0] !== "mini_game") TopDownGame.game.state.states[targetRoom[0]].position = targetRoom[1];
        TopDownGame.game.state.start(targetRoom[0]);
    },
    update: function update() {
        // console.log(this.count);
        var boolMoved = false;
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;

        if (this.cursors.up.isDown) {
            this.player.body.velocity.y -= this.player.velocity;
            boolMoved = true;
        } else if (this.cursors.down.isDown) {
            this.player.body.velocity.y += this.player.velocity;
            boolMoved = true;
        }
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x -= this.player.velocity;
            boolMoved = true;
        } else if (this.cursors.right.isDown) {
            this.player.body.velocity.x += this.player.velocity;
            boolMoved = true;
        }

        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
        this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);
        if (boolMoved) {
            this.count++;
            if (this.count % 2 == 0) {
                // console.log(this.count);
                socket.emit("moveMyPlayer", {
                    id: this.player.id,
                    x: this.player.x,
                    y: this.player.y,
                    map: Player.Map
                });
            }
        }
    }
};