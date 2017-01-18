'use strict';

var TopDownGame = TopDownGame || {};
var gameProperties = {
    screenWidth: '100%',
    screenHeight: '100%'
};
var states = {
    game: "game"
};
var player;
var enemy;
var bullets;
var background;
var firebutton;
var enemies;
var weapon;
var fireRate = 100;
var nextFire = 0;
var game = TopDownGame.game;

TopDownGame.mini_game = function () {};

TopDownGame.mini_game.prototype = {
    create: function create() {
        background = game.add.tileSprite(0, 0, 1920, 1080, "background");

        // enemy = game.add.sprite(Math.floor((Math.random()*300)+200),Math.floor((Math.random()*300)+200), 'enemy');
        //     var walk = enemy.animations.add('walk', [40, 41, 42, 43, 44, 45, 46], 10, true);
        //     var die = enemy.animations.add('die', [57, 58, 59, 60, 61, 62, 63,64,65,66,67,68,69,70,71,72], 10, true);
        //
        //     enemy.animations.play('walk', 15, true);

        game.physics.startSystem(Phaser.Physics.ARCADE);

        //Enemy
        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < 150; i++) {
            enemy = enemies.create(game.world.randomX, game.world.randomY, 'enemy', 0);
            enemy.name = 'enemy' + i;
            enemy.body.immovable = true;
            enemy.anchor.setTo(0.5);
            enemy.body.width = 60;
            enemy.body.height = 50;
            enemy.scale.setTo(1, 1);
        }

        enemies.callAll('animations.add', 'animations', 'walk', [40, 41, 42, 43, 44, 45, 46], 15, true);

        enemies.callAll('animations.add', 'animations', 'die', [66, 67, 68, 69, 70, 71, 72], 10, true);

        enemies.callAll('animations.play', 'animations', 'walk');

        player = game.add.sprite(400, 300, 'player2');
        game.physics.arcade.enable([player]);
        //Player

        player.anchor.setTo(0.5, 0.5);
        player.scale.setTo(0.3, 0.3);
        player.body.allowRotation = false;
        player.body.collideWorldBounds = true;

        //Weapon
        weapon = game.add.weapon(30, 'bullet');
        weapon.fireRate = fireRate;
        weapon.bulletSpeed = 2000;
        weapon.trackSprite(player, 0, 15, true);
        firebutton = this.input.activePointer.isDown;
    },
    update: function update() {
        //game.physics.arcade.collide(enemies,weapon.bullets);
        game.physics.arcade.overlap(weapon.bullets, enemies, this.killEnemy, null, this);
        // enemies.forEach(function(enemy){
        //     enemy.body.onCollide = new Phaser.Signal();
        //     enemy.body.onCollide.add(killEnemy, this)
        // });

        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            player.x -= 4;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            player.x += 4;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            player.y -= 4;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            player.y += 4;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
            player.x -= 4;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            player.x += 4;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
            player.y -= 4;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            player.y += 4;
        }
        player.rotation = game.physics.arcade.angleToPointer(player);
        if (game.input.activePointer.isDown || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            weapon.fire();
        }
    },
    killEnemy: function killEnemy(enemy, bullet) {
        if (!bullet || !enemy) {
            return;
        }
        bullet.kill();
        enemy.animations.play('die', 15, false, true);
        enemy.body.width = 0;
        enemy.body.height = 0;
        enemy.events.onAnimationComplete.add(function () {
            console.log('Enemy is killed');
            enemy.kill();
        });
    },
    render: function render() {
        weapon.debug();
    }
};