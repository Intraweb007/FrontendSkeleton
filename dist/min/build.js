!function e(o,n,t){function r(u,f){if(!n[u]){if(!o[u]){var l="function"==typeof require&&require;if(!f&&l)return l(u,!0);if(i)return i(u,!0);var s=new Error("Cannot find module '"+u+"'");throw s.code="MODULE_NOT_FOUND",s}var c=n[u]={exports:{}};o[u][0].call(c.exports,function(e){var n=o[u][1][e];return r(n?n:e)},c,c.exports,e,o,n,t)}return n[u].exports}for(var i="function"==typeof require&&require,u=0;u<t.length;u++)r(t[u]);return r}({1:[function(e,o,n){"use strict";o.exports={ready:function(){console.log("Hello, Vue Component!")}},o.exports.__esModule&&(o.exports=o.exports["default"]),("function"==typeof o.exports?o.exports.options:o.exports).template="<h1><slot></slot></h1>"},{}],2:[function(e,o,n){(function(o){"use strict";function n(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}var t="undefined"!=typeof window?window.Vue:"undefined"!=typeof o?o.Vue:null,r=function i(){n(this,i),console.log("Hello, ES6!")};new r;new t({el:"#app",ready:function(){console.log("Hello, Vue!")},components:{hi:e("./component.vue")}})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./component.vue":1}]},{},[2]);
//# sourceMappingURL=maps/build.js.map
