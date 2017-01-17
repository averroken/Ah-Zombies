'use strict';

var TopDownGame = TopDownGame || {};

TopDownGame.room_4 = function () {};

TopDownGame.room_4.prototype = {
    createMap: function createMap() {
        this.map = this.game.add.tilemap('room_4');
    }
};

TopDownGame.room_4.prototype.__proto__ = TopDownGame.room_1.prototype;