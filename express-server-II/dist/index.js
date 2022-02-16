"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// configure express
var express_1 = __importDefault(require("express"));
var app = (0, express_1.default)();
// configure MongoDB, mongoose and the things required
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var db = require("./config/keys").mongoURI;
;
// using the bodyParser package to parse incoming requests into json
app.use(bodyParser.json());
app.get("/", function (req, res) { return res.send("Hello world"); });
app.listen(5000, function () { return console.log('Server is running on port 5000'); });
