var TopDownGame = TopDownGame || {};

//loading the game assets
TopDownGame.Preload = function () {
};

TopDownGame.Preload.prototype = {
    preload: function () {
        //show loading screen
        this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
        this.preloadBar.anchor.setTo(0.5);

        this.load.setPreloadSprite(this.preloadBar);

        //load game assets
        this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('level2', 'assets/tilemaps/level2.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('largeMap', 'assets/tilemaps/largeMap.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_1', 'assets/tilemaps/largeMap_room_1.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_2', 'assets/tilemaps/largeMap_room_2.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_3', 'assets/tilemaps/largeMap_room_3.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_4', 'assets/tilemaps/largeMap_room_4.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_5', 'assets/tilemaps/largeMap_room_5.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_6', 'assets/tilemaps/largeMap_room_6.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_7', 'assets/tilemaps/largeMap_room_7.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_8', 'assets/tilemaps/largeMap_room_8.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.image('gameTiles', 'assets/images/tiles.png');
        this.load.image('dungeonTiles', 'assets/images/dungeonTilesResource.png');

        this.load.image('greencup', 'assets/images/greencup.png');
        this.load.image('bluecup', 'assets/images/bluecup.png');
        this.load.image('player', 'assets/images/player.png');
        this.load.image('dude', 'assets/images/player.png');
        this.load.image('browndoor', 'assets/images/browndoor.png');
        this.load.image('cute_lpc_doors_x_up', 'assets/images/cute_lpc_doors_x_up.png');
        this.load.image('cute_lpc_doors_x_down', 'assets/images/cute_lpc_doors_x_down.png');
        this.load.image('cute_lpc_doors_y_right', 'assets/images/cute_lpc_doors_y_right.png');
        this.load.image('cute_lpc_doors_y_left', 'assets/images/cute_lpc_doors_y_left.png');
        this.load.image('cute_lpc_chest', 'assets/images/cute_lpc_chest.png');

    },
    create: function () {
        this.state.start('room_1');
    }
};
