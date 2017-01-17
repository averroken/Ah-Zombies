var gameProperties = {
    screenWidth: '100%',
    screenHeight: '100%',
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
var button;
var score;
var enemiesKilled = 0;
var game = TopDownGame.game;

TopDownGame.mini_game = function() {};

TopDownGame.mini_game.prototype = {
    create: function() {
        background = this.add.tileSprite(0, 0, 800, 600, "background");

        score = this.add.text(20,20,"Enemies killed: 0",
            { font: "40px Arial", fill: "#000000", align: "center" });
        score.inputEnabled = true;

        this.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

        button = this.add.button(50, 50, 'button', this.actionOnClick, this, 2, 1, 0);

        this.physics.startSystem(Phaser.Physics.ARCADE);
        player = this.add.sprite(400, 300, 'playerminigame');
        this.physics.arcade.enable([player]);
        //Player

        player.anchor.setTo(0.5, 0.5);
        player.scale.setTo(0.15, 0.15);
        player.body.allowRotation = false;
        player.body.collideWorldBounds = true;


        //Enemy
        enemies = this.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;
        for(var i = 0; i<50; i++){
            enemy = enemies.create(player.body.x - this.rnd.between(-500,500),player.body.y - this.rnd.between(500,1000),'enemy',0);
            enemy.name = 'enemy' + i;
            enemy.body.immovable = true;
            enemy.anchor.setTo(0.5);
            enemy.body.width = 60;
            enemy.body.height = 50;
            enemy.scale.setTo(0.45,0.45);
            enemy.anchor.setTo(0.5, 0.5);
        }

        //Animations
        enemies.callAll('animations.add', 'animations', 'walk', [185, 186, 187, 188, 189, 190, 191], 15, true);

        enemies.callAll('animations.add', 'animations', 'die', [66,67,68,69,70,71,72], 10, true);

        enemies.callAll('animations.play','animations','walk');

        //Weapon
        weapon = this.add.weapon(30, 'bullet');
        weapon.fireRate = fireRate;
        weapon.bulletSpeed = 5000;
        weapon.trackSprite(player, 0, 15, true);
        firebutton = this.input.activePointer.isDown;
    },
    update: function() {
        this.physics.arcade.overlap(weapon.bullets,enemies,this.killEnemy,null,this);
        enemies.forEachAlive(this.moveEnemies,this);

        //Controls
        if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            player.x -= 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            player.x += 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            player.y -= 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            player.y += 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.Q)) {
            player.x -= 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            player.x += 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.Z)) {
            player.y -= 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.S)) {
            player.y += 4;
        }
        player.rotation = this.physics.arcade.angleToPointer(player);
        if (this.input.activePointer.isDown || this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            weapon.fire();
        }
    },
    actionOnClick: function () {
        if (this.scale.isFullScreen)
        {
            this.scale.stopFullScreen();
        }
        else
        {
            this.scale.startFullScreen(false);
        }
    },
    killEnemy: function(bullet,enemy) {
        if(!bullet || !enemy){
            return;
        };
        bullet.kill();
        enemy.animations.play('die',15,false,true);
        if(enemy.body.width == 0)return;
        enemy.body.width = 0;
        enemy.body.height = 0;
        enemy.events.onAnimationComplete.add(function(){
            enemy.kill();
            enemiesKilled++;
            score.text = "Enemies killed: " +  enemiesKilled;
        });
    },
    moveEnemies: function(enemy){
        this.physics.arcade.moveToObject(enemy, player, 150);
        enemy.rotation = this.physics.arcade.angleBetween(enemy, player);
    },
    render: function () {
    }
};