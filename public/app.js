$(function() {
	
	FastClick.attach(document.body);
 
	 
   // Bind fields
	 var $window = $(window);
	 var $doc = $(document);
	 
	 var $inputHostName = $('#inputHostName');
	 var $inputRedName = $('#inputRedName'); 
	 var $inputBlueName = $('#inputBlueName'); 
	 var $redTeamName = $('#redTeamName'); 
	 var $blueTeamName = $('#blueTeamName');
	 var $redScore = $('#redScore');
	 var $blueScore = $('#blueScore');
	 var $redTeamRoster = $('#redTeamRoster');
	 var $blueTeamRoster = $('#blueTeamRoster');
	 var $buzzer = $('#buzzer');
	 
	 
	 
	 var $inputGameCode = $('#inputGameCode');
	 
	 // Host Button Binds
	 $doc.on('click', '#btnCreateGame', btnCreateGame);
	 $doc.on('click', '#redPlus', redPlusClick);
	 $doc.on('click', '#redMinus', redMinusClick);
	 $doc.on('click', '#bluePlus', bluePlusClick);
	 $doc.on('click', '#blueMinus', blueMinusClick);
	 $doc.on('click', '#btnResetBuzzer', btnResetBuzzer);
 
	 // Player Button Binds
	 $doc.on('click', '#btnJoinGame', btnJoinGame);
	 $doc.on('click', '#btnJoinGameInPrgs', btnJoinGameInPrgs);
	 $doc.on('click', '#btnHostGameInPrgs', btnHostGameInPrgs);
	 $doc.on('click', '#btnJoinTeam', btnJoinTeam);
	 $doc.on('click', '#btnBuzzIn', btnBuzzIn);
	 
	 
	 var $gameArea = $('#gameArea');
	 var $hostGame = $('#host-game-template').html();
	 
	 var $index = $('#index-template').html();
	 var $joinTeamTemplate = $('#join-team-template').html();
	 var $playerGame = $('#player-game-template').html();
	 var $bottomButton = $('#bottom-button-template').html();
	 var $btnJoinGameInPrgsTemplate = $('#btnJoinGameInPrgs-template').html();
	 var $btnHostGameInPrgsTemplate = $('#btnHostGameInPrgs-template').html();
	 var $topButton = $('#topButton');
 
	 var color = {};
	 color["red"] = "#ee1010";
	 color["blue"] = "#1b5acf";
	 color["default"] = 'url("../img/ktp-pattern.png") center;';
	 var gameCode;
	 var playerName ;
	 var team;
	 var host = false;
	
	 
	//  var socket = io.connect();
	 var socket = io.connect('http://localhost:3000', {
        'reconnection delay': 500, 
        'reconnection limit': Infinity, 
        'max reconnection attempts': Infinity 
	 }); 
 
 // {"gameCode":115,"mySocketId":"EzpOsXu415gadhW9IsUb","redTeam":"sdfsdfsd","blueTeam":"sdfsdfsdf","role":"host"}
 
	 var myCookie = readCookie("tptcookie");
	 if(myCookie){
		  //alert(myCookie);
		 try {
			 var data = JSON.parse(myCookie); // this is how you parse a string into JSON 
			 
			 if(data.role && data.role === 'host'){
				 console.log("Reconnect the host");
 
				 gameCode = data.gameCode;
				 host = true;
	 
				 $gameArea.html($index);
				 $('#bottom').prepend($btnHostGameInPrgsTemplate);
				 $('#btnHostGameInPrgs').html('Rejoin Game: ' + gameCode + " ");
			 }else {
				 playerName = data.playerName;
				 gameCode = data.gameCode;
				 team = data.team;
	 
				 $gameArea.html($index);
				 $('#bottom').prepend($btnJoinGameInPrgsTemplate);
				 $('#btnJoinGameInPrgs').html('Rejoin Game: ' + gameCode + " ");
			 }
 
			 
		 } catch (ex) {
		   console.error(ex);
		 }  
	 }
	 else{
		 $gameArea.html($index);
	 }
   
   
	 
	 
 // HANDLING COOKIES
	 
	 function createCookie(name,value,days) {
		 if (days) {
			 var date = new Date();
			 date.setTime(date.getTime()+(days*24*60*60*1000));
			 var expires = "; expires="+date.toGMTString();
		 }
		 else var expires = "";
		 document.cookie = name+"="+value+expires+"; path=/";
	 }
 
	 function readCookie(name) {
		 var nameEQ = name + "=";
		 var ca = document.cookie.split(';');
		 for(var i=0;i < ca.length;i++) {
			 var c = ca[i];
			 while (c.charAt(0)==' ') c = c.substring(1,c.length);
			 if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		 }
		 return null;
	 }
	 
	 function eraseCookie(name) {
	 //createCookie(name,"",-1);
		 document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	 }
	 
	 
	 
 // BUTTON CLICK EVENTS HOST 
 
	 function btnCreateGame () {
		 //console.log("BUTTON CLICKED");
		 host = true;
		 var hostName = $inputHostName.val();
		 var redTeamName = $inputRedName.val();
		 var blueTeamName = $inputBlueName.val();
		 if ( (redTeamName==null || redTeamName=="") || (blueTeamName==null || blueTeamName=="") || (hostName==null || hostName	=="") )
		  {
		   alert("Please Enter your name and both team names");
		   return false;
		   }
		 
		 socket.emit('createGame', {hostName: hostName, redTeam: redTeamName, blueTeam: blueTeamName});
	 };
	 
	 function redPlusClick() {
		 var e = document.getElementById("pointValue");
		 var points = e.options[e.selectedIndex].value;
		 console.log("Point Value:" + points);
		 socket.emit('redPlus', {gameCode: gameCode, points: points});
	 };
	 
	 function redMinusClick() {
		 var e = document.getElementById("pointValue");
		 var points = e.options[e.selectedIndex].value;
		 console.log("Point Value:" + points);
		 socket.emit('redMinus', {gameCode: gameCode, points: points});	
	 };
	 
 
	 function bluePlusClick() {
		 var e = document.getElementById("pointValue");
		 var points = e.options[e.selectedIndex].value;
		 console.log("Point Value:" + points);
		 socket.emit('bluePlus', {gameCode: gameCode, points: points});	
	 };
	 
	 
	 function blueMinusClick() {
		 var e = document.getElementById("pointValue");
		 var points = e.options[e.selectedIndex].value;
		 console.log("Point Value:" + points);
		 socket.emit('blueMinus', {gameCode: gameCode, points: points});
	 };
	 
	 function btnResetBuzzer () {
		 socket.emit('resetBuzzer', {gameCode: gameCode});
	 }
 
	 
	 
 //  BUTTON CLICK EVENTS PLAYER 
 
	 function btnJoinGame () {
		 gameCode = document.getElementById("inputGameCode").value; 
		 socket.emit('joinGame', {gameCode: gameCode});
	 }
	 
	 function btnHostGameInPrgs (data) {
		 try {
			 var data = JSON.parse(myCookie); // this is how you parse a string into JSON 
			 gameCode = data.gameCode;
			 host = true;
		 } catch (ex) {
		   console.error(ex);
		 }
		 
		 socket.emit('hostRejoinGame', {gameCode: gameCode});
	 }	
	 function btnJoinGameInPrgs (data) {
		 try {
			 var data = JSON.parse(myCookie); // this is how you parse a string into JSON 
			 playerName = data.playerName;
			 gameCode = data.gameCode;
			 team = data.team;
   
			 $gameArea.html($index);
			 $('#topBody').prepend($btnJoinGameInPrgsTemplate);
			 $('#btnJoinGameInPrgs').html(playerName + ' | Game: ' + gameCode + " ");
		 } catch (ex) {
		   console.error(ex);
		 }
		 
		 socket.emit('joinGame', {gameCode: gameCode});
		 socket.emit('joinTeam', {gameCode: gameCode, playerName: playerName, team: team});
	 }	
	 
	 function btnJoinTeam () {
		 playerName = document.getElementById("inputPlayerName").value;
		 
		 if ((playerName == null || playerName==""))
		 {
		   alert("Please enter your Name");
		   return false;
		 }
		 
		 // THIS NEED FIXING
		 if(document.getElementById("redRadio").checked)
			 team = "red";
		 else if (document.getElementById("blueRadio").checked)
			 team = "blue";
		 else {
			 alert("Please Select your team");
			 return false;
		 }
		 
	 //create cookie
		 var data = {
			 gameCode: gameCode,
			 playerName: playerName,
			 team: team, 
			 role: 'player'
		 };
 
		 createCookie("tptcookie", JSON.stringify(data), 1);
		 
		 socket.emit('joinTeam', {playerName: playerName, team: team, gameCode: gameCode});
	 }
	 
	 function btnBuzzIn () {
		 socket.emit('playerBuzzedIn', {playerName: playerName, team: team, gameCode: gameCode});
	 }
	 
	 function teamJoined (data){
		 $gameArea.html($playerGame);
		 
		 $('#redTeamName').html(data.redTeam[0]);	
		 $('#blueTeamName').html(data.blueTeam[0]);	
				 
		 updateScore({gameCode: data.gameCode});
		 updateRoster({gameCode: data.gameCode});
		 
	 }
	 
	 
 // FUNCTIONS
	 function updateScore(data){
		 socket.emit("updateScore", {gameCode: data.gameCode});		
	 };
	 
	 
	 function updateRoster(data){
		 socket.emit("updateRoster", {gameCode: data.gameCode});		
	 };
	 
 
	 
 // SOCKET EVENTS
 
 
 // Whenever the server emits 'newGameCreated'
	 socket.on('newGameCreated', function (data) {
		 gameCode = data.gameCode;
		 
		 $gameArea.html($hostGame);
		 $('#redTeamName').html(data.redTeam);	
		 $('#blueTeamName').html(data.blueTeam);	
		 $('#gameCode').html("Game Code: " + data.gameCode);	
		 
		 updateScore({gameCode: data.gameCode});
		 updateRoster({gameCode: data.gameCode});
		 
		 //create cookie
		 data.role = "host";
		 createCookie("tptcookie", JSON.stringify(data), 1);
		 
	 });
 
   
	 socket.on('hostRejoined', function (data) {
		 $gameArea.html($hostGame);
		 $('#redTeamName').html(data.redTeam);	
		 $('#blueTeamName').html(data.blueTeam);	
		 $('#gameCode').html("Game Code: " + data.gameCode);	
		 
		 updateScore({gameCode: data.gameCode});
		 updateRoster({gameCode: data.gameCode});
		 
	 });
 
	 socket.on('scoreUpdate', function (data) {
		 $('#redScore').html(data.redScore);	
		 $('#blueScore').html(data.blueScore);
	 });
	 
	 socket.on('rosterUpdate', function (data) {
		 var $redRoster= '';
		 var $blueRoster= '';
		 
		 for(i=1; i<data.redTeam.length; i++){
			 $redRoster += `<li>${data.redTeam[i]}</li>`;
		 }
		 
		 for(j=1; j<data.blueTeam.length; j++){
			 $blueRoster += `<li>${data.blueTeam[j]}</li>`;
		 }
		 
		 $('#redTeamRoster').html($redRoster);	
		 $('#blueTeamRoster').html($blueRoster);
		 
	 });
 
	 socket.on('gameJoined', function (data){
		 //console.log("Joined GAME" + data);
		 $gameArea.html($joinTeamTemplate);
		 
		 $('label[for=redRadio]').html(data.redTeam);
		 $('label[for=blueRadio]').html(data.blueTeam);
 
	 });
	 
	 socket.on('teamJoined', function (data){
		 //console.log("Joined GAME" + data);
		 teamJoined(data);
	 });
	 
	 
	 socket.on('buzzerOff', function (data){
		 var $bot = document.getElementById("bottom");
		 var audio = new Audio('buzzer.mp3');
		 audio.play();
		 $bot.innerHTML = `<span>${data.playerName}!</span>`;
		 $bot.style.background = color[data.team];
	 });
	 
	 socket.on('buzzerOn', function (data){
		 var $bot = document.getElementById("bottom");
		//  $bot.style.background = color["default"];
		 $bot.style.background = null;
		 if(host){
			 $bot.innerHTML = '';
		 }
		 else if (!(playerName == null || playerName=="")) {
			 $bot.innerHTML = $bottomButton;
		 }
	 });
	 
	 socket.on('error', function (data) {
		 if(data.error == 7){
			 eraseCookie("tptcookie");
			 window.location.reload();
			 alert(data.message);
			 
		 }
		 else{
			 alert(data.message);
		 }
	 });

	 socket.on('ping', function(data){
		console.log('Ping received.');
		socket.emit('pong', {beat: 1});
	  });

	socket.on('disconnect', function(){
		socket.socket.connect();
	});
 });
 
 