"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const userAPI_1 = __importDefault(require("../../utils/userAPI/userAPI"));
const react_1 = require("react");
const react_bootstrap_1 = require("react-bootstrap");
const Auth = () => {
    const [userState, setUserState] = (0, react_1.useState)({
        email: '',
        password: '',
        username: ''
    });
    const handleInputChange = ({ target: { name, value } }) => setUserState({ ...userState, [name]: value });
    const handleLoginUser = (event) => {
        event.preventDefault();
        userAPI_1.default.login(userState)
            .then(({ data }) => {
            if (data.result.token) {
                localStorage.setItem('token', data.result.token);
                localStorage.setItem('userId', data.result.userId);
                localStorage.setItem('admin', data.result.admin);
                // window.location = '/'
            }
            else {
                alert('User unable to login');
            }
        })
            .catch(err => console.error(err));
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "olor-overlay d-flex justify-content-center align-items-center", children: (0, jsx_runtime_1.jsxs)(react_bootstrap_1.Form, { className: "rounded p-4 p-sm-3", children: [(0, jsx_runtime_1.jsx)(react_bootstrap_1.Form.Group, { className: "mb-3 signInWidthBox", controlId: "email", children: (0, jsx_runtime_1.jsx)(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Enter your email", name: "email", value: userState.username, onChange: handleInputChange }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(react_bootstrap_1.Form.Group, { className: "mb-3 signInWidthBox", controlId: "password", children: (0, jsx_runtime_1.jsx)(react_bootstrap_1.Form.Control, { type: "password", placeholder: "Enter your password", name: "password", value: userState.password, onChange: handleInputChange }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(react_bootstrap_1.Button, { id: "signIn", className: "me-3", variant: "warning", type: "submit", onClick: handleLoginUser, children: "Sign In" }, void 0)] }, void 0) }, void 0));
};
exports.default = Auth;
//# sourceMappingURL=Auth.js.map