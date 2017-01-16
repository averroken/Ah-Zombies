var TopDownGame = TopDownGame ||  {};

TopDownGame.room_2 = function() {};

// TopDownGame.room_2.prototype = Object.create(TopDownGame.room_1.prototype,{
TopDownGame.room_2.prototype = {
    createMap: function(){
        this.map = this.game.add.tilemap('room_2');
    }
};

TopDownGame.room_2.prototype.__proto__ = TopDownGame.room_1.prototype;
