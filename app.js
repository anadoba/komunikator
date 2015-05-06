/* jshint node: true */
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

io.sockets.on("connection", function (socket) {
    socket.on("login", function (data) {
        io.sockets.emit("chat", "Użytkownik <b>" + data + "</b> dołączył do chatu.");
        console.log(data);
    });
    socket.on("message", function (data) {
        io.sockets.emit("chat", "<b>" + data.login + "</b>: " + data.message);
        console.log(data);
    });
    socket.on("error", function (err) {
        console.dir(err);
    });
});

httpServer.listen(port, function () {
    console.log('Serwer HTTP działa na porcie ' + port);
});
