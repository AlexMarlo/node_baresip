var baresipWrapper = require('./baresiphttpwrapper');
var EventEmitter = require( "events").EventEmitter;
var util = require( "util");

module.exports = Baresip;
util.inherits( Baresip, EventEmitter);

function Baresip() {
	var self = this;
	self.callList = {};
	self.incomingCallList = {};
	self.lastIncomingCallId = 0;
	self.callListMonitorTimeout = 2000;

	self.run = function (callback) {

		self.intervalObject = setInterval( function(){
			baresipWrapper.getCallList( function( err, callList){
				if( err){
                    console.log( "Error get call list:", err);
                    return;
                }

				var newCalls = self.findNewCalls( callList);
				var deleteCalls = self.findDeletedCalls( callList);

                for (var i in newCalls){
                    self.callList[newCalls[i].sip] = newCalls[i];
                    if( newCalls[i].status == "INCOMING") {
                        self.incomingCallList[newCalls[i].sip] = newCalls[i];
                        self.emit("incoming_call", newCalls[i]);
                    }
                }

                for (var i in deleteCalls){
                    delete self.callList[deleteCalls[i].sip];
                    self.emit( "end_call", deleteCalls[i]);
                }
			});
		}, self.callListMonitorTimeout);
	};

	self.dial = function (sipAddress, callback) {
		//self.callList[sipAddress] = {'sip': sipAddress};
		baresipWrapper.dial( sipAddress, function( err, res){
			if( err)
				callback( err);
			callback( null, true);
		});
	};

	self.hangup = function ( callback) {
		baresipWrapper.hangup( function( err, res){
			if( err)
				callback( err);
			callback( null, true);
		});
	};

	self.answer = function ( callback) {
        baresipWrapper.answer( function( err, res){
            if( err)
                callback( err);
            //self.callList[callId] = new call(callId, sipAddress);
            //delete self.incomingCallList[callId];
            callback( null, true);
        });
	};

	self.reject = function (callId, sipAddress) {

		delete self.incomingCallList[callId];
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
}