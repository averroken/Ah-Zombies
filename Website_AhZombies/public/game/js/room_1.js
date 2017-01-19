var TopDownGame = TopDownGame || {};

TopDownGame.room_1 = function () {
};

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

        this.player = this.game.add.sprite(result[0].x, result[0].y, 'player', 10);
        this.player.id = Player.Id;
        this.player.anchor.setTo(0.45, 0.45);
        this.player.angle = 0;
        this.player.scale.setTo(0.30, 0.30);
        this.player.animations.add('walk', [3, 7, 2, 6, 1, 5], 5, true);


        //Weapon
        this.weapon = this.add.weapon(30, 'bullet');
        this.weapon.fireRate = 300;
        this.weapon.bulletSpeed = 100;
        // this.weapon.bullets.scale.setTo(0.9,0.9);
        this.weapon.trackSprite(this.player, 23, 3, true);
        firebutton = this.input.activePointer.isDown;
// x- y+
        this.cursors = this.game.input.keyboard.createCursorKeys();
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
        //this.game.input.onDown.add(this.gofull, this);

        this.createItems();
        this.createDoors();
        this.addGamePad();
        this.addButtons();
    },
    enableJoysticks: function () {
        this.joystick.enabled = (!this.joystick.enabled);
        this.joystick.visible = (!this.joystick.visible);
        this.button.visible = (!this.button.visible);
        this.gamepad.joystickPad.visible = (!this.gamepad.joystickPad.visible);
        // console.log(this.joystick);
        // console.log(this.gamepad);
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
        this.game.world.bringToTop(this.buttons);
    },
    gofull: function () {
        if (this.game.scale.isFullScreen) {
            this.game.scale.stopFullScreen();
        }
        else {
            this.game.scale.startFullScreen(false);
        }
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
        console.log(items.length);
        if (!(items.length >= 0)) {
            console.log("length new: :" + items.length);
            result = this.findObjectsByType('item', this.map, 'objectsLayer');
            items = result;
            socket.emit("setItemList", items, this.map.key);
        }
        else console.log(items.length);
        console.log(this.items.length);
        items.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
        console.log(this.items.length);
    },
    createDoors: function () {
        this.doors = this.game.add.group();
        this.doors.enableBody = true;
        result = this.findObjectsByType('door', this.map, 'objectsLayer');

        result.forEach(function (element) {
            this.createFromTiledObject(element, this.doors);
        }, this);
    },
    findSpawnPoint: function(type, map, layer, spawnPosition) {
        console.log("-----------------MAP----------------");
        console.log(map);
        console.log("-----------------MAP----------------");
    var result = new Array();
    if (result.length < 0) return;
    map.objects[layer].forEach(function(element) {
        var offset = 0;
        if (element.properties.offset != undefined){
            offset = element.properties.offset;
        }
        if (element.properties.spawnPoint === spawnPosition){
            console.log("-------> spawn point found")
        }else {
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
        return result;
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
    enterDoor: function(player, door) {
      let targetRoom = door.targetTileMap.split('|');
        console.log('entering the door');
        console.log('targetTileMap: ' + targetRoom[0]);
        socket.emit('changeMap', targetRoom[0], Player.Id);
        Player.Map=targetRoom[0];
        TopDownGame.game.state.start(targetRoom[0]);
        console.log('entering the door');
        console.log('targetTileMap: ' + targetRoom[0]);
        console.log('targetSpawnPoint: ' + targetRoom[1]);

        TopDownGame.game.state.states[targetRoom[0]].position = targetRoom[1];
        TopDownGame.game.state.start(targetRoom[0]);
    },
    killBullet: function (bullet) {
        bullet.kill();
    },
    update: function () {
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.collide(this.weapon.bullets, this.blockedLayer, this.killBullet, null, this);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
        this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;
        if (!this.joystick.enabled) {
            // console.log(this.count);
            var boolMoved = false;

            if (this.cursors.up.isDown) {
                this.player.animations.play('walk');
                this.player.body.velocity.y -= this.player.velocity;
                boolMoved = true;
            } else if (this.cursors.down.isDown) {
                this.player.animations.play('walk');
                this.player.body.velocity.y += this.player.velocity;
                boolMoved = true;
            }
            else if (this.cursors.left.isDown) {
                this.player.animations.play('walk');
                this.player.body.velocity.x -= this.player.velocity;
                boolMoved = true;
            } else if (this.cursors.right.isDown) {
                this.player.animations.play('walk');
                this.player.body.velocity.x += this.player.velocity;
                boolMoved = true;
            } else {
                this.player.animations.stop();
                this.player.frame = 3;
            }

            this.player.rotation = this.physics.arcade.angleToPointer(this.player);

            if (this.input.activePointer.isDown || this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                this.player.frame = 0;

                this.weapon.fire();
            }
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
        } else {
            console.log(this.joystick.properties.angle);
            this.joystickangle = this.joystick.properties.rotation;
            if (this.joystickangle != 0) {
                this.player.rotation = this.joystick.properties.rotation;
            }
            if (this.button.isDown){
                this.boolShooting = true;
                this.player.frame = 0;
                this.weapon.fire();
            } else {
                this.boolShooting = false;
            }
            if (this.joystick.properties.up) {
                this.player.animations.play('walk');
                this.cursors.up.isDown = true;
                this.player.body.velocity.y -= this.player.velocity;
            }
            else {
                this.player.body.velocity.y -= 0;
            }
            if (this.joystick.properties.down) {
                this.cursors.down.isDown = true;
                this.player.animations.play('walk');
                this.player.body.velocity.y += this.player.velocity;
            }
            else {
                this.player.body.velocity.y += 0;
            }
            if (this.joystick.properties.right) {
                this.cursors.right.isDown = true;
                this.player.body.velocity.x += this.player.velocity;
                this.player.animations.play('walk');
            }
            else {
                this.player.body.velocity.x += 0;
            }
            if (this.joystick.properties.left) {
                this.cursors.left.isDown = true;
                this.player.body.velocity.x -= this.player.velocity;
                this.player.animations.play('walk');
            } else {
                this.player.body.velocity.x -= 0;
            }
            if(!this.joystick.properties.inUse){
                if(!this.boolShooting){
                this.player.animations.stop();
                this.player.frame = 3;
                }
            }
        }
    }
};
