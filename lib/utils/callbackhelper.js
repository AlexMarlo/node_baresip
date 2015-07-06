var callbackHelper = exports = module.exports = {};

callbackHelper.call = function( callback, err, res){
	if( callback && callback instanceof Function)
		callback( err, res);
}
