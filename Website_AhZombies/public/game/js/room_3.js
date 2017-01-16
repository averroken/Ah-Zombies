var TopDownGame = TopDownGame ||  {};
TopDownGame.room_3 = function() {};

TopDownGame.room_3.prototype = {
    createMap: function(){
        this.map = this.game.add.tilemap('room_3');
    }
};

TopDownGame.room_3.prototype.__proto__ = TopDownGame.room_1.prototype;
TopDownGame.room_3.prototype.create().__proto__ = TopDownGame.room_1.prototype.create();