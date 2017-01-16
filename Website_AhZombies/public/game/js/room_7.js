var TopDownGame = TopDownGame ||  {};

TopDownGame.room_7 = function() {};

TopDownGame.room_7.prototype = {
    createMap: function(){
        this.map = this.game.add.tilemap('room_7');
    }
};

TopDownGame.room_7.prototype.__proto__ = TopDownGame.room_1.prototype;
