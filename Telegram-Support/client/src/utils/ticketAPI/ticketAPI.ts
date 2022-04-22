import axios from 'axios'
const CONFIG = require('../../config/config.json');


const ticketAPI = {
	getAll: (ticket: any) => axios.get(`${CONFIG.url}/tickets`, ticket),
    getById: (ticket: any) => axios.get(`${CONFIG.url}/tickets/${ticket.id}`, ticket),
    complete: (ticket: any) => axios.get(`${CONFIG.url}/tickets/${ticket.id}/complete`, ticket),
}

export default ticketAPI
