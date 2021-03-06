var TopDownGame = TopDownGame ||  {};

TopDownGame.Game2 = function() {};

TopDownGame.Game2.prototype = {
    create: function() {
        alert("qmfjlsq");
        this.map = this.game.add.tilemap('level2');
        this.map.addTilesetImage('tiles', 'gameTiles');

        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        this.map.setCollisionBetween(1, 2000, true, 'blockedLayer');

        this.backgroundlayer.resizeWorld();

        this.createItems();
        this.createDoors();

        var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');

        this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
        this.player.velocity = 50;
        this.game.physics.arcade.enable(this.player);

        this.game.camera.follow(this.player);

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
        map.objects[layer].forEach(function(element) {
            if (element.properties.type === type) {
                element.y -= map.tileHeight;
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
        if (collectable.sprite == 'bluecup' || collectable.sprite == 'greencup') {
            player.velocity = 200;
        }
        collectable.destroy();
    },
    enterDoor: function(player, door) {
        console.log('entering the door');
        TopDownGame.game.state.start('Game');
    },
    update: function() {
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;

        if (this.cursors.up.isDown) {
            this.player.body.velocity.y -= this.player.velocity;
        } else if (this.cursors.down.isDown) {
            this.player.body.velocity.y += this.player.velocity;
        }
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x -= this.player.velocity;
        } else if (this.cursors.right.isDown) {
            this.player.body.velocity.x += this.player.velocity;
        }

        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);

        this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);
    }
};