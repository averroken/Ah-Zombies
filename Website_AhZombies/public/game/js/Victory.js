/**
 * Created by DarthSwedo on 1/15/2017.
 */
var TopDownGame = TopDownGame || {};

TopDownGame.Victory = function () {};

TopDownGame.Victory.prototype = {
    create: function () {

        // To exit the how-to or credits menu, I can press any button. This is to stop that same button press from
        // taking other actions on the menu (for example if I press the "up" key to exit, I don't want this to exit AND go to
        // the next menu item up).
        this.justExitedSubmenu = false;

        background = this.add.tileSprite(0, 0, 600, 300, "background");

        this.gameTitle = TopDownGame.game.add.image(TopDownGame.game.width / 2, TopDownGame.game.height / 2 - 120, 'victory_title');
        this.gameTitle.anchor.setTo(0.5, 0.5);

        this.buttons = [];
        this.scaleTween = null;
        this.subMenu = null;
        this.buttonYOffsets = {
            1: - 40,
            2: 60,
            3: 160
        };
        this.buttonSettings = [
            {key: 'how_to_button', yOffset: -40, callback: this.showHowTo}];

        this.buttonSettings.forEach(function(button) {
            this.buttons.push(this.addButton(button.key, button.yOffset, button.callback));
        }, this);

        this.setSelectedAnimation(this.buttons[0]);

        this.yOffsets = this.buttonYOffsets;

        this.buttons = this.buttons;

        // Draw the sprite.
        this.arrow = this.add.sprite(this.camera.width / 2 - 110, this.camera.height / 2 - 40, 'enemy');
        this.arrow.anchor.setTo(0.5, 0.5);
        this.arrow.animations.add('walk', [185, 186, 187, 188, 189, 190, 191], 15, true);
        this.arrow.frame = [185, 186, 187, 188, 189, 190, 191];

        // Initial settings.
        this.currentButton = 1;
        this.arrow.canMove = true;

        // this.arrow = new this.MenuArrow('enemy', game.camera.width / 2 - 110, game.camera.height / 2 - 40, this.buttonYOffsets, [185, 186, 187, 188, 189, 190, 191], this.buttons);

    },

    update: function () {
        if(this.justExitedSubmenu) {
            if(!(TopDownGame.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)
                || TopDownGame.game.input.keyboard.isDown(Phaser.Keyboard.UP)
                || TopDownGame.game.input.keyboard.isDown(Phaser.Keyboard.DOWN))) {
                this.justExitedSubmenu = false;
            }
        }

        else if(this.submenu == null) {

            this.arrow.animations.play('walk');
            if(this.input.keyboard.isDown(Phaser.Keyboard.DOWN) && this.arrow.canMove && this.currentButton < 1) {
                console.log(this.currentButton);
                this.currentButton++;
                this.setSelectedAnimation(this.buttons[this.currentButton - 1]);
                this.arrow.position.y = this.camera.height / 2  + this.yOffsets[this.currentButton];
                this.arrow.canMove = false;
                this.time.events.add(150, (function() {
                    this.arrow.canMove = true;
                }), this);
            }

            if(this.input.keyboard.isDown(Phaser.Keyboard.UP) && this.arrow.canMove && this.currentButton > 1) {
                this.currentButton--;
                this.setSelectedAnimation(this.buttons[this.currentButton - 1]);
                this.arrow.position.y = this.camera.height / 2  + this.yOffsets[this.currentButton];
                this.arrow.canMove = false;
                this.time.events.add(150, (function() {
                    this.arrow.canMove = true;
                }), this);
            }
            if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
                this.buttons[this.currentButton - 1].callbackFunction.call(this);
            }
        }
    },

    levelSelect: function() {
        TopDownGame.game.state.start("mini_game");
    },

    showHowTo: function() {
        TopDownGame.game.state.start("room_1");
    },
    showSubmenu: function(submenu) {
        this.submenu = TopDownGame.game.add.image(TopDownGame.game.camera.width / 2, TopDownGame.game.camera.height / 2, submenu);
        this.submenu.anchor.setTo(0.5, 0.5);

        TopDownGame.game.input.keyboard.callbackContext = this;

        TopDownGame.game.input.keyboard.onDownCallback = function() {
            this.submenu.kill();
            this.submenu = null;
            this.justExitedSubmenu = true;
            TopDownGame.game.input.keyboard.onDownCallback = null;
        };
    },
    addButton: function (key, yOffset, callback) {
        var button = TopDownGame.game.add.image(TopDownGame.game.camera.width / 2, TopDownGame.game.camera.height / 2 + yOffset, key);
        button.events.onInputDown.add(callback, this);
        button.inputEnabled = true;
        button.anchor.setTo(.5, .5);
        button.scale.x = .5;
        button.scale.y = .5;
        button.callbackFunction = callback;
        return button;
    },
    setSelectedAnimation: function(button) {
        if(this.scaleTween != null) {
            this.scaleTween.stop(true);
            this.scaleTween.onKill.dispatch();
        }
        TopDownGame.game.tweens.removeAll();

        this.scaleTween = TopDownGame.game.add.tween(button.scale).to({x: .65, y: .65}, 500, Phaser.Easing.Quadratic.InOut).yoyo(true).repeat(Number.MAX_VALUE).start();

        this.scaleTween.onKill = new Phaser.Signal();

        this.scaleTween.onKill.addOnce(function() {
            button.scale.x = .5;
            button.scale.y = .5;
        }, this);
    }
}