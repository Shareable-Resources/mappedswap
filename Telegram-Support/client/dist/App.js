"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
require("./App.scss");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const Login_1 = __importDefault(require("./pages/user/Login"));
const Layout_1 = __importDefault(require("./pages/Layout"));
const Ticket_Layout_1 = __importDefault(require("./pages/ticket/Ticket_Layout"));
const Dashboard_1 = __importDefault(require("./components/home/Dashboard"));
const Ticket_1 = __importDefault(require("./components/ticket/Ticket"));
function App() {
    const [tickets, setTickets] = (0, react_1.useState)([]);
    const [queues, setQueues] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        axios_1.default.get('http://localhost:8000/tickets').then((res) => {
            if (res.status === 200) {
                setTickets(res.data.result);
            }
        });
    }, []);
    const add = () => {
        /*
        setTickets([...tickets, {
          id:99,
          chatId:99,
          status:1,
          createdAt: "2022-02-21T07:04:08.000Z",
          updatedAt: "2022-02-21T07:04:08.000Z",
          customerId: 1}])
        */
        setQueues([
            {
                id: 1,
                content: 'testing 123...'
            }
        ]);
    };
    return ((0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: (0, jsx_runtime_1.jsx)(Login_1.default, {}, void 0) }, void 0), (0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Layout_1.default, {}, void 0), children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "ticket", element: (0, jsx_runtime_1.jsx)(Ticket_Layout_1.default, { add: add, queues: queues, tickets: tickets }, void 0), children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: ":ticketId", element: (0, jsx_runtime_1.jsx)(Ticket_1.default, { queues: queues, tickets: tickets }, void 0) }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { index: true, element: (0, jsx_runtime_1.jsx)(Dashboard_1.default, {}, void 0) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)("main", { children: (0, jsx_runtime_1.jsx)("p", { children: "NOT FOUND!" }, void 0) }, void 0) }, void 0)] }, void 0));
}
exports.default = App;
//# sourceMappingURL=App.js.map