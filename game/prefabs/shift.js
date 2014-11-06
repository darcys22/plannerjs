'use strict';

var Shift = function() {
  var idCount = 1;
  return function (ctx, hour) {
    this.position = hour*2;
    this.length = 8;
    this.id = idCount++;
    this.height = this.addShiftGrid();
    this.ctx = ctx;
  };  
};

Shift.prototype = Object.create(Phaser.Sprite.prototype);
Shift.prototype.constructor = Shift;

Shift.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};

Shift.prototype.createSprite = function() {
  var bmd = this.ctx.game.add.bitmapData(this.position/2 * SHIFT_SIZE, SHIFT_HEIGHT);
  bmd.context.fillStyle = 'rgba(255, 0, 0, 0.3)';
  roundRect(bmd.ctx, 0, 0, bmd.width, bmd.height, 5, true);
  Phaser.Sprite.call(this, this.ctx.game, this.xpos,this.ypos,bmd);

  //this.inputEnabled = true;
  //this.input.enableDrag();
  //this.input.enableSnap(SHIFT_SIZE/2, SHIFT_HEIGHT,true,false);


  //this.events.onDragStart.add(this.startDrag, this);
  //this.events.onDragStop.add(this.stopDrag, this);

  var speed = (this.ctx.game.height - 90 - this.y)*2;
  this.boxTween = this.ctx.game.add.tween(this).to({ y: this.ypos }, speed, Phaser.Easing.Linear.None, true)
};

Shift.prototype.ypos = function() {
  return game.height - GameState.prototype.floor.height - (GameState.prototype.SHIFT_HEIGHT * this.height)
};
Shift.prototype.xpos = function() {
  return (this.position - GameState.prototype.scrollStart) * (GameState.prototype.SHIFT_SIZE / 2)
};

//takes a shift, adds it to the shiftgrid
Shift.prototype.addShiftGrid = function() {
  var position = this.checkGrid(this);
  if (position == -1) {
    this.concatArr(this.ctx.shiftGrid, this);
    return this.ctx.shiftGrid.length;
  }
  else {
    this.ctx.ShiftGrid[position] = this.ctx.addShiftArray(this.ctx.ShiftGrid[position], this)
  }
  return position;
};

//creates a new empty single dimension array, then puts the shifts into it
Shift.prototype.concatArr = function(arr, shift) {
  var empty = Array.apply(null, new Array(64)).map(Number.prototype.valueOf,0);
  this.addShiftArray(empty, shift)
  arr.push(empty);
};

// Given a single dimension array, go through it and add the shifts id to the hours time position
Shift.prototype.addShiftArray = function(arr, shift) {
  for (var i = shift.position; i < shift.position + shift.length; i++)
  {
    arr[i] = shift.id;
  }
  return arr;
};

Shift.prototype.startDrag = function(sprite, pointer) {
};
Shift.prototype.stopDrag = function(sprite, pointer) {
  this.ctx.shiftAdd(sprite,pointer);
  sprite.destroy(true);
};

module.exports = Shift;
