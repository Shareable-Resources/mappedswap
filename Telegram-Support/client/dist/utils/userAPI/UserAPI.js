"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const CONFIG = require('../../config/config.json');
const userAPI = {
    login: (user) => axios_1.default.post(`${CONFIG.url}/auth/login`, user),
    logout: (user) => axios_1.default.get(`${CONFIG.url}/auth/logout`, user)
};
exports.default = userAPI;
//# sourceMappingURL=userAPI.js.map