var gameProperties = {
    screenWidth: '100%',
    screenHeight: '100%',
};
var wave = 0;
var background;
var firebutton;
var button;
var score;
var enemiesKilled;
var game = TopDownGame.game;

TopDownGame.mini_game = function() {};

TopDownGame.mini_game.prototype = {
    //Create function
    create: function() {

        background = this.add.tileSprite(0, 0, 600, 300, "background");

        score = this.add.text(20,20,"Enemies killed: 0",
            { font: "20px Arial", fill: "#ffffff", align: "center" });
        score.inputEnabled = true;

        this.healthBar = this.add.text(400,20,"Health: 100",
            { font: "20px Arial", fill: "#ffffff", align: "center" });
        this.healthBar.inputEnabled = true;
        this.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;


        this.waves = 0;
        this.wave1 = this.add.sprite(215, 100,'wave1');
        this.wave1tween = this.add.tween(this.wave1).from( { y: -200 }, 2000 , Phaser.Easing.Bounce.Out, true);
        this.wave1tween.onComplete.add(function(){
            console.log("Wave 1 is klaar");
            this.add.tween(this.wave1).to({alpha:0}, 2000, Phaser.Easing.Linear.None,true,0,0,false);
        },this);
        // this.tween.onComplete.add(loadInit,this);
        // function loadInit(){
        //Health
        this.health = 3000;
        this.alive = true;
        enemiesKilled = 0;

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.player = this.add.sprite(400, 150, 'playerminigame');
        this.physics.arcade.enable([this.player]);
        //Player
        this.player.anchor.setTo(0.5, 0.5);
        this.player.scale.setTo(0.15, 0.15);
        this.player.body.allowRotation = false;
        this.player.body.collideWorldBounds = true;
        this.cursors = this.game.input.keyboard.createCursorKeys();

        //Enemy
        this.spawnEnemies();
        //Animations

        //Weapon
        this.weapon = this.add.weapon(30, 'bullet');
        this.weapon.fireRate = 300;
        this.weapon.bulletSpeed = 300;
        this.weapon.trackSprite(this.player, 0, 15, true);
        firebutton = this.input.activePointer.isDown;
        this.addGamePad();
        this.addButtons();
        // }
    },
    //Enemy vs Player damage
    enemiesDamage: function(){
      this.health -= 1;
      this.healthBar.text = "Health: " + Math.round((this.health * 0.033333));
      if(this.health <= 0){
          console.log("PLAYER DIED");
          this.alive = false;
          this.player.kill();
          enemiesKilled = 0;
          this.state.start("Menu2");
          return true;
      }
      return false;
    },
    //Spawn the enemies & wave control
    spawnEnemies: function(){
        this.enemies = this.add.physicsGroup(Phaser.Physics.ARCADE);
        //this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemies.enableBody = true;
        wave += 20;
        this.waves++;
        switch(this.waves){
            case 2:
                this.wave2 = this.add.sprite(215,100,'wave2');
                this.wave2tween = this.add.tween(this.wave2).from( { y: -200 }, 2000 , Phaser.Easing.Bounce.Out, true);
                this.wave2tween.onComplete.add(function(){
                    this.add.tween(this.wave2).to({alpha:0}, 2000, Phaser.Easing.Linear.None,true,0,0,false);
                },this);
                break;
            case 3:
                this.wave3 = this.add.sprite(215,100,'wave3');
                this.wave3tween = this.add.tween(this.wave3).from( { y: -200 }, 2000 , Phaser.Easing.Bounce.Out, true);
                this.wave3tween.onComplete.add(function(){
                    this.add.tween(this.wave3).to({alpha:0}, 2000, Phaser.Easing.Linear.None,true,0,0,false);
                },this);
                break;
            case 4:
                this.wave4 = this.add.sprite(215,100,'wave4');
                this.wave4tween = this.add.tween(this.wave4).from( { y: -200 }, 2000 , Phaser.Easing.Bounce.Out, true);
                this.wave4tween.onComplete.add(function(){
                    this.add.tween(this.wave4).to({alpha:0}, 2000, Phaser.Easing.Linear.None,true,0,0,false);
                },this);
                break;
            case 5:
                this.player.kill();
                enemiesKilled = 0;
                this.state.start('victory');
        }
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

    },
    //Update Function
    update: function() {

        //Collisions
        this.enemies.forEachAlive(this.moveEnemies,this);
        this.physics.arcade.collide(this.weapon.bullets,this.enemies,this.killEnemy,null,this);
        this.physics.arcade.overlap(this.enemies, this.player, this.enemiesDamage,null,this);

        //Wave handling
        if(this.enemies){
        this.aliveEnemies = this.enemies.countLiving();
        if(this.aliveEnemies <= 0){
            this.enemies.destroy();
            this.spawnEnemies();
        }
        }

        //Controls
        if (!this.joystick.enabled) {
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
        } else {
            this.joystickangle = this.joystick.properties.rotation;
            if (this.joystickangle != 0) {
                this.player.rotation = this.joystick.properties.rotation;
            }
            if (this.button.isDown){
                this.weapon.fire();
            }
            if (this.joystick.properties.up) {
                this.player.animations.play('walk');
                this.cursors.up.isDown = true;
                this.player.y -= 4;
            }
            if (this.joystick.properties.down) {
                this.cursors.down.isDown = true;
                this.player.animations.play('walk');
                this.player.y += 4;
            }
            if (this.joystick.properties.right) {
                this.cursors.right.isDown = true;
                this.player.x += 4;
                this.player.animations.play('walk');
            }
            if (this.joystick.properties.left) {
                this.cursors.left.isDown = true;
                this.player.x -= 4;
                this.player.animations.play('walk');
            }
        }
    },
    //Enable/disable joysticks function
    enableJoysticks: function () {
        this.joystick.enabled = (!this.joystick.enabled);
        this.joystick.visible = (!this.joystick.visible);
        this.button.visible = (!this.button.visible);
        this.gamepad.joystickPad.visible = (!this.gamepad.joystickPad.visible);
        // console.log(this.joystick);
        // console.log(this.gamepad);
    },
    //Add joysticks to screen
    addGamePad: function () {
        // console.log("gamepad added");
        // Add the VirtualGamepad plugin to the game
        this.gamepad = this.game.plugins.add(Phaser.Plugin.VirtualGamepad);

        // Add a joystick to the game (only one is allowed right now)
        this.joystick = this.gamepad.addJoystick(50, this.game.height - 50, 0.5, 'gamepad');

        // Add a button to the game (only one is allowed right now)
        this.button = this.gamepad.addButton(this.game.width - 50, this.game.height - 50, 0.5, 'gamepad');

        this.joystick.enabled = true;

        // console.log(this.joystick);
    },
    //Add Fullscreen button and Enable/disable joysticks button
    addButtons: function () {
        this.buttons = this.game.add.group();
        this.fullScreenButton = this.add.button(this.game.width - 25, 5, 'fullScreenButton', this.gofull, this, 0, 0, 0, 0, this.buttons);
        this.fullScreenButton.fixedToCamera = true;
        this.joystickButton = this.add.button(this.game.width - 25, 30, 'joystickButton', this.enableJoysticks, this, 0, 0, 0, 0, this.buttons);
        this.joystickButton.fixedToCamera = true;
        this.game.world.bringToTop(this.buttons);
    },
    //Go fullscreen function
    gofull: function () {
        if (this.scale.isFullScreen)
        {
            this.scale.stopFullScreen();
        }
        else
        {
            this.scale.startFullScreen(false);
        }
    },
    //Kill enemy function
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
    //Make enemies attack player
    moveEnemies: function(enemy){
        this.physics.arcade.moveToObject(enemy, this.player, 150);
        enemy.rotation = this.physics.arcade.angleBetween(enemy, this.player);
    },
    render: function () {
    }
};