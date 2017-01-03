var TopDownGame = TopDownGame ||  {};

TopDownGame.Boot = function() {};

TopDownGame.Boot.prototype = {
    preload: function() {
        this.load.image('preloadbar', 'assets/images/preloader-bar.png');
    },
    create: function() {
        this.game.state.backgroundColor = '#fff';
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignVertically = true;
        this.scale.pageAlignHorizontally = true;

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.state.start('Preload');
    }
}
