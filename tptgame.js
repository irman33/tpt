var io;
var gameSocket;
var allClients = [];

var fs = require('fs');
// var csvWriter = require('csv-write-stream');
// var writer = csvWriter();

/**
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
	
	allClients.push(gameSocket);

    //gameSocket.emit('connected', { message: "You are connected!" });

    // Host Events
    gameSocket.on('createGame', hostCreateNewGame);
    gameSocket.on('hostRejoinGame', hostRejoinGame);
    
	gameSocket.on('redPlus', redPlus);
	gameSocket.on('redMinus', redMinus);
	gameSocket.on('bluePlus', bluePlus);
	gameSocket.on('blueMinus', blueMinus);
	gameSocket.on('resetBuzzer', resetBuzzer);

    // Player Events
    gameSocket.on('joinGame', playerJoinGame);
    gameSocket.on('joinTeam', playerJoinTeam);
    gameSocket.on('playerBuzzedIn', playerBuzzedIn);
	
	
	//Game Events
	gameSocket.on('updateScore', updateScore);
	gameSocket.on('updateRoster', updateRoster);
	gameSocket.on('disconnect', disconnect);

}

var Games = {};


//Defines the Poll Object
function Game (data) {
	this.gameCode = data.gameCode;
	this.redTeam = [];
	this.blueTeam = [];
	this.redTeam[0] = data.redTeam;
	this.blueTeam[0] = data.blueTeam;
	this.redScore = 0;
	this.blueScore = 0;
	this.buzzOn = true;
	
	console.log(this);
}


	/*         HOST FUNCTIONS
	******************************* */

/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 */
function hostCreateNewGame(data) {
	// A reference to the player's Socket.IO socket object
    var sock = this;
    
	console.log("Host Create New Game");
    // Create a unique Socket.IO Room
    var gameCode = ( Math.random() * 1000 ) | 0;
    
    data.gameCode = gameCode;
    // Return the Room ID (gameCode) and the socket ID (mySocketId) to the browser client
    this.emit('newGameCreated', {gameCode: data.gameCode, mySocketId: this.id, redTeam: data.redTeam, blueTeam: data.blueTeam});

    // Join the Room and wait for the players
    this.join(gameCode.toString());
	Games[gameCode] = new Game(data);
    
    var i = allClients.indexOf(sock);
	allClients[i].playerName = data.playerName;
	allClients[i].gameCode = data.gameCode;
	allClients[i].team = "host";  // red or blue for players, host for host.   
};

/* Host has disconnected and is now rejoining via saved cookie.
* @param data Contains gameCode.
*/
function hostRejoinGame(data) {

   // A reference to the host's Socket.IO socket object
   var sock = this;

   // Look up the room ID in the Socket.IO manager object.
   var room = gameSocket.manager.rooms["/" + data.gameCode];

   // If the room exists...
   if( room != undefined ){
       // attach the socket id to the data object.
       //data.mySocketId = sock.id;
    //    data.blueTeam = Games[data.gameCode].blueTeam[0];
    //    data.redTeam = Games[data.gameCode].redTeam[0];
       // Join the room
       sock.join(data.gameCode);
       sock.emit('hostRejoined', data);
   } else {
       // Otherwise, send an error message back to the player.
       this.emit('error',{error: 7, message: "This Game Room does not exist."} );
   }
}



   /*     PLAYER FUNCTIONS        
   ***************************** */

/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameCode entered by the player.
 * @param data Contains data entered via player's input - playerName and gameCode.
 */
function playerJoinGame(data) {

    // A reference to the player's Socket.IO socket object
    var sock = this;

    // Look up the room ID in the Socket.IO manager object.
    var room = gameSocket.manager.rooms["/" + data.gameCode];

    // If the room exists...
    if( room != undefined ){
        // attach the socket id to the data object.
        //data.mySocketId = sock.id;
		data.blueTeam = Games[data.gameCode].blueTeam[0];
		data.redTeam = Games[data.gameCode].redTeam[0];
        // Join the room
        sock.join(data.gameCode);
		sock.emit('gameJoined', data);
    } else {
        // Otherwise, send an error message back to the player.
        this.emit('error',{error: 7, message: "This Game Room does not exist."} );
    }
}


function playerJoinTeam(data) {

    // A reference to the player's Socket.IO socket object
    var sock = this;
	
	var i = allClients.indexOf(sock);
	allClients[i].playerName = data.playerName;
	allClients[i].gameCode = data.gameCode;
	
    if (!(typeof Games[data.gameCode] == 'undefined')) {

        if(data.team == "red"){
            Games[data.gameCode].redTeam.push(data.playerName);
            allClients[i].team = "red";
        }
        else if(data.team == "blue"){
            Games[data.gameCode].blueTeam.push(data.playerName);
            allClients[i].team = "blue";
        }

        data.redTeam = Games[data.gameCode].redTeam;
        data.blueTeam = Games[data.gameCode].blueTeam;

        // Emit an event notifying the clients that the player has joined the room.
        sock.emit(data.gameCode).emit('teamJoined', data);
        console.log(Games[data.gameCode]);
    }
    else {
        // Otherwise, send an error message back to the player.
        console.log("error 7 Player Join Team - Room no exist");
        this.emit('error',{error: 7, message: "This Game Room does not exist."} );
    }
}


