import axios from 'axios'
const CONFIG = require('../../config/config.json');


const userAPI = {
	login: (user: any) => axios.post(`${CONFIG.url}/auth/login`, user),
    logout: (user: any) => axios.get(`${CONFIG.url}/auth/logout`, user)
}

export default userAPI
