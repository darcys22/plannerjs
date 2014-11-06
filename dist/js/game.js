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
},{"./states/boot":3,"./states/play":4,"./states/preload":5}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){

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

},{}],4:[function(require,module,exports){

  'use strict';
var Shift = require('../prefabs/shift');

var SHIFT_SIZE = 71;
var SHIFT_HEIGHT = 40;

  function Play() {}
  Play.prototype = {
    create: function() {
      this.game.stage.backgroundColor = 0x333333;
      this.shiftGrid = this.game.add.group();
      this.input.justReleasedRate = 25;

      this.ruler();
      this.buttons();
    },
    update: function() {
      if (game.input.mousePointer.justReleased()) 
        {
          this.shiftAdd(null,null);
        }
    },

//Custom Functions
    shiftAdd:  function(sprite, pointer) {
      var hour = Math.floor(this.game.input.x/71);
      var shift = new Shift(hour);
      this.shiftGrid.add(shift);
    },

    buttons: function() {
      var date = "February 1st 2014"
      var style = { font: "40px Arial", fill: "#9CA2B8" };
      var tdate = game.add.text(10, 10, date, style);

      previus = this.game.add.button(10, 65, 'previous');
      clear = this.game.add.button(10, 110, 'clear', this.clearBut);
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
      rlrbdr.ctx.lineTo(game.width,0);
      rlrbdr.ctx.stroke();

      this.floor = this.game.add.sprite(0,this.game.height-50,rlrbdr);
    }
  };
  
  module.exports = Play;

},{"../prefabs/shift":2}],5:[function(require,module,exports){

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