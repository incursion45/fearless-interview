import {App} from "./App/Application";
let config = require('../config.json')


var app = new App.Application(config.port, config.countApiKey);

app.run();