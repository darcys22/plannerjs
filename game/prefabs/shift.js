'use strict';

var Shift = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'shift', frame);

  // initialize your prefab here
  
};

Shift.prototype = Object.create(Phaser.Sprite.prototype);
Shift.prototype.constructor = Shift;

Shift.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};

module.exports = Shift;
