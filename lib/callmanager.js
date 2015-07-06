var baresipWrapper = require('./baresipwrapper');
var EventEmitter = require( "events").EventEmitter;
var util = require( "util");

module.exports = CallManager;
util.inherits( CallManager, EventEmitter);

function CallManager() {
	var self = this;
	self.callList = {};
	self.incomingCallList = {};
	self.lastIncomingCallId = 0;
	self.callListMonitorTimeout = 2000;

	self.run = function (callback) {

		self.intervalObject = setInterval( function(){
			baresipWrapper.getCallList( function( err, callList){
				if( err)
					console.log( "Error get call list:", err);

				var newCalls = self.findNewCalls( callList);
				var deleteCalls = self.findDeletedCalls( callList);

			});
		}, self.callListMonitorTimeout);
	};

	self.dial = function (sipAddress, callback) {
		self.callList[sipAddress] = {'sip': sipAddress};
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

	self.answer = function (callId, sipAddress) {
		self.callList[callId] = new call(callId, sipAddress);
		delete self.incomingCallList[callId];
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

	self.findNewCalls = function( callList){
		var newCalls = [];
		for (var j in callList) {
			var found = false;
			for (var i in self.callList) {
				if( self.callList[i].sip == callList[j].sip )
					found = true;
			}

			if( !found){
				var newCall = { 'sip': callList[j].sip}
				newCalls.push( newCall);
			}
		}
	}

	self.findDeletedCalls = function( callList){

	}
}