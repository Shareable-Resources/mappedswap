"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
function Ticket_Layout(props) {
    const check = (id) => {
        return props.queues.filter((item) => item.id === id).length;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'ticket_container', children: [(0, jsx_runtime_1.jsxs)("div", { className: 'ticket_list', children: [(0, jsx_runtime_1.jsx)("div", { children: "tickets" }, void 0), (0, jsx_runtime_1.jsx)("button", { onClick: props.add, children: "Click" }, void 0), (0, jsx_runtime_1.jsx)("ul", { children: props.tickets.map((item) => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Link, { to: `/ticket/${item.id}`, children: [item.id, "(", check(item.id), ")"] }, void 0) }, item.id))) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)("div", { className: 'ticket_main', children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {}, void 0) }, void 0)] }, void 0));
}
exports.default = Ticket_Layout;
//# sourceMappingURL=Ticket_Layout.js.map