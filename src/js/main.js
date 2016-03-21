const Vue = require('vue');

class App {
    constructor() {
        console.log('Hello, ES6!');
    }
}

var app = new App();

new Vue({
    el: "#app",
    ready() {
        console.log('Hello, Vue!');
    }
});