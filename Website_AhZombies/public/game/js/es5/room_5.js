'use strict';

var TopDownGame = TopDownGame || {};

TopDownGame.room_5 = function () {};

TopDownGame.room_5.prototype = {
    createMap: function createMap() {
        this.map = this.game.add.tilemap('room_5');
    }
};

TopDownGame.room_5.prototype.__proto__ = TopDownGame.room_1.prototype;