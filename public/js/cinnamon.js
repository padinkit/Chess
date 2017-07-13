cinnamonCommand = Module.cwrap('command', 'string', ['string','string'])







var app = angular.module('chess',[]);



app.config([function(){
	
	 
	
	   
}]);


app.controller('playController',['$scope','$http','$interval',function($scope, $http, $interval){
	
	var socket, game, updateStatus;
	
	$scope.capturedPieces = {black : [] , white: [] };
		
	var init = function() {

		//--- start example JS ---
		  board,
		  game = new Chess(),
		  statusEl = $('#status'),
		  fenEl = $('#fen'),
		  pgnEl = $('#pgn');

		var onDragStart = function(source, piece) {
		  // do not pick up pieces if the game is over
		  // or if it's not that side's turn
		  if (game.game_over() === true ||
		      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
		      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
		    return false;
		  }
		};
		var removeGreySquares = function() {
		  $('#board .square-55d63').css('background', '');
		};

		var greySquare = function(square) {
		  var squareEl = $('#board .square-' + square);
		  
		  var background = '#a9a9a9';
		  if (squareEl.hasClass('black-3c85d') === true) {
		    background = '#696969';
		  }

		  squareEl.css('background', background);
		};
		var onDrop = function(source, target) {
		  removeGreySquares();

		  // see if the move is legal
		  var move = game.move({
		    from: source,
		    to: target,
		    promotion: 'q' // NOTE: always promote to a queen for example simplicity
		  });

		  // illegal move
		  if (move === null) return 'snapback';
		  if (move){
			  if(move.captured){
				  if(move.color === 'w'){
					  $scope.capturedPieces.black.push(move.captured); 
				  }
				  else{
					  $scope.capturedPieces.white.push(move.captured); 
				  }
				  
			  }
			  $scope.$apply();
		  }
		  //
		  if($scope.noAI){
			  socket.emit('chessmoves', {move : {from : source , to: target } , side : $scope.userData.side , matchId: $scope.userData.matchId});  
		  }
		  updateStatus($scope.userData.side);
		};

		// update the board position after the piece snap 
		// for castling, en passant, pawn promotion
		var onSnapEnd = function() {
			if(!$scope.noAI){
				board.position(game.fen());
			}
		};

		function engineGo()
		{
			if(!$scope.noAI){
				cinnamonCommand("setMaxTimeMillsec","100")
				cinnamonCommand("position",game.fen())
				var move=cinnamonCommand("go","")
				//alert(move)
				var from=move.substring(0,2);
				var to=move.substring(2,4);
			 	var move = game.move({
			    		from: from,
			   		to: to,
			    		promotion: 'q' // NOTE: always promote to a queen for example simplicity
			  	});
			 	 if (move){
					  if(move.captured){
						  if(move.color === 'w'){
							  $scope.capturedPieces.black.push(move.captured); 
						  }
						  else{
							  $scope.capturedPieces.white.push(move.captured); 
						  }
						  
					  }
				  }
			 	  //$scope.$apply();
			}
		}
		var onMouseoverSquare = function(square, piece) {
		  // get list of possible moves for this square
		  var moves = game.moves({
		    square: square,
		    verbose: true
		  });

		  // exit if there are no moves available for this square
		  if (moves.length === 0) return;

		  // highlight the square they moused over
		  greySquare(square);

		  // highlight the possible squares for this piece
		  for (var i = 0; i < moves.length; i++) {
		    greySquare(moves[i].to);
		  }
		};

		var onMouseoutSquare = function(square, piece) {
		  removeGreySquares();
		};

		 updateStatus = function(side) {
		  var moveColor;
		  if(side ==="white"){
			  if (game.turn() === 'b') {
					engineGo();	    
			  }
		  }
		  else{
			  if (game.turn() === 'w') {
					engineGo();	    
			  }
		  }
		  var status = '';

		  if(side ==="white"){
			  //if (game.turn() === 'b') {
			    moveColor = 'Black';
			  //}
		  }
		  else{
			 // if (game.turn() === 'w') {
			    moveColor = 'White';
			  //}
		  }

		  // checkmate?
		  if (game.in_checkmate() === true) {
		    status = 'Game over, ' + moveColor + ' is in checkmate.';
		  }

		  // draw?
		  else if (game.in_draw() === true) {
		    status = 'Game over, drawn position';
		  }

		  // game still on
		  else {
			if(moveColor){
				moveColor = $scope.userData.side;
			}
		    status = moveColor + ' to move';

		    // check?
		    if (game.in_check() === true) {
		      status += ', ' + moveColor + ' is in check';
		    }
		  }

		  statusEl.html(status);
		  fenEl.html(game.fen());
		  pgnEl.html(game.pgn());


		};

		var cfg = {
		  draggable: true,
		  position: 'start',
		  onDragStart: onDragStart,
		  onDrop: onDrop,
		  moveSpeed: 'medium',
		  onMouseoutSquare: onMouseoutSquare,
		  onMouseoverSquare: onMouseoverSquare,
		  onSnapEnd: onSnapEnd,
		  orientation: $scope.userData.side,
		};
		board = new ChessBoard('board', cfg);
		updateStatus($scope.userData.side);
		$('#startPositionBtn').on('click', function() {
			board.destroy();
			$(document).ready(init);
			
		});

		};
		
	    
	    $('#playgame').modal();
	    
	    var socket = io();
		socket.on('connect', function() {
		  localStorage.setItem('chatid', socket.io.engine.id);
	    });
		
	    $scope.startGame = function(){
	    	
	    	if($scope.against === "Computer" ){
	    		$scope.userData = {};
	    		$scope.userData.side = "white";
	    		$('#playgame').modal('hide');	
	    		init();	    		
	    	}
	    	else{
    		    socket.on('chessmoves', function(data){
    		    	var otherMove = game.move({from : data.move.from , to :data.move.to});
    		    	 if(otherMove.captured){
    					  if(otherMove.color === 'w'){
    						  $scope.capturedPieces.black.push(otherMove.captured); 
    					  }
    					  else{
    						  $scope.capturedPieces.white.push(otherMove.captured); 
    					  }
    					  $scope.$apply(); 
    				  }
    		    	board.move(data.move.from +'-'+ data.move.to);
    		    	
    		    	setTimeout(function(){ 
	    		    	if($scope.userData.side === "white"){
	    		    		updateStatus("black");
	    		    		
	    		    	}
	    		    	else{
	    		    		updateStatus("white");
	    		    	}
    		    	}, 500);
    		    });
    		    
    		    socket.on('start', function(data){
    		     	$('#playgame').modal('hide');
    		     	$interval.cancel(waitTimer);
    		     	$scope.userData = data;
    		    	init();  		    	
    		    });
	    		    
	    		$scope.noAI = true;
	    			

	    		var waitTimer;
		    	$http.post('/addPlayer',{playername: $scope.playername , id : localStorage.getItem('chatid')}).then(function(data){
		    		console.log('waiting for players');
		    		$scope.waiting = true;
		    		
		    		$scope.waitTime = 0;
		    		waitTimer = $interval(function () {
		    			;$scope.waitTime +=1 
	    		    }, 1000);
				});
	    	}
	    };
	    
	    $scope.piecesIcon = function(piece , color){
	    	if(piece+color == 'pwhite'){
	    		return "glyphicon glyphicon-pawn _white";
	    	}
	    	else if(piece+color == 'bwhite'){
	    		return "glyphicon glyphicon-bishop _white";
	    	}
	    	else if(piece+color == 'kwhite'){
	    		return "glyphicon glyphicon-king _white";
	    	}
	    	else if(piece+color == 'nwhite'){
	    		return "glyphicon glyphicon-knight _white";
	    	}
	    	else if(piece+color == 'qwhite'){
	    		return "glyphicon glyphicon-queen _white";
	    	}
	    	else if(piece+color == 'rwhite'){
	    		return "glyphicon glyphicon-tower _white";
	    	}
	    	else if(piece+color == 'bblack'){
	    		return "glyphicon glyphicon-bishop _black";
	    	}
	    	else if(piece+color == 'kblack'){
	    		return "glyphicon glyphicon-king _black";
	    	}
	    	else if(piece+color == 'nblack'){
	    		return "glyphicon glyphicon-knight _black";
	    	}
	    	else if(piece+color == 'pblack'){
	    		return "glyphicon glyphicon-pawn _black";
	    	}
	    	else if(piece+color == 'qblack'){
	    		return "glyphicon glyphicon-queen _black";
	    	}
	    	else if(piece+color == 'rblack'){
	    		return "glyphicon glyphicon-tower _black";
	    	}
	    }

	    

	
}]);
