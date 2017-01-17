'use strict';

var TopDownGame = TopDownGame || {};

TopDownGame.room_8 = function () {};

TopDownGame.room_8.prototype = {
    createMap: function createMap() {
        this.map = this.game.add.tilemap('room_8');
    }
};

TopDownGame.room_8.prototype.__proto__ = TopDownGame.room_1.prototype;