function playerBuzzedIn(data) {
    if (!(typeof Games[data.gameCode] == 'undefined')) {
        if(Games[data.gameCode].buzzOn){
            Games[data.gameCode].buzzOn = false;
            io.sockets.in(data.gameCode).emit('buzzerOff', {playerName: data.playerName, team: data.team});
	   }
    }
}

function resetBuzzer(data) {
	
	if (!(typeof Games[data.gameCode] == 'undefined')) {
		Games[data.gameCode].buzzOn = true;
		io.sockets.in(data.gameCode).emit('buzzerOn', {playerName: data.playerName, team: data.team});
	}
	else {
		this.emit('error',{message: "This game has ended."} );
	}
}


function updateScore(data) {
	//console.log(data.gameCode);
	//console.log(Games[data.gameCode]);
    // updateScoreCsv(data.gameCode);
	io.sockets.in(data.gameCode).emit('scoreUpdate', {redScore: Games[data.gameCode].redScore, blueScore: Games[data.gameCode].blueScore});
}

function updateRoster(data) {
	if (!(typeof Games[data.gameCode]== 'undefined')) {
		io.sockets.in(data.gameCode).emit('rosterUpdate', {redTeam: Games[data.gameCode].redTeam, blueTeam: Games[data.gameCode].blueTeam});
	}	
}

function redPlus (data){
	if (!(typeof Games[data.gameCode] == 'undefined')) {
		Games[data.gameCode].redScore += Number(data.points);
		updateScore(data);
	}
	else {
		this.emit('error',{message: "This game has ended."} );
	}
		
}

function redMinus (data){
	if (!(typeof Games[data.gameCode] == 'undefined')) {
		Games[data.gameCode].redScore -= Number(data.points);
		updateScore(data);
	}
	else {
		this.emit('error',{message: "This game has ended."} );
	}
}

function bluePlus (data){
	if (!(typeof Games[data.gameCode] == 'undefined')) {
		Games[data.gameCode].blueScore += Number(data.points);
		updateScore(data);
	}
	else {
		this.emit('error',{message: "This game has ended."} );
	}
}

function blueMinus(data){
	if (!(typeof Games[data.gameCode] == 'undefined')) {
		Games[data.gameCode].blueScore -= Number(data.points);
		updateScore(data);
	}
	else {
		this.emit('error',{message: "This game has ended."} );
	}
}

function disconnect() {
    
	socket = this;
	
    var i = allClients.indexOf(socket);
	var gameCode = allClients[i].gameCode;
	var playerName = allClients[i].playerName;
	var team = allClients[i].team;
	
	if (!(allClients[i].playerName==null) || !(allClients[i].playerName=="")) {
		if(!(gameCode==null) || !(gameCode=="")) {
			
            console.log('Got disconnect:' + playerName );
            if(team == 'host'){
                
                // destroy the room
                console.log("error 7 Host Disconnected");
                // io.sockets.in(gameCode).emit('error',{error: 7, message: "Host ended the game."} );
                //io.sockets.clients(gameCode).forEach(function(s){
                //    s.leave(gameCode);
                //});
                // free up game memory
                // delete Games[gameCode];
                
            }
			else if(team == 'red'){
                if (!(typeof Games[gameCode] == 'undefined')) {
                    var j = Games[gameCode].redTeam.indexOf(playerName);
                    // Remove Player from Team Roster on Disconnect  - RedTeam
                    Games[gameCode].redTeam.splice(j, 1);
                }
			}
			else if(team == 'blue'){
                if (!(typeof Games[gameCode] == 'undefined')) {
                    var j = Games[gameCode].blueTeam.indexOf(playerName);
                    // Remove Player from Team Roster on Disconnect  - BlueTeam
                    Games[gameCode].blueTeam.splice(j, 1);
                }
			}
			
			//Remove Socket of Client on Disconnect
			//console.log("Removed: " +  playerName);
			allClients.splice(i, 1);
			updateRoster({gameCode: gameCode});
		}
		
	}
   };


// function updateScoreCsv (gameCode) {
//     console.log("Red:" + Games[gameCode].redScore +" Blue:" + Games[gameCode].blueScore);
//     var fileName ="./public/" + gameCode + "_score.csv";
//     console.log(fileName);
//     var data = [["RedTeam", "BlueTeam"],[Games[gameCode].redScore,Games[gameCode].blueScore]];
//     var writer = csvWriter({ headers: ["RedTeam", "BlueTeam"]})
//     writer.pipe(fs.createWriteStream(fileName));
//     writer.write([Games[gameCode].redScore, Games[gameCode].blueScore]);
//     writer.end();

// }



