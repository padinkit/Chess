
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , app = express()
  , http = require('http').createServer(app)
  , io = require('socket.io')(http)
  , path = require('path');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var socket;
io.on('connection', function(obj){
	socket = obj;
	console.log('connection made');
	socket.on('chessmoves',function(data){			
		if(data.side === "white"){
			console.log('white -- ' + data);
			data.side = "black";
			io.sockets.connected[matches[data.matchId].black.id].emit("chessmoves", data);
		}
		else{
			console.log('black -- ' + data);
			data.side = "white";
			io.sockets.connected[matches[data.matchId].white.id].emit("chessmoves", data);
		}
	});
});

/*http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/

var players = [];
var matches = {};


http.listen(app.get('port'), function(){
	  console.log('Express server listening on port: ' + app.get('port'));
});

function checkPlayerId(id) {
  return players.some(function(el) {
    return el.id === id;
  }); 
}

function arrangeMatch(){
	if(players.length >= 2 ){
		var matchId =Math.random().toString(36).slice(2)
		if(matches.matchId){
			arrangeMatch();
			return false;	
		}
		else{
			matches[matchId] = {};
			matches[matchId].white = players.shift();
			matches[matchId].black = players.shift();
		}
		console.log(matches[matchId].white.id);
		io.sockets.connected[matches[matchId].white.id].emit("start", {matchId : matchId, side: "white" });
		io.sockets.connected[matches[matchId].black.id].emit("start", {matchId : matchId, side: "black" });
	}
}

var userPool = [];
app.post('/addPlayer',function(req,res){
	
	function addPlayersInQueue(){
			players.push({playername: req.body.playername , id : req.body.id });	
			console.log(players);
			res.send({playername: req.body.playername , id : req.body.id });
	}
	addPlayersInQueue();
	arrangeMatch();
	
});
