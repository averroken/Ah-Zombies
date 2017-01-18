var TopDownGame = TopDownGame || {};
var result;

TopDownGame.room_1 = function () {
};

var button;
var popup;
var tween = null;

TopDownGame.room_1.prototype = {
    create: function () {
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
        // console.log("My id: " + Player.Id);

        socket.emit('getPlayers');

        // console.log(Player.Map);

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

        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.game.input.onDown.add(this.gofull, this);

        this.popup = this.game.add.sprite(this.game.width-300,150,'popup');
        this.popup.fixedToCamera = true;
        this.popup.alpha = 0.8;
        this.popup.anchor.set(0.5);

        var pw = (this.popup.width / 2) - 30;
        var ph = (this.popup.height / 2) - 8;

        this.closeButton = this.add.button(pw, -ph, 'close', this.closeWindow, this, 0, 0, 0, 0);

        this.popup.addChild(this.closeButton);

        this.popup.scale.set(0);

        this.createItems();
        this.createDoors();
        this.addGamePad();
        this.addButtons();
    },
    gofull: function () {
        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        }
        else {
            this.game.scale.startFullScreen(false);
        }
    },
    enableJoysticks: function () {
        this.joystick.enabled = (!this.joystick.enabled);
        this.joystick.visible = (!this.joystick.visible);
        this.button.visible = (!this.button.visible);
        this.gamepad.joystickPad.visible = (!this.gamepad.joystickPad.visible);
        // console.log(this.joystick);
        // console.log(this.gamepad);
    },
    createMap: function () {
        this.map = this.game.add.tilemap('room_1');
        if (!this.position) this.position = "down";
    },
    createItems: function () {
        console.log(this.map);
        this.items = this.game.add.group();
        this.items.enableBody = true;
        var item;
        // console.log(items.length);
        if (!(items.length >= 0)) {
            // console.log("length new: :" + items.length);
            result = this.findObjectsByType('item', this.map, 'objectsLayer');
            items = result;
            socket.emit("setItemList", items, this.map.key);
        }
        else console.log(items.length);
        // console.log(this.items.length);
        items.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
        // console.log(this.items.length);
    },
    createDoors: function () {
        this.doors = this.game.add.group();
        this.doors.enableBody = true;
        result = this.findObjectsByType('door', this.map, 'objectsLayer');

        result.forEach(function (element) {
            this.createFromTiledObject(element, this.doors);
        }, this);
    },
    addGamePad: function () {
        // console.log("gamepad added");
        // Add the VirtualGamepad plugin to the game
        this.gamepad = this.game.plugins.add(Phaser.Plugin.VirtualGamepad);

        // Add a joystick to the game (only one is allowed right now)
        this.joystick = this.gamepad.addJoystick(50, this.game.height - 50, 0.5, 'gamepad');

        // Add a button to the game (only one is allowed right now)
        this.button = this.gamepad.addButton(this.game.width - 50, this.game.height - 50, 0.5, 'gamepad');

        this.joystick.enabled = true;

        // console.log(this.joystick);
    },
    addButtons: function () {
        this.buttons = this.game.add.group();

        this.fullScreenButton = this.add.button(this.game.width - 25, 5, 'fullScreenButton', this.gofull, this, 0, 0, 0, 0, this.buttons);
        this.fullScreenButton.fixedToCamera = true;

        this.joystickButton = this.add.button(this.game.width - 25, 30, 'joystickButton', this.enableJoysticks, this, 0, 0, 0, 0, this.buttons);
        this.joystickButton.fixedToCamera = true;

        this.joystickButton = this.add.button(this.game.width - 25, 60, 'button', this.openWindow, this, 0, 0, 0, 0, this.buttons);
        this.joystickButton.fixedToCamera = true;

        this.game.world.bringToTop(this.buttons);
    },
    openWindow: function () {
        console.log("Hallo popup");
        if ((tween !== null && tween.isRunning) || this.popup.scale.x === 1)
        {
            //this.game.backgroundOpacity = 0.7;
            return;
        }

        //  Create a tween that will pop-open the window, but only if it's not already tweening or open
        tween = this.game.add.tween(this.popup.scale).to( { x: 0.5, y: 0.5 }, 1000, Phaser.Easing.Elastic.Out, true);
        this.game.world.bringToTop(this.popup);
        this.popup.visible = true;
    },
    closeWindow: function () {
        console.log("------------CLOSE----------");
        if (tween && tween.isRunning || this.popup.scale.x === 0.1)
        {
            return;
        }
        //  Create a tween that will close the window, but only if it's not already tweening or closed
        tween = this.game.add.tween(this.popup.scale).to( { x: 0, y: 0}, 500, Phaser.Easing.Elastic.In, true);
    },
    findSpawnPoint: function (type, map, layer, spawnPosition) {
        var result = new Array();
        if (result.length < 0) return;
        map.objects[layer].forEach(function (element) {
            var offset = 0;
            if (element.properties.offset != undefined) {
                offset = element.properties.offset;
            }
            if (element.properties.spawnPoint === spawnPosition) {
                // console.log("-------> spawn point found")
            } else {
                // console.log("-------> spawn NOT point found --------------");
                return;
            }
            if (element.properties.type === type) {
                element.y -= map.tileHeight + 45 + offset;
                result.push(element);
            }
        });
        return result;
    },
    findObjectsByType: function (type, map, layer) {
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
        return result;s
    },
    createFromTiledObject: function (element, group) {
        var sprite = group.create(element.x, element.y, element.properties.sprite);

        Object.keys(element.properties).forEach(function (key) {
            sprite[key] = element.properties[key];
        });
    },
    collect: function (player, collectable) {
        console.log(this.map);
        let Map = this.map;
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
    enterDoor: function (player, door) {
        let targetRoom = door.targetTileMap.split('|');
        console.log('entering the door');
        console.log('targetTileMap: ' + targetRoom[0]);
        socket.emit('changeMap', targetRoom[0], Player.Id);
        // TopDownGame.game.state.start(targetRoom[0]);
        console.log('entering the door');
        console.log('targetTileMap: ' + targetRoom[0]);
        console.log('targetSpawnPoint: ' + targetRoom[1]);

        TopDownGame.game.state.states[targetRoom[0]].position = targetRoom[1];
        TopDownGame.game.state.start(targetRoom[0]);
    },
    update: function () {
        // console.log(this.count);
        var boolMoved = false;
        if (this.joystick.enabled) this.logJoystick();
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
    },
    logJoystick: function () {
        if (this.joystick.properties.up) {
            this.cursors.up.isDown = true;
            // console.log("JOYSTICK: up");
        } else {
            this.cursors.up.isDown = false;
        }
        if (this.joystick.properties.down) {
            this.cursors.down.isDown = true;
            // console.log("JOYSTICK: down");
        } else {
            this.cursors.down.isDown = false;
        }
        if (this.joystick.properties.right) {
            this.cursors.right.isDown = true;
            // console.log("JOYSTICK: right");
        } else {
            this.cursors.right.isDown = false;
        }
        if (this.joystick.properties.left) {
            this.cursors.left.isDown = true;
            // console.log("JOYSTICK: left");
        } else {
            this.cursors.left.isDown = false;
        }
    }
};
