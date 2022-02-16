"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    posts: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'post'
        }]
});
var UserModel = (0, mongoose_1.model)('user', UserSchema);
exports.default = UserModel;
