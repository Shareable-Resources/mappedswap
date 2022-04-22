"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
function Ticket(props) {
    const params = (0, react_router_dom_1.useParams)();
    const [ticket, setTicket] = (0, react_1.useState)();
    const [msgs, setMsgs] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        setTicket(props.tickets.find((item) => {
            (params && params.ticketId) ? item.id === parseInt(params.ticketId) : null;
        }));
        axios_1.default.get(`http://localhost:8000/tickets/${params.ticketId}/messages`).then((res) => {
            if (res.status === 200) {
                setMsgs(res.data.result);
            }
        });
    }, [params.ticketId]);
    (0, react_1.useEffect)(() => {
        debugger;
        setMsgs([...msgs, ...props.queues.filter((item) => item.id == params.ticketId)]);
    }, [props.queues]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'ticket_info_container', children: [(0, jsx_runtime_1.jsxs)("div", { className: 'ticket_info_msg', children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msg', children: [(0, jsx_runtime_1.jsx)("div", { children: "msg" }, void 0), (0, jsx_runtime_1.jsx)("ul", { children: msgs.map((item) => {
                                    return ((0, jsx_runtime_1.jsx)("li", { children: item.content }, item.id));
                                }) }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: 'sendMsg', children: [(0, jsx_runtime_1.jsx)("input", { type: 'text' }, void 0), (0, jsx_runtime_1.jsx)("button", { children: "Send" }, void 0)] }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { className: 'ticket_info_detail', children: [(0, jsx_runtime_1.jsxs)("div", { children: ["detail - ", params.ticketId] }, void 0), (0, jsx_runtime_1.jsx)("div", { children: ticket ? ticket.chatId : "" }, void 0)] }, void 0)] }, void 0));
}
exports.default = Ticket;
//# sourceMappingURL=Ticket.js.map