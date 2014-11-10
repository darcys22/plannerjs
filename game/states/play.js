
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
      var shift = new Shift(this, hour);
      this.shiftGrid.add(shift);
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
