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
        this.load.tilemap('level1', 'public/game/assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('level2', 'public/game/assets/tilemaps/level2.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('largeMap', 'public/game/assets/tilemaps/largeMap.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_1', 'public/game/assets/tilemaps/largeMap_room_1.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_2', 'public/game/assets/tilemaps/largeMap_room_2.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_3', 'public/game/assets/tilemaps/largeMap_room_3.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_4', 'public/game/assets/tilemaps/largeMap_room_4.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_5', 'public/game/assets/tilemaps/largeMap_room_5.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_6', 'public/game/assets/tilemaps/largeMap_room_6.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_7', 'public/game/assets/tilemaps/largeMap_room_7.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('room_8', 'public/game/assets/tilemaps/largeMap_room_8.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.image('gameTiles', 'public/game/assets/images/tiles.png');
        this.load.image('dungeonTiles', 'public/game/assets/images/dungeonTilesResource.png');

        this.load.image('greencup', 'public/game/assets/images/greencup.png');
        this.load.image('bluecup', 'public/game/assets/images/bluecup.png');
        this.load.spritesheet('player', 'public/game/assets/player.png',139,125);
        this.load.image('playerminigame', 'public/game/assets/survivor-shoot_rifle_0.png');
        this.load.image('browndoor', 'public/game/assets/images/browndoor.png');
        this.load.image('cute_lpc_doors_x_up', 'public/game/assets/images/cute_lpc_doors_x_up.png');
        this.load.image('cute_lpc_doors_x_down', 'public/game/assets/images/cute_lpc_doors_x_down.png');
        this.load.image('cute_lpc_doors_y_right', 'public/game/assets/images/cute_lpc_doors_y_right.png');
        this.load.image('cute_lpc_doors_y_left', 'public/game/assets/images/cute_lpc_doors_y_left.png');
        this.load.image('cute_lpc_chest', 'public/game/assets/images/cute_lpc_chest.png');

        //MiniGame
        this.load.spritesheet('enemy', 'public/game/assets/zombie_topdown.png',128,128);
        this.load.image('bullet','public/game/assets/bullet.png');
        this.load.image('background', 'public/game/assets/background.jpg');

        this.load.image('menu_title', 'public/game/assets/menu/title.png');
        this.load.image('retry_title', 'public/game/assets/menu/retry_title.png');
        this.load.image('play_button', 'public/game/assets/menu/play_button.png');
        this.load.image('retry_button', 'public/game/assets/menu/retry_button.png');
        this.load.image('how_to_button', 'public/game/assets/menu/how_to_button.png');
        this.load.image('credits_button', 'public/game/assets/menu/credits_button.png');
        this.load.image('city', 'public/game/assets/menu/landscape.png');
    },
    create: function () {
        this.state.start('room_1');
    }
};
