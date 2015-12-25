var module = require('./module');

$(function() {
    class App {
        constructor() {
            console.log('Hello, ES6!');
        }
    }

    console.log(new Vue());

    var app = new App();
});