module.exports = {
    start: {
        text: "Please choose your language! \n 请选择您的语言!",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "English",
                            callback_data: "eng"
                        }
                    ],
                    [
                        {
                            text: "中文",
                            callback_data: "chn"
                        }
                    ]
                ]
            }
        }
    },
    mainMenu: {
        text: "🚀 Hi there! I am your MappedSwap Butler.  How may I be at your service? \n 🚀 One click of below buttons to get help!",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Frequently Asked Question",
                            callback_data: "general"
                        }
                    ],
                    [
                        {
                            text: "Need Live Support? Just click here!",
                            callback_data: "live_support"
                        }
                    ]
                ]
            }
        }  
    },
    general: {
        text: "🚀Please choose your category!",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Account", callback_data: "account" },
                        { text: "Trade", callback_data: "trade" },
                        { text: "Referral", callback_data: "referral" },
                    ],
                    [
                        { text: "Go Back", callback_data: "eng" },
                    ]
                ]
            }
        }  
    },
    live_support: {
        text: "❓Your live support is on!\n\n✅Please leave your messages here, and your live support will reach you shortly.\n✅Thank you!😀",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "eng" },
                    ]
                ]
            }
        }
    },
    live_support_off: {
        text: "Hi there! We are sorry for the inconvenience caused.\nDue to it is not service hour, please leave your message here and we will contact you once the service hour is on.\n(Service hour from 10:00-19:00 on Mon. - Fri. UTC+8)\nThank you!😀",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "eng" },
                    ]
                ]
            }
        }
    },

    // Account Q&A
    account: {
        text: "🚀Please choose your question below! We got your answer!",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "❓How to create an Eurus wallet?", callback_data: "accountQ1" },
                    ],
                    [
                        { text: "❓How to create a MetaMask wallet?", callback_data: "accountQ2" },
                    ],
                    [
                        { text: "❓How to connect my wallet to MappedSwap account?", callback_data: "accountQ3" },
                    ],
                    [
                        { text: "Go Back", callback_data: "general" },
                    ]
                ]
            }
        }
    },
    accountQ1: {
        text: "❓How to create an Eurus wallet?\n\n✅Please find more details here:\nhttps://docs.mappedswap.io/docs/CreateAccount/1ConnectYourCryptoWallet/\nIf you have more questions regarding the Eurus Wallet, please visit the FAQ page:\nhttps://www.eurus.network/support/eurus-wallet/",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "account" },
                    ]
                ]
            }
        }
    },
    accountQ2: {
        text: "❓How to create a MetaMask wallet?\n\n✅Please find more details here:\nhttps://docs.mappedswap.io/docs/CreateAccount/1ConnectYourCryptoWallet/\nIf you have more questions regarding the MetaMask Wallet, please visit the FAQ page:\nhttps://metamask.io/faqs.html",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "account" },
                    ]
                ]
            }
        }
    },
    accountQ3: {
        text: "❓How to connect my wallet to MappedSwap account?\n\n1️⃣ First, create an account of Eurus wallet or MetaMask wallet.\n2️⃣ Connect the Eurus wallet/MetaMask wallet to the MappedSwap mainnet: Visit MappedSwap and click *Connect Wallet* on the top right corner.\n3️⃣ You can start to buy/sell on MappedSwap while you see the message window showing *Login Success*. ",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "account" },
                    ]
                ]
            }
        }
    },

    // Trade Q&A
    trade: {
        text: "🚀Please choose your question below! We got your answer!",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "❓Why can't I buy BTCM/ETHM on MappedSwap? ", callback_data: "tradeQ1" },
                    ],
                    [
                        { text: "❓How much amount can I borrow from MappedSwap?", callback_data: "tradeQ2" },
                    ],
                    [
                        { text: "❓How much will MappedSwap charge per transaction?", callback_data: "tradeQ3" },
                    ],
                    [
                        { text: "❓Why can't I withdraw from MappedSwap account to my wallet? ", callback_data: "tradeQ4" },
                    ],
                    [
                        { text: "❓How to BUY USDM/BTCM/ETHM?", callback_data: "tradeQ5" },
                    ],
                    [
                        { text: "❓How to SELL USDM/BTCM/ETHM?", callback_data: "tradeQ6" },
                    ],
                    [
                        { text: "Go Back", callback_data: "general" },
                    ]
                ]
            }
        }
    },
    tradeQ1: {
        text: "❓Why can't I buy BTCM/ETHM?\n\n✅Please transfer USDM from your wallet (Eurus wallet/MetaMask wallet) into your MappedSwap account first, then you can proceed to trade. Please note that the transfer between MappedSwap and wallet will charge fees (EUN).",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ2: {
        text: "❓How much amount can I borrow from MappedSwap?\n\n✅MappedSwap grants users up to a 10X borrowing rate. Please check your total available funding on the upper left of the main page.",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ3: {
        text: "❓How much is the trading fee per transaction on MappedSwap?\n\n✅Trading fee is charged on a per swap trade basis and calculated based on 0.3% on the sold assets size.\nFor example, if a user sells 1 BTCM, 0.003 BTCM is taken from the order and the remaining 0.997 BTCM will undergo the swap trade.",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ4: {
        text: "❓Why can't I withdraw from MappedSwap account to my wallet? \n\n✅You are not able to proceed to withdraw if any of the currencies in your account presents negative.",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ5: {
        text: "❓How to buy USDM/BTCM/ETHM?\n\n✅There are two ways for you to buy Mapped Tokens.\n1️⃣Please head to Uniswap and find Mapped Tokens trading pairs (highly recommended).\n2️⃣We support a direct swap of USDC/WBTC/ETH for USDM/BTCM/ETHM. Please deposit your desired amount (USDC/WBTC/ETH) to the address below (business hours: Mon. - Fri. 10:00-15:00 UTC+8).\nAddress: 0x48EaddbDa5f4D59f84B9960C86fd2e570fAc6dB2 (ERC-20 network)\n\n*For example, if you want to buy 1 BTCM, you will need to deposit 1 WBTC to the address. We will send the equivalent amount back to your Eurus address.\n\n*Please note that:\n1. The above MappedSwap deposit address is under ERC-20 network. Please make sure you select the ERC-20 network before confirming the transfer. \n2. Mappedswap would not charge any fees for direct swap, but the transfer will incur a miner fee.\n3. If your deposits have finished, please MUST leave the information below to Live Support:\n\t*The total amount you deposited\n\t*Your original address where you transferred funds from\n4. Your equivalent amount will be deposited to your address within 30 mins. For non-business-hours deposits, the process will be much longer.\n5. MappedSwap Live Support will NEVER message you directly with deposit addresses. Please keep your personal information safe, being careful of any suspicious links.\n6. We highly recommend users reach out to contact@mappedswap.io for any of these cases or directly contact MappedSwap Live Support for immediate support.",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ6: {
        text: "❓How to sell USDM/BTCM/ETHM?\n\n✅There are two ways for you to sell Mapped Tokens.\n1️⃣ Please head to Uniswap and find Mapped Tokens trading pairs (highly recommended); Or,\n2️⃣Please click *Live Support* for more detail.",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    

    // Referral Q&A
    referral: {
        text: "🚀Please choose your question below! We got your answer!",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "❓How does the referral program work?", callback_data: "referralQ1" },
                    ],
                    [
                        { text: "❓How can I get a funding code?", callback_data: "referralQ2" },
                    ],
                    [
                        { text: "Go Back", callback_data: "general" },
                    ]
                ]
            }
        }
    },
    referralQ1: {
        text: "❓How does the referral program work?\n\n✅Mappedswap’s Referral Program adopts an unlimited hierarchical model. The referrer can not only earn a commission off directly referred users, but the model can also trace the transaction volume of indirectly referred users indefinitely to improve the referrer’s rebate level and commission. As long as your rebate level is high, you can earn crypto assets without transaction! Invite your friends to trade here! ",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "referral" },
                    ]
                ]
            }
        }
    },
    referralQ2: {
        text: "❓How can I get a funding code?\n\n✅Please contact your representative or find your funding code here: https://mappedswap.io/",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "Go Back", callback_data: "referral" },
                    ]
                ]
            }
        }
    }
}