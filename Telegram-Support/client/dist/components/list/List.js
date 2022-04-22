"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
require("./List.css");
const ticketDisplay_1 = __importDefault(require("../ticketDisplay"));
const react_1 = require("react");
const List = () => {
    const [search, setSearch] = (0, react_1.useState)('');
    const updateSearch = (search) => {
        setSearch(search);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "List", children: [(0, jsx_runtime_1.jsx)("h1", { children: "List" }, void 0), (0, jsx_runtime_1.jsx)(ticketDisplay_1.default, {}, void 0)] }, void 0));
};
exports.default = List;
//# sourceMappingURL=List.js.map