var TopDownGame = TopDownGame ||  {};
var player = player || {};

TopDownGame.game = new Phaser.Game(600, 300, Phaser.AUTO, 'game');


TopDownGame.game.state.add('Boot', TopDownGame.Boot);
TopDownGame.game.state.add('Preload', TopDownGame.Preload);
TopDownGame.game.state.add('Game', TopDownGame.Game);
TopDownGame.game.state.add('Level2', TopDownGame.Game2);
TopDownGame.game.state.add('largeMapTest', TopDownGame.largeMap);
TopDownGame.game.state.add('room_1', TopDownGame.room_1);
TopDownGame.game.state.add('room_2', TopDownGame.room_2);
TopDownGame.game.state.add('room_3', TopDownGame.room_3);
TopDownGame.game.state.add('room_4', TopDownGame.room_4);
TopDownGame.game.state.add('room_5', TopDownGame.room_5);
TopDownGame.game.state.add('room_6', TopDownGame.room_6);
TopDownGame.game.state.add('room_7', TopDownGame.room_7);
TopDownGame.game.state.add('room_8', TopDownGame.room_8);
TopDownGame.game.state.add('mini_game', TopDownGame.test_game);

TopDownGame.game.state.start('Boot');