var module = require('./module');
var Vue = require('vue');
var Hello = require('./components/hello.vue');

$(function () {
    class App {
        constructor() {
            console.log('Hello, ES6!');
        }
    }

    new Vue({
        el: "#app",
        components: {
            hello: Hello
        }
    });

    var app = new App();
});