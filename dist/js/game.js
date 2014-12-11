(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(1136, 640, Phaser.AUTO, 'planner');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":4,"./states/play":5,"./states/preload":6}],2:[function(require,module,exports){
'use strict';

var Helpers = function() {
};

/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
Helpers.RoundRect = function(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }        
};

  



module.exports = Helpers;

},{}],3:[function(require,module,exports){
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

Shift.fallCheck = function(deletedRow, ctx) {
  var fallable = -1;
  Shift.shiftArray.slice(deletedRow + 1).some(
    function(row, current) {

    var unique = row.filter(function(item, i, ar) { return ar.indexOf(item) === i;});

    var zero = unique.indexOf(0);
    unique.splice(zero, 1);

    fallable = unique.find( function(boxId) {
      var box = ctx.shiftGrid.iterate("id", boxId, Phaser.Group.RETURN_CHILD);
      return Shift.shiftArray[deletedRow].slice(box.plc,box.plc + box.length).every(function(x) { return x === 0});
    });

    if (fallable && fallable != -1) { 
      return true; 
    }

  });

  if (fallable && fallable != -1) { 
    Shift.fall(fallable, ctx);
    Shift.fallCheck(deletedRow, ctx);
  }

};

Shift.fall = function(id, ctx) {
  var box = ctx.shiftGrid.iterate("id", id, Phaser.Group.RETURN_CHILD);
  var posi = box.plc/2;
  var h = box.gridHeight;
  box.moveShift(posi);

  Shift.fallCheck(h, ctx);
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
  Shift.fallCheck(this.gridHeight, this.ctx);
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
  console.log(position, this.length);
  var length = this.length;
  this.destroy(true);
  new Shift(this.ctx, position, length);
};

module.exports = Shift;

},{"../prefabs/helpers":2}],4:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],5:[function(require,module,exports){

  'use strict';
var Shift = require('../prefabs/shift');
var Helpers = require('../prefabs/helpers');

  function Play() {}
  Play.prototype = {
    create: function() {
      this.game.stage.backgroundColor = 0x333333;
      this.shiftGrid = this.game.add.group();
      this.input.justReleasedRate = 25;
      this.scrollStart = 0;

      this.ruler();
      this.buttons();
    },
    update: function() {
      if (this.game.input.mousePointer.justReleased()) 
        {
          this.shiftAdd(null,null);
        }
    },


//Custom Functions
    shiftAdd:  function(sprite, pointer) {
      var hour = Math.floor(this.game.input.x/71);
      new Shift(this, hour);
    },

    buttons: function() {
      var date = "February 1st 2014"
      var style = { font: "40px Arial", fill: "#9CA2B8" };
      var tdate = this.game.add.text(10, 10, date, style);

      this.previous = this.game.add.button(10, 65, 'previous');
      this.clear = this.game.add.button(10, 110, 'clear', this.clearBut);
    },

    clearBut: function() {
      this.shiftGrid.removeAll()
    },

    ruler: function() {
      var rlrbdr = this.game.add.bitmapData(this.game.width, 50);
      //rlrbdr context is a html5 canvas context so what you draw with that yeah
      rlrbdr.ctx.strokeStyle = "#9CA2B8";
      rlrbdr.ctx.lineWidth=5;
      rlrbdr.ctx.beginPath();
      rlrbdr.ctx.moveTo(0,0);
      rlrbdr.ctx.lineTo(this.game.width,0);
      rlrbdr.ctx.stroke();

      this.floor = this.game.add.sprite(0,this.game.height-50,rlrbdr);
    }
  };
  
  module.exports = Play;

},{"../prefabs/helpers":2,"../prefabs/shift":3}],6:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);

    this.load.image('clear','assets/clear.png');
    this.load.image('previous','assets/previous.png');

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('play');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[1])