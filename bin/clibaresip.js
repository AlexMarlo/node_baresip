var readline = require('readline');
var stringHelper = require( '../lib/utils/stringhelper');
var Baresip = require( '../lib/baresip');

var cliBaresip = exports = module.exports = {};
var commandHistory = [];

function completer(line) {
  var completions = 'help,list,dial,dial 5555@192.168.0.108,hu,hungup,l,list,a,answer,m,hold,r,resume'.split(',');
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

	cliBaresip.Baresip = new Baresip();
    cliBaresip.Baresip.on( "incoming_call", function( call){
        console.log( "New call", call);
    });
    cliBaresip.Baresip.on( "established_call", function( call){
        console.log( "Established call", call);
    });
    cliBaresip.Baresip.on( "end_call", function( call){
        console.log( "Del call", call);
    });
	cliBaresip.Baresip.run( function( err){
		if( err)
		{
			console.log( " Error at Baresip run:", err);
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
			console.log( " answer");
			console.log( " hungup");
			console.log( " hold");
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
			cliBaresip.Baresip.dial( sipAddress, function( err, result){
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

			cliBaresip.Baresip.hangup( function( err, result){
				if( err)
					console.log( "hangup err:", err);
				else
					console.log( "hangup result:", result);
			});
			break;

		case "a":
		case "answer":
			cliBaresip.Baresip.answer( function( err, result){
				if( err)
					console.log( "answer err:", err);
				else
					console.log( "answer result:", result);
			});
			break;

		case "m":
		case "mute":
			cliBaresip.Baresip.muteUnmute( function( err, result){
				if( err)
					console.log( "mute err:", err);
				else
					console.log( "mute result:", result);
			});
			break;

		case "hold":
			cliBaresip.Baresip.hold( function( err, result){
				if( err)
					console.log( "hold err:", err);
				else
					console.log( "hold result:", result);
			});
			break;

		case "resume":
			cliBaresip.Baresip.resume( function( err, result){
				if( err)
					console.log( "resume err:", err);
				else
					console.log( "resume result:", result);
			});
			break;

		case "l":
		case "list":
			console.log( cliBaresip.Baresip.getCurrentCalls());
			break;

    	case "exit":
		case "q":
		case "quit":
			process.exit(0);
	}
};

cliBaresip.run();