'use strict';

var Shift = function(ctx, hour) {
  //var idCount = 1;
  //return function (ctx, hour) {
    this.position = hour*2;
    this.length = 8;
    this.id = 1 //idCount++;
    this.ctx = ctx;
    this.height = this.addShiftGrid();
  //};  
};

Shift.prototype = Object.create(Phaser.Sprite.prototype);
Shift.prototype.constructor = Shift;

Shift.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};

Shift.shiftArray = [];

Shift.prototype.createSprite = function() {
  var bmd = this.ctx.game.add.bitmapData(this.position/2 * SHIFT_SIZE, SHIFT_HEIGHT);
  bmd.context.fillStyle = 'rgba(255, 0, 0, 0.3)';
  helpers.roundRect(bmd.ctx, 0, 0, bmd.width, bmd.height, 5, true);
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
  var position = Shift.checkGrid(this);
  if (position == -1) {
    Shift.concatArr(Shift.shiftArray, this);
    return Shift.shiftArray.length;
  Shift}
  else {
    Shift.ShiftArray[position] = Shift.addShiftArray(Shift.ShiftArray[position], this)
  }
  return position;
};

//Goes through the shift grid and returns the vertical array index the shift should be in (-1 if it cant fit)
Shift.checkGrid = function(shift) {
 if (Shift.shiftArray.length == 0) return -1;
 return Shift.shiftArray.findIndex(function(x) {
 x.slice(shift.position, shift.position + shift.length).every(function(i) { i == 0 })
 }.first);
}

//creates a new empty single dimension array, then puts the shifts into it
Shift.concatArr = function(arr, shift) {
  var empty = Array.apply(null, new Array(64)).map(Number.prototype.valueOf,0);
  Shift.addShiftArray(empty, shift)
  arr.push(empty);
};

// Given a single dimension array, go through it and add the shifts id to the hours time position
Shift.addShiftArray = function(arr, shift) {
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
