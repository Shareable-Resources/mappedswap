"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const CONFIG = require('../../config/config.json');
const ticketAPI = {
    getAll: (ticket) => axios_1.default.get(`${CONFIG.url}/tickets`, ticket),
    getById: (ticket) => axios_1.default.get(`${CONFIG.url}/tickets/${ticket.id}`, ticket),
    complete: (ticket) => axios_1.default.get(`${CONFIG.url}/tickets/${ticket.id}/complete`, ticket),
};
exports.default = ticketAPI;
//# sourceMappingURL=ticketAPI.js.map