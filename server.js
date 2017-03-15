var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),	
	fs = require("fs"),
	port = process.env.OPENSHIFT_NODEJS_PORT || 8000,
	server_ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	loadChat = require("./functions/chat.js"); 

server.listen(port, server_ip);
app.use(express.static(__dirname))


var ServerCommands = {
	ChatFunc: "",
	commandHandler: function(eventname, objectFromClient, fs){
		console.log(eventname)
		if(typeof eventname !== "undefined")
			eventname(objectFromClient, fs)
	},
	eventHandler: function(objectFromClient, io, socket, fs){
		ServerCommands.ChatFunc = loadChat(io, socket, fs)
		var eventname;
		
		switch(objectFromClient.command){   
			case ServerCommands.CHANNELMESSAGE:
				eventname = ServerCommands.ChatFunc.CHANNELMESSAGE
				break;
			case ServerCommands.CV:
				eventname = ServerCommands.ChatFunc.CV
				break;
			case ServerCommands.LOGIN:
				eventname = ServerCommands.ChatFunc.ADDUSER
				break;
			case ServerCommands.PICTURE:
				eventname = ServerCommands.ChatFunc.UPDATEPICTURE
				break;
			case ServerCommands.PIVATEMESSAGE:
				eventname = ServerCommands.ChatFunc.PRIVATEMESSAGE 
				break;
			case ServerCommands.UPDATE_ONLINE_PICTURES:
				eventname = ServerCommands.ChatFunc.UPDATE_ONLINE_PICTURES
				break;
			case ServerCommands.USERLIST:
				eventname = ServerCommands.ChatFunc.USERLIST
				break;
			case ServerCommands.QUIT:
				eventname = ServerCommands.ChatFunc.QUIT
				break;
			case ServerCommands.WEBCAM:
				eventname = ServerCommands.ChatFunc.WEBCAM
				break;
				
			default:
				console.log("DEFAULT")
		} 
		ServerCommands.commandHandler(eventname, objectFromClient, fs)
	},
	onDisconnect: function(io, socket){ 
		var evt = {};
		
		evt.command = "quit";
		
		ServerCommands.eventHandler(evt, io, socket, fs)
		
	},
	onError: function(err){ 
		if (err) throw err;
	}
};
ServerCommands.CHANNELMESSAGE = "channelmessage", 
ServerCommands.CV = "cv",
ServerCommands.LOGIN = "login", 
ServerCommands.PICTURE ="picture",
ServerCommands.PRIVATEMESSAGE = "privatemessage", 
ServerCommands.USERLIST = "userlist",
ServerCommands.UPDATE_ONLINE_PICTURES = "update_online_pictures", 
ServerCommands.QUIT = "quit", 
ServerCommands.WEBCAM = "webcam";

io.sockets.on('connection', function(socket) {
	socket.on("command", function(obj){
		ServerCommands.eventHandler(obj, io, socket, fs)
	})
	socket.on("disconnect", function(){
		ServerCommands.onDisconnect(io, socket)
	}) 
	socket.on("error", ServerCommands.onError) 
});  
