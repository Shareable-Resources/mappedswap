"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const details_1 = __importDefault(require("../../components/details"));
const list_1 = __importDefault(require("../../components/list"));
const main_1 = __importDefault(require("../../components/main"));
//import Sidebar from '../../components/Sidebar';
const notes_1 = __importDefault(require("../../components/notes"));
require("./home.scss");
const Home = () => {
    if (!localStorage.getItem('token')) {
        alert('Login PLZ');
        //window.location = '/auth'
    }
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "container", children: [(0, jsx_runtime_1.jsx)("div", { className: 'box box1' }, void 0), (0, jsx_runtime_1.jsx)("div", { className: 'box box2', children: (0, jsx_runtime_1.jsx)(list_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { className: 'box box3', children: (0, jsx_runtime_1.jsx)(main_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: 'box box4', children: [(0, jsx_runtime_1.jsx)("div", { className: 'row', children: (0, jsx_runtime_1.jsx)(details_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { className: 'row', children: (0, jsx_runtime_1.jsx)(notes_1.default, {}, void 0) }, void 0)] }, void 0)] }, void 0) }, void 0));
};
exports.default = Home;
//# sourceMappingURL=Home.js.map