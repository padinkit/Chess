
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

io.on('connection', function(socket){
	console.log('connectiong made');
	socket.on('chat',function(data){
		console.log(data.msg);
		io.emit('chat',data);
	});
});

/*http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/

http.listen(app.get('port'), function(){
	  console.log('Express server listening on port: ' + app.get('port'));
});

