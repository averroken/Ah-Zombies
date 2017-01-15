var TopDownGame = TopDownGame ||  {};

TopDownGame.Boot = function() {};

TopDownGame.Boot.prototype = {
    preload: function() {
        this.load.image('preloadbar', 'public/game/assets/images/preloader-bar.png');
    },
    create: function() {
        this.game.state.backgroundColor = '#fff';
        this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.state.start('Preload');
    }
}