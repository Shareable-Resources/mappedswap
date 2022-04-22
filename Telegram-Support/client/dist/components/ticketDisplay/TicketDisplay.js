"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ticketAPI_1 = __importDefault(require("../../utils/ticketAPI/ticketAPI"));
const react_bootstrap_1 = require("react-bootstrap");
const react_1 = require("react");
const TicketDisplay = () => {
    const [ticket, setTicket] = (0, react_1.useState)([]);
    const updateTicket = (ticket) => {
        setTicket(ticket);
    };
    const handleTicketList = (event) => {
        event.preventDefault();
        ticketAPI_1.default.getAll(ticket)
            .then((data) => {
            updateTicket(data.data.result);
        })
            .catch(err => console.log(err));
    };
    const renderIds = (obj) => {
        if (obj.status) {
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("br", {}, void 0), (0, jsx_runtime_1.jsxs)(react_bootstrap_1.Button, { children: [obj.id, " Close"] }, void 0)] }, void 0));
        }
        else {
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("br", {}, void 0), (0, jsx_runtime_1.jsxs)(react_bootstrap_1.Button, { children: [obj.id, " Open"] }, void 0)] }, void 0));
        }
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_bootstrap_1.Button, { id: "ticket_btn", className: "me-3", variant: "warning", type: "submit", onClick: handleTicketList, children: "Tickets " }, void 0), (0, jsx_runtime_1.jsx)("br", {}, void 0), ticket.map((obj) => (renderIds(obj)))] }, void 0));
};
exports.default = TicketDisplay;
//# sourceMappingURL=TicketDisplay.js.map