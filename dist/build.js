(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
    ready: function ready() {
        console.log('Hello, Vue Component!');
    }
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<h1><slot></slot></h1>"

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vue = (typeof window !== "undefined" ? window['Vue'] : typeof global !== "undefined" ? global['Vue'] : null);

var App = function App() {
    _classCallCheck(this, App);

    console.log('Hello, ES6!');
};

var app = new App();

new Vue({
    el: "#app",
    ready: function ready() {
        console.log('Hello, Vue!');
    },

    components: {
        hi: require('./component.vue')
    }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./component.vue":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY29tcG9uZW50LnZ1ZSIsInNyYy9qcy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNUQSxJQUFNLE1BQU0sUUFBUSxLQUFSLENBQVo7O0lBRU0sRyxHQUNGLGVBQWM7QUFBQTs7QUFDVixZQUFRLEdBQVIsQ0FBWSxhQUFaO0FBQ0gsQzs7QUFHTCxJQUFJLE1BQU0sSUFBSSxHQUFKLEVBQVY7O0FBRUEsSUFBSSxHQUFKLENBQVE7QUFDSixRQUFJLE1BREE7QUFFSixTQUZJLG1CQUVJO0FBQ0osZ0JBQVEsR0FBUixDQUFZLGFBQVo7QUFDSCxLQUpHOztBQUtKLGdCQUFZO0FBQ1IsWUFBSSxRQUFRLGlCQUFSO0FBREk7QUFMUixDQUFSIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVhZHk6IGZ1bmN0aW9uIHJlYWR5KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnSGVsbG8sIFZ1ZSBDb21wb25lbnQhJyk7XG4gICAgfVxufTtcbmlmIChtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlKSBtb2R1bGUuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzLmRlZmF1bHRcbjsodHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcImZ1bmN0aW9uXCI/IG1vZHVsZS5leHBvcnRzLm9wdGlvbnM6IG1vZHVsZS5leHBvcnRzKS50ZW1wbGF0ZSA9IFwiPGgxPjxzbG90Pjwvc2xvdD48L2gxPlwiXG4iLCJjb25zdCBWdWUgPSByZXF1aXJlKCd2dWUnKTtcblxuY2xhc3MgQXBwIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0hlbGxvLCBFUzYhJyk7XG4gICAgfVxufVxuXG52YXIgYXBwID0gbmV3IEFwcCgpO1xuXG5uZXcgVnVlKHtcbiAgICBlbDogXCIjYXBwXCIsXG4gICAgcmVhZHkoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdIZWxsbywgVnVlIScpO1xuICAgIH0sXG4gICAgY29tcG9uZW50czoge1xuICAgICAgICBoaTogcmVxdWlyZSgnLi9jb21wb25lbnQudnVlJylcbiAgICB9XG59KTtcbiJdfQ==
