var fs = require( 'fs');
var EventEmitter = require( 'events').EventEmitter;
var functionQueue = require( 'function-queue')();

module.exports = Baresip;

util.inherits( Baresip, EventEmitter);

function Baresip(){
	var self = this;

	self.run = function() {


	};

	self.stop = function() {
	};

	self.init = function( callback){

		if( isInit_){
			if( callback != null)
				callback( "Baresip already inited!");
			return;
		}


	};

};
