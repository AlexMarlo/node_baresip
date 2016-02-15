var BaresipWrapper = require('./baresiphttpwrapper');
var EventEmitter = require( "events").EventEmitter;
var util = require( "util");

module.exports = Baresip;
util.inherits( Baresip, EventEmitter);

function Baresip( config) {
	var self = this;
	self.config = config;
	self.callList = {};
	self.incomingCallList = {};
	self.lastIncomingCallId = 0;
	self.callListMonitorTimeout = 2000;
	self.baresipWrapper = new BaresipWrapper( config);

	self.run = function (callback) {

		self.intervalObject = setInterval( function(){
            self.baresipWrapper.getCallList( function( err, callList){
				if( err){
                    console.log( "Error get call list:", err, config);
                    var callList = [];
                }
				var esatblishedCalls = self.findEsatblishedCalls( callList);
				var newCalls = self.findNewCalls( callList);
				var deleteCalls = self.findDeletedCalls( callList);

                for (var i in newCalls){
                    // ADD CALL
                    self.callList[newCalls[i].sip] = newCalls[i];
                    self.callList[newCalls[i].sip].id = self.generateCallId();

                    self.emit( "new_call", self.callList[newCalls[i].sip]);

                    if( newCalls[i].status == "INCOMING") {
                        self.emit("incoming_call", newCalls[i]);
                    }
                    else if( newCalls[i].status == "ESTABLISHED"){
                        self.emit( "established_call", self.callList[newCalls[i].sip]);
                    }
                }

                for (var i in deleteCalls){
                    delete self.callList[deleteCalls[i].sip];
                    self.emit( "end_call", deleteCalls[i]);
                }

                for( var i in esatblishedCalls) {
                    self.callList[esatblishedCalls[i].sip].status = "ESTABLISHED";
                    self.emit( "established_call", esatblishedCalls[i]);
                }
			});
		}, self.callListMonitorTimeout);
	};

	self.dial = function (sipAddress, callback) {
        self.baresipWrapper.dial( sipAddress, function( err, res){
			if( err)
				callback( err);
			callback( null, true);
		});
	};

	self.hangup = function ( callback) {
        self.baresipWrapper.hangup( function( err, res){
			if( err)
				callback( err);
			callback( null, true);
        });
	};

	self.answer = function ( callback) {
        self.baresipWrapper.answer( function( err, res){
            if( err)
                callback( err);
            callback( null, true);
        });
	};

    self.muteUnmute = function ( callback) {
        self.baresipWrapper.muteUnmute( function( err, res){
            if( err)
                callback( err);
            callback( null, true);
        });
    };

    self.holdPreviousCall = function ( callback) {
        self.baresipWrapper.holdPreviousCall( function( err, res){
            if( err)
                callback( err);
            callback( null, true);
        });
    };

    self.resumePreviousCall = function ( callback) {
        self.baresipWrapper.resumePreviousCall( function( err, res){
            if( err)
                callback( err);
            callback( null, true);
        });
    };

    self.switchAudioDevice = function ( device, callback) {
        self.baresipWrapper.switchAudioDevice( device, function( err, res){
            if( err)
                callback( err);
            callback( null, true);
        });
    };

    self.hold = function ( callback) {
        self.baresipWrapper.hold( function( err, res){
            if( err)
                callback( err);
            callback( null, true);
        });
    };

    self.resume = function ( callback) {
        self.baresipWrapper.resume( function( err, res){
            if( err)
                callback( err);
            callback( null, true);
        });
    };

    self.getCurrentCalls = function () {
		var callList = [];
		for (var i in self.callList)
			callList.push(self.callList[i]);

		return callList;
	};

	self.findCallBySip = function (sipAddress) {
		var call = null;
		for (var i in self.callList) {
			if (self.callList[i].address == sipAddress) {
				call = self.callList[i];
				break;
			}
		}

		return call;
	};

	self.findNewCalls = function( newCallList){
		var newCalls = [];
		for (var j in newCallList) {
			var found = false;
			for (var i in self.callList) {
				if( self.callList[i].sip == newCallList[j].sip )
					found = true;
			}

			if( !found)
				newCalls.push( newCallList[j]);
		}
        return newCalls;
	}

	self.findDeletedCalls = function( newCallList){
        var delCalls = [];
        for (var i in self.callList) {
            var found = false;
            for (var j in newCallList) {
                if( self.callList[i].sip == newCallList[j].sip )
                    found = true;
            }

            if( !found)
                delCalls.push( self.callList[i]);
        }
        return delCalls;
	}

    self.findEsatblishedCalls = function( newCallList){
        var establishedCalls = [];
        for (var j in newCallList) {
            var found = false;
            for (var i in self.callList) {
                if( self.callList[i].sip == newCallList[j].sip
                && self.callList[i].status != newCallList[j].status
                && newCallList[j].status == "ESTABLISHED"){
                    establishedCalls.push( self.callList[i]);
                }
            }
        }
        return establishedCalls;
    }

    self.generateCallId = function(){
        return Date.now();
    }
}