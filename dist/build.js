(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _module = require('./module');

$(function () {
    var App = function App() {
        _classCallCheck(this, App);

        console.log('Hello, ES6!');
    };

    var app = new App();
});

},{"./module":2}],2:[function(require,module,exports){
"use strict";

var hello = {
    hello: "world"
};

module.exports = hello;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvd2hhbGVzaGFyay9EZXNrdG9wL0NvZGUvT3BlblNvdXJjZS9Gcm9udGVuZFNrZWxldG9uL3NyYy9qcy9tYWluLmpzIiwiL1VzZXJzL3doYWxlc2hhcmsvRGVza3RvcC9Db2RlL09wZW5Tb3VyY2UvRnJvbnRlbmRTa2VsZXRvbi9zcmMvanMvbW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLElBQUksT0FBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsQ0FBQyxDQUFDLFlBQVc7UUFDSCxHQUFHLEdBQ00sU0FEVCxHQUFHLEdBQ1M7OEJBRFosR0FBRzs7QUFFRCxlQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzlCOztBQUdMLFFBQUksR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Q0FDdkIsQ0FBQyxDQUFDOzs7OztBQ1ZILElBQUksS0FBSyxHQUFHO0FBQ1IsU0FBSyxFQUFFLE9BQU87Q0FDakIsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgbW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGUnKTtcblxuJChmdW5jdGlvbigpIHtcbiAgICBjbGFzcyBBcHAge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIZWxsbywgRVM2IScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGFwcCA9IG5ldyBBcHAoKTtcbn0pOyIsInZhciBoZWxsbyA9IHtcbiAgICBoZWxsbzogXCJ3b3JsZFwiXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGhlbGxvOyJdfQ==