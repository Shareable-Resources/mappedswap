"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
function Layout() {
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'layout', children: [(0, jsx_runtime_1.jsx)("div", { className: 'nav', children: (0, jsx_runtime_1.jsxs)("nav", { children: [(0, jsx_runtime_1.jsx)("a", { className: 'navItem', href: 'javascript:void(0)', children: "MS" }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { className: 'navItem', to: '/', children: "H" }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { className: 'navItem', to: '/ticket', children: "T" }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { className: 'navItem', to: '/customer', children: "C" }, void 0)] }, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { className: 'main', children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {}, void 0) }, void 0)] }, void 0));
}
exports.default = Layout;
//# sourceMappingURL=Layout.js.map