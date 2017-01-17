var TopDownGame = TopDownGame ||  {};

TopDownGame.room_1 = function() {};

TopDownGame.room_1.prototype = {
    create: function() {
        this.createMap();
        this.map.addTilesetImage('cute_lpc', 'dungeonTiles');
        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        this.map.setCollisionBetween(1, 2000, true, 'blockedLayer');

        this.backgroundlayer.resizeWorld();

        this.count=0;

        // var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');
        var result = this.findSpawnPoint('playerStart', this.map, 'objectsLayer', this.position);

        this.player = this.game.add.sprite(result[0].x, result[0].y, 'player',10);
        this.player.id = Player.Id;
        this.player.anchor.setTo(0.45, 0.45);
        this.player.angle = 0;
        this.player.scale.setTo(0.30,0.30);
        this.player.animations.add('walk',[3,7,2,6,1,5],5,true);


        //Weapon
        this.weapon = this.add.weapon(30, 'bullet');
        this.weapon.fireRate = 300;
        this.weapon.bulletSpeed = 100;
        // this.weapon.bullets.scale.setTo(0.9,0.9);
        this.weapon.trackSprite(this.player,23,3,true);
        firebutton = this.input.activePointer.isDown;
// x- y+
        this.cursors = this.game.input.keyboard.createCursorKeys();
        console.log("My id: "+ Player.Id);

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
    },
    gofull: function(){
        if (this.game.scale.isFullScreen)
        {
            this.game.scale.stopFullScreen();
        }
        else
        {
            this.game.scale.startFullScreen(false);
        }
    },
    createMap: function(){
        this.map = this.game.add.tilemap('room_1');
        if(!this.position) this.position="down";
    },
    createItems: function() {
        console.log(this.map);
        this.items = this.game.add.group();
        this.items.enableBody = true;
        var item;
        console.log(items.length);
        if(!(items.length>=0)){
            console.log("length new: :"+items.length);
            result = this.findObjectsByType('item', this.map, 'objectsLayer');
            items=result;
            socket.emit("setItemList", items, this.map.key);
        }
        else console.log(items.length);
        console.log(this.items.length);
        items.forEach(function(element) {
            this.createFromTiledObject(element, this.items);
        }, this);
        console.log(this.items.length);
    },
    createDoors: function() {
        this.doors = this.game.add.group();
        this.doors.enableBody = true;
        result = this.findObjectsByType('door', this.map, 'objectsLayer');

        result.forEach(function(element) {
            this.createFromTiledObject(element, this.doors);
        }, this);
    },
    findSpawnPoint: function(type, map, layer, spawnPosition) {
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
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        if (result.length < 0) return;
        map.objects[layer].forEach(function(element) {
            var offset = 0;
            if (element.properties.offset != undefined){
                offset = element.properties.offset;
            }
            if (element.properties.type === type) {
                element.y -= map.tileHeight + 45 + offset;
                result.push(element);
            }
        });
        return result;
    },
    createFromTiledObject: function(element, group) {
        var sprite = group.create(element.x, element.y, element.properties.sprite);

        Object.keys(element.properties).forEach(function(key) {
            sprite[key] = element.properties[key];
        });
    },
    collect: function(player, collectable) {
        console.log(this.map);
        let Map = this.map;
        if (collectable.sprite == 'bluecup' || collectable.sprite == 'greencup') {
            player.velocity = 100;
        }
        collectable.destroy();
        items.forEach(function(element) {
            if(element.x===collectable.position.x && element.y === collectable.position.y)
            {
                var index=items.indexOf(element);
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
        TopDownGame.game.state.start(targetRoom[0]);
        console.log('entering the door');
        console.log('targetTileMap: ' + targetRoom[0]);
        console.log('targetSpawnPoint: ' + targetRoom[1]);

        // TopDownGame.game.state.states[targetRoom[0]].position = targetRoom[1];
        TopDownGame.game.state.start(targetRoom[0]);
    },
    killBullet: function(bullet){
        bullet.kill();
    },
    update: function() {
        // console.log(this.count);
        var boolMoved=false;
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;

        if (this.cursors.up.isDown) {
            this.player.animations.play('walk');
            this.player.body.velocity.y -= this.player.velocity;
            boolMoved=true;
        } else if (this.cursors.down.isDown) {
            this.player.animations.play('walk');
            this.player.body.velocity.y += this.player.velocity;
            boolMoved=true;
        }
        else if (this.cursors.left.isDown) {
            this.player.animations.play('walk');
            this.player.body.velocity.x -= this.player.velocity;
            boolMoved=true;
        } else if (this.cursors.right.isDown) {
            this.player.animations.play('walk');
            this.player.body.velocity.x += this.player.velocity;
            boolMoved=true;
        } else {
            this.player.animations.stop();
            this.player.frame = 3;
        }

        this.player.rotation = this.physics.arcade.angleToPointer(this.player);

        console.log(this.player.rotation);
        if (this.input.activePointer.isDown || this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.player.frame = 0;
            this.weapon.fire();
        }
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.collide(this.weapon.bullets, this.blockedLayer, this.killBullet,null,this);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
        this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);
        if(boolMoved) {
            this.count++;
            if(this.count%2==0) {
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
