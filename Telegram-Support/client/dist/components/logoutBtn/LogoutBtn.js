"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
require("./LogoutBtn.css");
const react_bootstrap_1 = require("react-bootstrap");
const LogoutBtn = () => {
    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('admin');
        // window.location = '/auth'
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "LogoutBtn", children: (0, jsx_runtime_1.jsx)(react_bootstrap_1.Button, { onClick: handleSignOut, children: "Logout" }, void 0) }, void 0));
};
exports.default = LogoutBtn;
//# sourceMappingURL=LogoutBtn.js.map