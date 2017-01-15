var TopDownGame = TopDownGame ||  {};
var player = player || {};

TopDownGame.room_1 = function() {};

TopDownGame.room_1.prototype = {
    create: function() {
        this.map = this.game.add.tilemap('room_1');
        this.map.addTilesetImage('cute_lpc', 'dungeonTiles');

        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        this.map.setCollisionBetween(1, 2000, true, 'blockedLayer');

        this.backgroundlayer.resizeWorld();

        this.createItems();
        this.createDoors();

        var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');

        player = this.game.add.sprite(result[0].x, result[0].y, 'player');
        player.velocity = 100;
        this.game.physics.arcade.enable(player);

        this.game.camera.follow(player);
        // player = this.player;

        this.cursors = this.game.input.keyboard.createCursorKeys();
    },
    createItems: function() {
        this.items = this.game.add.group();
        this.items.enableBody = true;
        var item;
        result = this.findObjectsByType('item', this.map, 'objectsLayer');
        result.forEach(function(element) {
            this.createFromTiledObject(element, this.items);
        }, this);
    },
    createDoors: function() {
        this.doors = this.game.add.group();
        this.doors.enableBody = true;
        result = this.findObjectsByType('door', this.map, 'objectsLayer');

        result.forEach(function(element) {
            this.createFromTiledObject(element, this.doors);
        }, this);
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
        if (collectable.sprite == 'bluecup' || collectable.sprite == 'greencup' || collectable.sprite == "cute_lpc_chest") {
            player.velocity = 300;
        }
        collectable.destroy();
    },
    enterDoor: function(player, door) {
        console.log('entering the door');
        console.log('targetTileMap: ' + door.targetTileMap);
        TopDownGame.game.state.start(door.targetTileMap);
    },
    update: function() {
        player.body.velocity.y = 0;
        player.body.velocity.x = 0;

        if (this.cursors.up.isDown) {
            player.body.velocity.y -= player.velocity;
        } else if (this.cursors.down.isDown) {
            player.body.velocity.y += player.velocity;
        }
        if (this.cursors.left.isDown) {
            player.body.velocity.x -= player.velocity;
        } else if (this.cursors.right.isDown) {
            player.body.velocity.x += player.velocity;
        }

        this.game.physics.arcade.collide(player, this.blockedLayer);
        this.game.physics.arcade.overlap(player, this.items, this.collect, null, this);

        this.game.physics.arcade.overlap(player, this.doors, this.enterDoor, null, this);

        var test = document.getElementsByTagName('canvas')[0];
        test.removeAttribute("margin-left");
    }
};
