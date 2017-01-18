var gameProperties = {
    screenWidth: '100%',
    screenHeight: '100%',
};
var wave = 0;
var background;
var firebutton;
var button;
var score;
var enemiesKilled = 0;
var game = TopDownGame.game;

TopDownGame.mini_game = function() {};

TopDownGame.mini_game.prototype = {
    create: function() {
        background = this.add.tileSprite(0, 0, 800, 600, "background");

        score = this.add.text(20,20,"Enemies killed: 0",
            { font: "20px Arial", fill: "#ffffff", align: "center" });
        score.inputEnabled = true;


        this.healthBar = this.add.text(400,20,"Health: 100",
            { font: "20px Arial", fill: "#ffffff", align: "center" });
        this.healthBar.inputEnabled = true;
        this.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

        //button = this.add.button(50, 50, 'button', this.actionOnClick, this, 2, 1, 0);

        //Health
        this.health = 3000;
        this.alive = true;

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.player = this.add.sprite(400, 300, 'playerminigame');
        this.physics.arcade.enable([this.player]);
        //Player

        this.player.anchor.setTo(0.5, 0.5);
        this.player.scale.setTo(0.15, 0.15);
        this.player.body.allowRotation = false;
        this.player.body.collideWorldBounds = true;

        //Enemy
        this.spawnEnemies();
        //Animations

        //Weapon
        this.weapon = this.add.weapon(30, 'bullet');
        this.weapon.fireRate = 300;
        this.weapon.bulletSpeed = 300;
        this.weapon.trackSprite(this.player, 0, 15, true);
        firebutton = this.input.activePointer.isDown;
    },

    enemiesDamage: function(){
      this.health -= 1;
      this.healthBar.text = "Health: " + Math.round((this.health * 0.033333));
      if(this.health <= 0){
          this.alive = false;
          this.player.kill();
          this.state.start("Menu2");
          return true;
      }
      return false;
    },
    spawnEnemies: function(){
        this.enemies = this.add.physicsGroup(Phaser.Physics.ARCADE);
        //this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemies.enableBody = true;
        wave += 20;
        for(var i = 0; i<wave; i++){
                var enemy = this.enemies.create(this.player.body.x - this.rnd.between(-500,500),this.player.body.y - this.rnd.between(500,1000),'enemy',0);
                enemy.name = 'enemy' + i;
                enemy.body.immovable = true;
                enemy.anchor.setTo(0.5);
                enemy.body.width = 60;
                enemy.body.height = 50;
                enemy.scale.setTo(0.45,0.45);
                enemy.anchor.setTo(0.5, 0.5);
            }
        this.enemies.callAll('animations.add', 'animations', 'walk', [185, 186, 187, 188, 189, 190, 191], 15, true);

        this.enemies.callAll('animations.add', 'animations', 'die', [66,67,68,69,70,71,72], 10, true);

        this.enemies.callAll('animations.play','animations','walk');

        this.enemies.setAll('body.bounce.x',1);
        this.enemies.setAll('body.bounce.y',1);

    },
    update: function() {
        this.enemies.forEachAlive(this.moveEnemies,this);
        this.physics.arcade.collide(this.weapon.bullets,this.enemies,this.killEnemy,null,this);
        if(this.enemies){
        this.aliveEnemies = this.enemies.countLiving();
        if(this.aliveEnemies <= 0){
            this.enemies.destroy();
            this.spawnEnemies();
        }
        }
        this.physics.arcade.overlap(this.enemies, this.player, this.enemiesDamage, null, this);

        //Controls
        if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.player.x -= 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.player.x += 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            this.player.y -= 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.player.y += 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.Q)) {
            this.player.x -= 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.x += 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.Z)) {
            this.player.y -= 4;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.player.y += 4;
        }
        this.player.rotation = this.physics.arcade.angleToPointer(this.player);
        if (this.input.activePointer.isDown || this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.weapon.fire();
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
        this.physics.arcade.moveToObject(enemy, this.player, 150);
        enemy.rotation = this.physics.arcade.angleBetween(enemy, this.player);
    },
    render: function () {
    }
};