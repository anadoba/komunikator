/*jshint node: true */
"use strict";

module.exports = function ChatEntry(time, login, message) {
    this.time = time;
    this.login = login;
    this.message = message;
};