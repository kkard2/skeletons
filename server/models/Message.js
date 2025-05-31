"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    sender: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
});
exports.default = (0, mongoose_1.model)('Message', messageSchema);
