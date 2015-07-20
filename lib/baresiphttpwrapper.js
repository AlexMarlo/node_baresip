var http = require('http');

var baresipHttpWrapper = exports = module.exports = {};

baresipHttpWrapper.options = {
	host: '127.0.0.1',
	port: '8000',
	path: '/?h',
	agent: false
};

baresipHttpWrapper.getCallList = function( callback) {
	baresipHttpWrapper.sendRequest( '/?l', function( err, res){
		if( err)
			callback( err);

		var rawCallList = baresipHttpWrapper.cutHtmlBody(res);
		var callList = baresipHttpWrapper.parseCallList( res);
		callback( null, callList);
	});
};

baresipHttpWrapper.cutHtmlBody = function( html){
	var result = '';

    if( !html)
        return "";
	var begin = html.indexOf( '<pre>') + 5;
	var end = html.indexOf( '</pre>') - 2;

	result = html.substring(begin, end);
	return result;
};

baresipHttpWrapper.parseCallList = function( rawCalls){
	if( !rawCalls)
		return;
	var callList = [];
	var rawCallList = rawCalls.split( "\n");

	for( var i = 0; i < rawCallList.length; i++) {
		rawCall = rawCallList[i];

		if( rawCall.indexOf( "sip:") != -1)
			callList.push( baresipHttpWrapper.parseCall( rawCall));
	}
    return callList;
};

baresipHttpWrapper.parseCall = function( rawCall) {
	var call = {};

	call.time = rawCall.match( /(\S+)/ig)[0];
	call.status = rawCall.match( /(\S+)/ig)[1];
	call.sip = rawCall.match( /(\S+)/ig)[2];
    call.codec = null;

	var sipArr = call.sip.split(':');
	call.sip = sipArr[1];
    if( call.sip.indexOf(";") != -1){
        var sipArr = call.sip.split(';');
        call.sip = sipArr[0];
        call.codec = sipArr[1];

    }
	return call;
};

baresipHttpWrapper.dial = function( sip, callback) {
	baresipHttpWrapper.sendRequest( '/?d'+sip, function( err, res){
		if( err)
			callback( err);
		callback( null, true);
	});
};

baresipHttpWrapper.hangup = function( callback) {
	baresipHttpWrapper.sendRequest( '/?b', function( err, res){
		if( err)
			callback( err);
		callback( null, true);
	});
};

baresipHttpWrapper.answer = function( callback) {
	baresipHttpWrapper.sendRequest( '/?D', function( err, res){
		if( err)
			callback( err);
		callback( null, true);
	});
};

baresipHttpWrapper.muteUnmute = function( callback) {
    baresipHttpWrapper.sendRequest( '/?m', function( err, res){
        if( err)
            callback( err);
        callback( null, true);
    });
};

baresipHttpWrapper.hold = function( callback) {
    baresipHttpWrapper.sendRequest( '/?x', function( err, res){
        if( err)
            callback( err);
        callback( null, true);
    });
};

baresipHttpWrapper.resume = function( callback) {
    baresipHttpWrapper.sendRequest( '/?X', function( err, res){
        if( err)
            callback( err);
        callback( null, true);
    });
};

baresipHttpWrapper.sendRequest = function( path, callback){
	baresipHttpWrapper.options.path = path;
	http.get( baresipHttpWrapper.options, function( res){
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
