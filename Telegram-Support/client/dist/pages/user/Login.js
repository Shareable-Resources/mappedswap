"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const Login = () => {
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    let navigate = (0, react_router_dom_1.useNavigate)();
    const handleEmail = (e) => {
        setEmail(e.target.value);
    };
    const handlePassword = (e) => {
        setPassword(e.target.value);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/');
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Sign in with your email and password" }, void 0), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("input", { name: "email", type: "email", required: true, placeholder: "Email", onChange: handleEmail }, void 0), (0, jsx_runtime_1.jsx)("input", { name: "password", type: "password", required: true, placeholder: "Password", onChange: handlePassword }, void 0), (0, jsx_runtime_1.jsx)("input", { type: "submit", value: "login" }, void 0)] }, void 0)] }, void 0));
};
exports.default = Login;
//# sourceMappingURL=Login.js.map