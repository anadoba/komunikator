/* jshint browser: true, globalstrict: true, devel: true */
/* global io: false */
/* global $: false */
"use strict";

// jQuery
$(document).ready(function () {
    var socket;
    
    $('#loginText').on('input', function() {
       if (this.value.length === 0) {
           $('#open').prop("disabled", true);
       } else {
           $('#open').prop("disabled", false);
       }
    });
    
    // Stan wejściowy
    $('#status').text = "Brak połączenia";
    $('#close').prop("disabled", true);
    $('#open').prop("disabled", true);
    $('#send').prop("disabled", true);
    
    // Po kliknięciu guzika „Połącz” tworzymy nowe połączenie WS
    $('#open').click(function () {
        //$('#open').prop("disabled", true);
        if (!socket || !socket.connected) {
            socket = io({forceNew: true});
        }
        socket.on('connect', function () {
            console.log('Nawiązano połączenie przez Socket.io');
            socket.emit('login', $('#loginText').val());
        });
        socket.on('loginResponse', function (data) {
            if (data.success === true) {
                $('#close').prop("disabled", false);
                $('#send').prop("disabled", false);
                $('#status').prop("src", "img/bullet_green.png");
                
                $('#loginContainer').append(data.message);
                $('#open').prop("disabled", true);
                $('#loginText').prop("disabled", true);
            } else {
                $('#loginContainer').append("<br /> " + data.message);
                socket.io.disconnect();
            }
        });
        socket.on('disconnect', function () {
            $('#open').prop("disabled", false);
            $('#status').prop("src", "img/bullet_red.png");
            $('#chat').html("");
            console.log('Połączenie przez Socket.io zostało zakończone');
            $('#loginText').prop("disabled", false);
        });
        socket.on("error", function (err) {
            $('#message').text("Błąd połączenia z serwerem: '" + JSON.stringify(err) + "'");
        });
        socket.on("chat", function (data) {
            $('#chat').append(data + "<br />");
        });
    });
    
    // Zamknij połączenie po kliknięciu guzika „Rozłącz”
    $('#close').click(function () {
        $('#close').prop("disabled", true);
        $('#send').prop("disabled", true);
        $('#open').prop("disabled", false);
        $('#message').text = "";
        socket.io.disconnect();
        console.dir(socket);
    });
    
    // Wyślij komunikat do serwera po naciśnięciu guzika „Wyślij”
    $('#send').click(function () {
        
        var json = {
            "login" : $('#loginText').val(),
            "message" : $('#messageText').val()    
        };
        socket.emit('message', json);
        console.log('Wysłałem wiadomość: ' + $('#messageText').val());
        $('#messageText').val("");
    });
});

/*
// DOM API
window.addEventListener("load", function (event) {
    var status = document.getElementById("status");
    var open = document.getElementById("open");
    var close = document.getElementById("close");
    var send = document.getElementById("send");
    var text = document.getElementById("text");
    var message = document.getElementById("message");
    var socket;

    status.textContent = "Brak połącznia";
    close.disabled = true;
    send.disabled = true;

    // Po kliknięciu guzika „Połącz” tworzymy nowe połączenie WS
    open.addEventListener("click", function (event) {
        open.disabled = true;
        if (!socket || !socket.connected) {
            socket = io({forceNew: true});
        }
        socket.on('connect', function () {
            close.disabled = false;
            send.disabled = false;
            status.src = "img/bullet_green.png";
            console.log('Nawiązano połączenie przez Socket.io');
        });
        socket.on('disconnect', function () {
            open.disabled = false;
            status.src = "img/bullet_red.png";
            console.log('Połączenie przez Socket.io zostało zakończone');
        });
        socket.on("error", function (err) {
            message.textContent = "Błąd połączenia z serwerem: '" + JSON.stringify(err) + "'";
        });
        socket.on("echo", function (data) {
            message.textContent = "Serwer twierdzi, że otrzymał od Ciebie: '" + data + "'";
        });
    });
    
    // Zamknij połączenie po kliknięciu guzika „Rozłącz”
    close.addEventListener("click", function (event) {
        close.disabled = true;
        send.disabled = true;
        open.disabled = false;
        message.textContent = "";
        socket.io.disconnect();
        console.dir(socket);
    });

    // Wyślij komunikat do serwera po naciśnięciu guzika „Wyślij”
    send.addEventListener("click", function (event) {
        socket.emit('message', text.value);
        console.log('Wysłałem wiadomość: ' + text.value);
        text.value = "";
    });
});
*/
