module.exports = {
    mainMenu: {
        text: "ð æ¨å¥½ï¼æ¨çMappedSwapç®¡å®¶å·²ä¸çº¿ã\nð è¯·ç¹éä»¥ä¸æé®è·å¾å³æ¶åå©ã",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "å¸¸è§é®é¢ä¸åç­",
                            callback_data: "general"
                        }
                    ],
                    [
                        {
                            text: "å³æå®¢æ!",
                            callback_data: "live_support"
                        }
                    ]
                ]
            }
        }  
    },
    general: {
        text: "ðè¯·éæ©ç¸å³ç±»å«ï¼",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è´¦æ·", callback_data: "account" },
                        { text: "äº¤æ", callback_data: "trade" },
                        { text: "æ¨è", callback_data: "referral" },
                    ],
                    [
                        { text: "è¿å", callback_data: "chn" },
                    ]
                ]
            }
        }  
    },
    live_support: {
        text: "âæ¨çå³æå®¢æå·²ä¸çº¿ï¼\n\nâè¯·å¨æ­¤çä¸æ¨çé®é¢ï¼å®¢æäººåä¼å°½å¿«ä¸æ¨èç³»ã\nâè°¢è°¢ ððð",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "chn" },
                    ]
                ]
            }
        }
    },
    live_support_off: {
        text: "ç±äºç°å¨ä¸æ¯æå¡æ¶é´ï¼ä¸ºæ¨å¸¦æ¥ä¸ä¾¿æä»¬æ·±ææ±æ­ãè¯·å¨æ­¤å¤çè¨ï¼æä»¬å°å¨æå¡æ¶é´å¼å§åä¸æ¨èç³»ã\n(æå¡æ¶é´: å¨ä¸è³å¨äº 10:00-19:00 UTC+8)\nè°¢è°¢ ððð",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "chn" },
                    ]
                ]
            }
        }
    },

    // Account Q&A
    account: {
        text: "ðè¯·éæ©ä»¥ä¸é®é¢ä¸åç­ï¼",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "âå¦ä½å»ºç«Eurusé±åï¼", callback_data: "accountQ1" },
                    ],
                    [
                        { text: "âå¦ä½å»ºç«MetaMaské±åï¼", callback_data: "accountQ2" },
                    ],
                    [
                        { text: "âå¦ä½è¿ç»æçé±ååMappedSwapè´¦æ·ï¼", callback_data: "accountQ3" },
                    ],
                    [
                        { text: "è¿å", callback_data: "general" },
                    ]
                ]
            }
        }
    },
    accountQ1: {
        text: "âå¦ä½å»ºç«Eurusé±åï¼\n\nâæ¨å¯ä»ä»¥ä¸è¿ç»è·å¾æ´å¤ç»è:\nhttps://docs.mappedswap.io/docs/CreateAccount/1ConnectYourCryptoWallet/\nè¥æ¨å¯¹Eurusé±åæä»»ä½çé®ï¼è¯·åèEurusé±åå¸¸è§é®é¢é¡µé¢ï¼https://www.eurus.network/support/eurus-wallet/",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "account" },
                    ]
                ]
            }
        }
    },
    accountQ2: {
        text: "âå¦ä½å»ºç«MetaMaské±åï¼\n\nâæ¨å¯ä»ä»¥ä¸è¿ç»è·å¾æ´å¤ç»èï¼\nhttps://docs.mappedswap.io/docs/CreateAccount/1ConnectYourCryptoWallet/\nè¥æ¨å¯¹MetaMaské±åæä»»ä½çé®ï¼è¯·åèMetaMaské±åå¸¸è§é®é¢é¡µé¢ï¼https://metamask.io/faqs.html",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "account" },
                    ]
                ]
            }
        }
    },
    accountQ3: {
        text: "âå¦ä½è¿ç»æçé±ååï¼­appedSwapè´¦æ·ï¼\n\n1ï¸â£ ç¬¬ä¸æ­¥ï¼è¯·åå»ºç«EurusæMetaMaskçé±åè´¦æ·ï¼\n2ï¸â£ æ¥çè¿ç»Eurusé±åæMetaMaské±åå°MappedSwapä¸»ç½è·¯ï¼å¼å¯MappedSwapå¹¶ç¹éå³ä¸è§ âè¿æ¥é±åâã\n3ï¸â£ å½åºç°âç»å¥æåâçè®¯æ¯åï¼æ¨å°±å¯ä»¥å¨MappedSwapä¸è¿è¡äº¤æã",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "account" },
                    ]
                ]
            }
        }
    },

    // Trade Q&A
    trade: {
        text: "ðè¯·éæ©ä»¥ä¸é®é¢ä¸åç­ï¼",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "âä¸ºä»éº½æä¸è½ä¹°BTCM/ETHM?", callback_data: "tradeQ1" },
                    ],
                    [
                        { text: "âæå¯ä»¥ä»MappedSwapåè´·å¤å°é¢åº¦ï¼", callback_data: "tradeQ2" },
                    ],
                    [
                        { text: "âMappedSwapæ¯ç¬äº¤ææ¶åå¤å°äº¤æè´¹ï¼", callback_data: "tradeQ3" },
                    ],
                    [
                        { text: "âä¸ºä»ä¹æçèµäº§æ æ³ä»MappedSwapå¸æ·åè½¬è³æçé±åï¼", callback_data: "tradeQ4" },
                    ],
                    [
                        { text: "âå¦ä½ä¹°å¥USDM/BTCM/ETHM?", callback_data: "tradeQ5" },
                    ],
                    [
                        { text: "âå¦ä½ååº USDM/BTCM/ETHM?", callback_data: "tradeQ6" },
                    ],
                    [
                        { text: "è¿å", callback_data: "general" },
                    ]
                ]
            }
        }
    },
    tradeQ1: {
        text: "âä¸ºä»éº½æä¸è½ä¹°BTCM/ETHM?\n\nâé¦åï¼æ¨éè¦åä» Eurus/MetaMask é±ååè½¬USDMè³æ¨ç MappedSwap å¸æ·ãè¯·çæï¼é±åä¸å¸æ·é´çåè½¬é½å°æ¶åè´¹ç¨ (EUN)ã",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ2: {
        text: "âæå¯ä»¥ä»MappedSwapåè´·å¤å°é¢åº¦ï¼\n\nâMappedSwap åè®¸ä½¿ç¨èä½¿ç¨åºäº USDM çåèµäº§æ»å¼ç 10 åé¢åº¦ï¼æ¨å¯ä»¥å¨ä¸»é¡µçå·¦ä¸è§ç¡®è®¤æ¨çå¯ç¨é¢åº¦ã",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ3: {
        text: "âMappedSwapæ¯ç¬äº¤ææ¶åå¤å°äº¤æè´¹ï¼\n\nâäº¤æè´¹ææ¯ç¬ææäº¤ææ¶åï¼æåºå®èµäº§è§æ¨¡ç0.3%è®¡ç®ï¼ç´æ¥ä»ææäº¤æä¸­æåãâä¾å¦ï¼å¦æç¨æ·ååº 1 ä¸ª BTCMï¼å°ä»è®¢åä¸­ååº 0.003 ä¸ª BTCMï¼å©ä½ç 0.997 ä¸ª BTCM å°è¿è¡ææäº¤æã",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ4: {
        text: "âä¸ºä»ä¹æçèµäº§æ æ³ä»MappedSwapå¸æ·åè½¬è³æçé±åï¼ \n\nâå¦ææ¨æä»»ä¸è´§å¸ç»é¦æ¾ç¤ºä¸ºè´å¼ãæ¨å°æ æ³ä»MappedSwapä¸­åè½¬èµäº§å°æ¨çé±åã",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ5: {
        text: "âå¦ä½ä¹°å¥USDM/BTCM/ETHM? \n\nâæä»¬æä¾ä¸¤ç§æ¹å¼ä¾æ¨è´­ä¹°Mapped Tokens:\n1. è¯·åå¾Uniswapå¹¶æ¾å°Mapped Tokensäº¤æå¯¹è¿è¡åæ¢ (è¯æå»ºè®®)\n2. æä»¬ä¹æä¾USDC/WBTC/ETHä¸USDM/BTCM/ETHMçç´æ¥åæ¢ãè¯·åå¼æ¨éè¦åæ¢çæ°é (USDC/WBTC/ETH) è³ä»¥ä¸å°åã (ä½ä¸æ¶é´ï¼é±ä¸è³é±äºï¼10:00am - 15:00pmï¼UTC+8ã)\n\nAddress: 0x48EaddbDa5f4D59f84B9960C86fd2e570fAc6dB2 (ERC-20 network)\n\n*ä¸¾ä¾æ¥è¯´å¦ææ¨è¦åæ¢ä¸ä¸ªBTCMï¼æ¨éè¦åå¼ä¸ä¸ªWBTCå°ä»¥ä¸å°åãæä»¬å°ä¼å°å¯¹åºçæ°éææ¬¾è³æ¨çEuruså°åã\n\n*è¯·çæä»¥ä¸æ³¨æäºé¡¹ï¼\n1. ä»¥ä¸MappedSwapçåå¼å°åæ¯ERC-20å°åãå¨ææ¬¾éåºåï¼è¯·æ³¨æç½ç»éæ©ä¸ºERC-20ç½ç»ã\n2. MappedSwapä¸ä¼æ¶åä»»ä½è´¹ç¨ï¼æ¨è¦è´æçåªæè½¬å¸ç¿å·¥è´¹ã\n3. è¥æ¨å·²å®æè½¬å¸ï¼è¯·å¡å¿åå³æ¶å®¢ææä¾ä»¥ä¸èµè®¯ï¼\n*æ¨çææ¬¾å¸å«åæ°é\n*æ¨ç¨äºåéæ¬¾é¡¹çå°å\n\n4. ææ¬¾åæ¨å°å¨30åéåæ¶å°å¯¹åºçèµäº§ç±»å«åæ°éãè¥æ¨å¨éä½ä¸æ¶é´è¿è¡ææ¬¾ï¼åæ¢è¿ç¨å°ä¼è±è´¹è¾ä¹æ¶é´ï¼æ¬è¯·è§è°ã\n5. è¯·æ³¨æMappedSwapå³æ¶å®¢ææ°¸è¿ä¸ä¼ä¸»å¨æ¥è§¦æ¨å¹¶æä¾è½¬å¸å°åãä»»ä½ä¸»å¨åæ¨ä¼ éå°åçä¼ éèé½æå¯è½æ¯è¯éªï¼è¯·å°å¿çæï¼æ³¨æèµäº§å®å¨ï¼\n6. å¦ææ¨å¨ä½¿ç¨MappedSwapçè¿ç¨ä¸­ï¼æä»»ä½çèï¼è¯·ç´æ¥ä¸å³æ¶å®¢æèç¹«ææ¯å¯ä¿¡å°contact@mappedswap.ioãæä»¬å°ä¸ºæ¨æä¾å³æ¶çåå©ã",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ6: {
        text: "âå¦ä½ååº USDM/BTCM/ETHM? \n\nâæä»¬æä¾ä¸¤ç§æ¹å¼ä¾æ¨ååºMapped Tokens:\n1. è¯·åå¾Uniswapå¹¶æ¾å°Mapped Tokensäº¤æå¯¹è¿è¡åæ¢ (è¯æå»ºè®®)ã\n2. æè¯·ç¹å»*å³æ¶å®¢æ*ï¼æä»¬å°ä¼ä¸ºæ¨æä¾è§£å³æ¹æ¡ã",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    

    // Referral Q&A
    referral: {
        text: "ðè¯·éæ©ä»¥ä¸é®é¢ä¸åç­ï¼",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "âä¸ºä»ä¹è¦å å¥æ¨èè®¡åï¼å¦ä½è¿ä½ï¼", callback_data: "referralQ1" },
                    ],
                    [
                        { text: "âå¦ä½è·å¾èµéä»£ç ï¼", callback_data: "referralQ2" },
                    ],
                    [
                        { text: "è¿å", callback_data: "general" },
                    ]
                ]
            }
        }
    },
    referralQ1: {
        text: "âä¸ºä»ä¹è¦å å¥æ¨èè®¡åï¼å¦ä½è¿ä½ï¼\n\nâMappedswapçæ¨èè®¡åéç¨æ éå±çº§æ¨¡å¼ï¼æ¨èäººä¸ä»å¯ä»¥äº«åç´æ¥æ¨èç¨æ·çä½£éï¼è¿å¯ä»¥æ éå¾ä¸è¿½æº¯é´æ¥æ¨èçç¨æ·çäº¤æéï¼ç¨ä»¥æåèªå·±çè¿ä½£æ¯ä¾åä½£éãåªè¦æ¨çè¿ä½£æ¯ä¾é«ï¼å°±å¯ä»¥ä½éªæ éäº¤æå³å¯èµåå å¯è´§å¸ï¼éè¯·æåä¸èµ·æ¥å§! ",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "referral" },
                    ]
                ]
            }
        }
    },
    referralQ2: {
        text: "âå¦ä½è·å¾èµéä»£ç ï¼\n\nâè¯·èç³»æ¨çæ¨èäººï¼æèç¹å»ä»¥ä¸è¿ç»è¿å¥å®æ¹èµè®¯é¡µé¢ï¼https://mappedswap.io/",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "è¿å", callback_data: "referral" },
                    ]
                ]
            }
        }
    }
}