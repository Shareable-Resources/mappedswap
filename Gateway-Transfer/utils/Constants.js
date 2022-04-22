const ENV = process.env.NODE_ENV || 'dev';

const CONSTANTS = {
    ENV, 
    
    EUN_REWARD_GAS:50000,

    SYMBOL_MAPPING: {
        "USDT": {
            "decimals": 6,
            "targetToken": "USDM"
        },
        "USDC": {
            "decimals": 6,
            "targetToken": "USDM"
        },
        "wBTC": {
            "decimasl": 8,
            "targetToken": "BTCM"
        },
        "ETH": {
            "decimals": 18,
            "targetToken": "ETHM"
        },
        "wETH": {
            "decimals": 18,
            "targetToken": "ETHM"
        },
        "USDM": {
            "decimals": 6,
            "targetToken": "USDM"
        },
        "BTCM": {
            "decimals": 18,
            "targetToken": "BTCM"
        },
        "ETHM": {
            "decimals": 18,
            "targetToken": "ETHM"
        }
    
    }
}

const ENUM_TRANSFER_STATUS = {
    "PENDING":1,
    "COMPLETED":2,
    "REVERTED":-1,
    "FAIL":-2
}
module.exports = {
    CONSTANTS,
    ENUM_TRANSFER_STATUS
} 