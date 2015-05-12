/* jshint node: true */
/* global $: false */
var app = require("express")();
var httpServer = require("http").Server(app);
var io = require("socket.io")(httpServer);

var static = require('serve-static');
var port = process.env.PORT || 3000;

var oneDay = 86400000;

app.use('/img', static(__dirname + '/public/img', { maxAge: oneDay }));
app.use('/js/jquery.min.js', static(__dirname + '/bower_components/jquery/dist/jquery.min.js'));
app.use('/js/jquery.min.map', static(__dirname + '/bower_components/jquery/dist/jquery.min.map'));
app.use(static(__dirname + '/public'));

var ChatEntry = require('./model/chatEntry');
var ChatUser = require('./model/chatUser');

var loggedInUsers = [];
var chatHistory = [];

io.sockets.on("connection", function (socket) {
    socket.on("login", function (data) {
        var response;
        
        if (loggedInUsers.map(function (user) { return user.login; }).indexOf(data) == -1) {
            response = {
                "success": true,
                "message": "Zalogowano pomyślnie jako " + data  
            };
        } else {
            response = {
                "success": false,
                "message": "W systemie istnieje obecnie użytkownik zalogowany jako " + data  
            };    
        }
        
        socket.emit('loginResponse', response);
        console.log(response);
        
        if (response.success === true) {
            var user = new ChatUser(socket.id, data);
            loggedInUsers.push(user);
            for(var index in chatHistory) { 
                var attr = chatHistory[index]; 
                socket.emit('chat', attr.time + " <b>" + attr.login + "</b>: " + attr.message);
            }

            var currentTime = new Date();
            var entry = new ChatEntry(currentTime.getHours() + ':' + currentTime.getMinutes() + ':' + currentTime.getSeconds(), data, ' <i>dołączył do chatu.</i>');
            chatHistory.push(entry);
            io.sockets.emit("chat", entry.time + " <b>" + entry.login + "</b>: " + entry.message);

            console.log(user);
        }
    });
    socket.on("message", function (data) {
        var currentTime = new Date();
        var entry = new ChatEntry(currentTime.getHours() + ':' + currentTime.getMinutes() + ':' + currentTime.getSeconds(), data.login, data.message);
        chatHistory.push(entry);
        io.sockets.emit("chat", entry.time + " <b>" + entry.login + "</b>: " + entry.message);
        console.log(entry);
    });
    socket.on('disconnect', function () {
        var index = loggedInUsers.map(function (user) { return user.id; }).indexOf(socket.id);
        
        if (loggedInUsers[index] === undefined) {
            return;
        }
        
        var currentTime = new Date();
        var entry = new ChatEntry(currentTime.getHours() + ':' + currentTime.getMinutes() + ':' + currentTime.getSeconds(), loggedInUsers[index].login, ' <i>wyszedł z chatu.</i>');
        chatHistory.push(entry);
        io.sockets.emit("chat", entry.time + " <b>" + entry.login + "</b>: " + entry.message);
        console.log(entry);
        
        loggedInUsers.splice(index, 1);
    });
    socket.on("error", function (err) {
        console.dir(err);
    });
});

httpServer.listen(port, function () {
    console.log('Serwer HTTP działa na porcie ' + port);
});
