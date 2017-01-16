var TopDownGame = TopDownGame ||  {};

TopDownGame.room_6 = function() {};

TopDownGame.room_6.prototype = {
    createMap: function(){
        this.map = this.game.add.tilemap('room_6');
    }
};

TopDownGame.room_6.prototype.__proto__ = TopDownGame.room_1.prototype;
