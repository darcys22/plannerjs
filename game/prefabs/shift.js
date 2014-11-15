'use strict';
var Helpers = require('../prefabs/helpers');

var Shift = function(ctx, hour, length) {
    this.plc = (hour * 2);
    this.length = (typeof length === "undefined") ? 8 : length;
    this.id = Shift.idCount++;
    this.ctx = ctx;
    this.gridHeight = this.addShiftGrid();
    this.createSprite();
    ctx.shiftGrid.add(this);
};

Shift.prototype = Object.create(Phaser.Sprite.prototype);
Shift.prototype.constructor = Shift;

Shift.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};

Shift.idCount = 1;
Shift.shiftArray = [];
Shift.SHIFT_SIZE = 71;
Shift.SHIFT_HEIGHT = 40;

Shift.fallCheck = function(deletedPosition, deletedLength, ctx) {
  var fallable = -1;
  var test = Shift.shiftArray.some(
    function(row) {

    var unique = row.filter(function(item, i, ar) { return ar.indexOf(item) === i;});

    var id = unique.find( function(boxId) {
      var box = ctx.shiftGrid.iterate("id", boxId, Phaser.Group.RETURN_CHILD);
      return (box.start >= deletedPosition) && (box.start + box.length) <= (deletedPosition + deletedLength);
    });

    if (id != -1) {fallable = id};
    return id != 1;
  });

  if (test) { Shift.fall(fallable); }

};

Shift.fall = function(id, ctx) {
  var box = ctx.shiftGrid.iterate("id", fallable, Phaser.RETURN_CHILD);
  var posi = box.plc;
  var len = box.length;
  box.moveShift(posi);

  Shift.fallCheck(posi, len);
};

Shift.prototype.createSprite = function() {
  var bmd = this.ctx.game.add.bitmapData(this.length/2 * Shift.SHIFT_SIZE, Shift.SHIFT_HEIGHT);
  bmd.context.fillStyle = 'rgba(255, 0, 0, 0.3)';
  Helpers.RoundRect(bmd.ctx, 0, 0, bmd.width, bmd.height, 5, true);
  Phaser.Sprite.call(this, this.ctx.game, this.xpos(),this.ypos(),bmd);
  this.ctx.game.add.existing(this);

  this.inputEnabled = true;
  this.input.enableDrag();
  this.input.enableSnap(Shift.SHIFT_SIZE/2, Shift.SHIFT_HEIGHT,true,false);


  this.events.onDragStart.add(this.startDrag, this);
  this.events.onDragStop.add(this.stopDrag, this);

  var speed = (this.ctx.game.height - 90 - this.y)*2;
  this.boxTween = this.ctx.game.add.tween(this).to({ y: this.ypos }, speed, Phaser.Easing.Linear.None, true)
};

Shift.prototype.ypos = function() {
  return this.ctx.game.height - 90 - (Shift.SHIFT_HEIGHT * this.gridHeight );
};
Shift.prototype.xpos = function() {
  return (this.plc - this.ctx.scrollStart) * (Shift.SHIFT_SIZE / 2);
};

//takes a shift, adds it to the shiftgrid
Shift.prototype.addShiftGrid = function() {
  var position = Shift.checkGrid(this);
  if (position == -1) {
    Shift.concatArr(Shift.shiftArray, this);
    return (Shift.shiftArray.length - 1);
  } else {
    Shift.shiftArray[position] = Shift.addShiftArray(Shift.shiftArray[position], this)
  }
  return position;
};

Shift.prototype.destroy = function() {
  Shift.clearGrid(this.gridHeight, this.plc, this.length);
  Shift.fallCheck(this.plc, this.length, this.ctx);
  return Phaser.Sprite.prototype.destroy.call(this);
};

//Goes through the shift grid and clears it to a zero
Shift.clearGrid = function(height, start, length) {
  for (var i = start; i < start + length; i++)
  {
    Shift.shiftArray[height][i] = 0;
  }
  return 0;
};

//Goes through the shift grid and returns the vertical array index the shift should be in (-1 if it cant fit)
Shift.checkGrid = function(shift, search) {
 search = (typeof search === "undefined") ? 0 : search;
 if (Shift.shiftArray.length == 0) return -1;
 return Shift.shiftArray.findIndex(function(x) {
 return x.slice(shift.plc, shift.plc + shift.length).every(function(i) { return i == search })
 });
};

//creates a new empty single dimension array, then puts the shifts into it
Shift.concatArr = function(arr, shift) {
  var empty = Array.apply(null, new Array(64)).map(Number.prototype.valueOf,0);
  Shift.addShiftArray(empty, shift)
  arr.push(empty);
};

// Given a single dimension array, go through it and add the shifts id to the hours time position
Shift.addShiftArray = function(arr, shift) {
  for (var i = shift.plc; i < shift.plc + shift.length; i++)
  {
    arr[i] = shift.id;
  }
  return arr;
};

Shift.prototype.startDrag = function(sprite, pointer) {
};
Shift.prototype.stopDrag = function(sprite, pointer) {
  var hour = sprite.x/71;
  sprite.moveShift(hour);
};

Shift.prototype.moveShift = function(position) {
  var length = this.length;
  this.destroy(true);
  new Shift(this.ctx, position, length);
};

module.exports = Shift;
