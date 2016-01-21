var http = require('http');

module.exports = BaresipWrapper;

function BaresipWrapper( config) {
	var self = this;

	self.options = {
		host: '127.0.0.1',
		port: '8000',
		path: '/?h',
		agent: false
	};
	if( config && config.host)
		self.options.host = config.host;

	if( config && config.port)
		self.options.port = config.port;

	self.getCallList = function (callback) {
		self.sendRequest('/?l', function (err, res) {
			if (err)
				callback(err);

			var rawCallList = self.cutHtmlBody(res);
			var callList = self.parseCallList(res);
			callback(null, callList);
		});
	};

	self.cutHtmlBody = function (html) {
		var result = '';

		if (!html)
			return "";
		var begin = html.indexOf('<pre>') + 5;
		var end = html.indexOf('</pre>') - 2;

		result = html.substring(begin, end);
		return result;
	};

	self.parseCallList = function (rawCalls) {
		if (!rawCalls)
			return;
		var callList = [];
		var rawCallList = rawCalls.split("\n");

		for (var i = 0; i < rawCallList.length; i++) {
			rawCall = rawCallList[i];

			if (rawCall.indexOf("sip:") != -1)
				callList.push(self.parseCall(rawCall));
		}
		return callList;
	};

	self.parseCall = function (rawCall) {
		var call = {};

		call.time = rawCall.match(/(\S+)/ig)[0];
		call.status = rawCall.match(/(\S+)/ig)[1];
		call.sip = rawCall.match(/(\S+)/ig)[2];
		call.codec = null;

		var sipArr = call.sip.split(':');
		call.sip = sipArr[1];
		if (call.sip.indexOf(";") != -1) {
			var sipArr = call.sip.split(';');
			call.sip = sipArr[0];
			call.codec = sipArr[1];

		}
		return call;
	};

	self.dial = function (sip, callback) {
		self.sendRequest('/?d' + sip, function (err, res) {
			if (err)
				callback(err);
			callback(null, true);
		});
	};

	self.hangup = function (callback) {
		self.sendRequest('/?b', function (err, res) {
			if (err)
				callback(err);
			callback(null, true);
		});
	};

	self.answer = function (callback) {
		self.sendRequest('/?D', function (err, res) {
			if (err)
				callback(err);
			callback(null, true);
		});
	};

	self.muteUnmute = function (callback) {
		self.sendRequest('/?m', function (err, res) {
			if (err)
				callback(err);
			callback(null, true);
		});
	};

	self.holdPreviousCall = function (callback) {
		self.sendRequest('/?H', function (err, res) {
			if (err)
				callback(err);
			callback(null, true);
		});
	};

	self.switchAudioDevice = function ( device, callback) {
		self.sendRequest('/?A' + device, function (err, res) {
			if (err)
				callback(err);
			callback(null, true);
		});
	};

	self.hold = function (callback) {
		self.sendRequest('/?x', function (err, res) {
			if (err)
				callback(err);
			callback(null, true);
		});
	};

	self.resume = function (callback) {
		self.sendRequest('/?X', function (err, res) {
			if (err)
				callback(err);
			callback(null, true);
		});
	};

	self.sendRequest = function (path, callback) {
		self.options.path = path;
		http.get(self.options, function (res) {
			var body = '';
			res.on('data', function (chunk) {
				body += chunk;
			});
			res.on('end', function () {
				callback(null, body);
			});

		}).on('error', function (e) {
			callback(e.message);
		});
	};
};
