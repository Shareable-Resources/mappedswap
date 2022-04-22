//Since web3-eth-accounts typescript file is broken, need to manually solve import js and require js problem

import AccountClass from 'web3-eth-accounts';
var Accounts = require('web3-eth-accounts');
var accounts = new Accounts();
export default accounts as AccountClass.Accounts;
