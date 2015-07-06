var readline = require('readline');
var stringHelper = require( '../lib/utils/stringhelper');
var CallManager = require( '../lib/callmanager');

var cliBaresip = exports = module.exports = {};
var commandHistory = [];

function completer(line) {
  var completions = 'help,list,dial,dial 5555@192.168.0.108,hu,hungup,l,list'.split(',');
  var hits = completions.filter(function(c) { return c.indexOf(line) == 0 })
  return [hits.length ? hits : completions, line]
}

cliBaresip.run = function(){
	var rl = readline.createInterface(process.stdin, process.stdout, completer);
	
	rl.setPrompt('> ');
	rl.prompt();
	
	rl.on('line', function(line) {
		var command = stringHelper.explode( " ", line.trim());
		cliBaresip.dispatch( command);
		rl.prompt();
	}).on('close', function() {
		process.exit(0);
	});

	cliBaresip.callManager = new CallManager();
	cliBaresip.callManager.run( function( err){
		if( err)
		{
			console.log( " Error at CallManager run:", err);
			process.exit(0);
		}
	})
};

cliBaresip.addToHistory = function( command){
	commandHistory.push( command);
};

cliBaresip.dispatch = function( command){
	switch ( command[0]) {
		case "help":
			console.log( " help");
			console.log( " list");
			console.log( " dial 234324@localhost");
			console.log( " exit/q/quit");
			break;
//CALLS---------------------------------------------------------------------------------------------

		case "d":
		case "dial":
			if( command.length < 2){
				console.log( "call not enough params! example: dial 234324@localhost");
				break;
			}
			
			var sipAddress = command[1];
			cliBaresip.callManager.dial( sipAddress, function( err, result){
				if( err)
					console.log( "dial err:", err);
				else
					console.log( "dial result:", result);
			});
			break;

		case "hu":
		case "hungup":
			if( command.length < 1){
				console.log( "call not enough params! example: hungup");
				break;
			}

			cliBaresip.callManager.hangup( function( err, result){
				if( err)
					console.log( "hangup err:", err);
				else
					console.log( "hangup result:", result);
			});
			break;

		case "l":
		case "list":
			if( command.length < 1){
				console.log( "call not enough params! example: hungup");
				break;
			}

			console.log( cliBaresip.callManager.getCurrentCalls());
			break;

    	case "exit":
		case "q":
		case "quit":
			process.exit(0);
	}
};

cliBaresip.run();