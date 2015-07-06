var http = require('http');

var baresipWrapper = exports = module.exports = {};

baresipWrapper.options = {
	host: '127.0.0.1',
	port: '8000',
	path: '/?h',
	agent: false
};

baresipWrapper.getCallList = function( callback) {
	baresipWrapper.sendRequest( '/?l', function( err, res){
		if( err)
			callback( err);
console.log(res);
		var rawCallList = baresipWrapper.cutHtmlBody(res);
		var callList = baresipWrapper.parseCallList( res);
		callback( null, callList);
	});
};

baresipWrapper.cutHtmlBody = function( html){
	var result = '';

    if( !html)
        return "";
	var begin = html.indexOf( '<pre>') + 5;
	var end = html.indexOf( '</pre>') - 2;

	result = html.substring(begin, end);
	return result;
};

baresipWrapper.parseCallList = function( rawCalls){
	if( !rawCalls)
		return;
	var callList = [];
	var rawCallList = rawCalls.split( "\n");

	for( var i = 0; i < rawCallList.length; i++) {
		rawCall = rawCallList[i];

		if( rawCall.indexOf( "sip:") != -1)
			callList.push( baresipWrapper.parseCall( rawCall));
	}
};

baresipWrapper.parseCall = function( rawCall) {
	var call = {};

	call.time = rawCall.match( /(\S+)/ig)[0];
	call.status = rawCall.match( /(\S+)/ig)[1];
	call.sip = rawCall.match( /(\S+)/ig)[2];

	var sipArr = call.sip.split(':');
	call.sip = sipArr[1];

	return call;
};

baresipWrapper.dial = function( sip, callback) {
	baresipWrapper.sendRequest( '/?d'+sip, function( err, res){
		if( err)
			callback( err);
		callback( null, true);
	});
};

baresipWrapper.hangup = function( callback) {
	baresipWrapper.sendRequest( '/?b', function( err, res){
		if( err)
			callback( err);
		callback( null, true);
	});
};

baresipWrapper.answer = function( callback) {
	baresipWrapper.sendRequest( '/?D', function( err, res){
		if( err)
			callback( err);
		callback( null, true);
	});
};

baresipWrapper.sendRequest = function( path, callback){
	baresipWrapper.options.path = path;
	http.get( baresipWrapper.options, function( res){
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            callback( null, body);
        });

	}).on('error', function(e) {
		callback( e.message);
	});
};
