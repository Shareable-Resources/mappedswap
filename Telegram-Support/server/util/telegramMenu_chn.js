module.exports = {
    mainMenu: {
        text: "🚀 您好，您的MappedSwap管家已上线。\n🚀 请点选以下按钮获得即时协助。",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "常见问题与回答",
                            callback_data: "general"
                        }
                    ],
                    [
                        {
                            text: "即時客服!",
                            callback_data: "live_support"
                        }
                    ]
                ]
            }
        }  
    },
    general: {
        text: "🚀请选择相关类别！",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "账户", callback_data: "account" },
                        { text: "交易", callback_data: "trade" },
                        { text: "推荐", callback_data: "referral" },
                    ],
                    [
                        { text: "返回", callback_data: "chn" },
                    ]
                ]
            }
        }  
    },
    live_support: {
        text: "❓您的即時客服已上线！\n\n✅请在此留下您的问题，客服人员会尽快与您联系。\n✅谢谢 😀😀😀",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "chn" },
                    ]
                ]
            }
        }
    },
    live_support_off: {
        text: "由于现在不是服务时间，为您带来不便我们深感抱歉。请在此处留言，我们将在服务时间开始后与您联系。\n(服务时间: 周一至周五 10:00-19:00 UTC+8)\n谢谢 😀😀😀",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "chn" },
                    ]
                ]
            }
        }
    },

    // Account Q&A
    account: {
        text: "🚀请选择以下问题与回答！",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "❓如何建立Eurus钱包？", callback_data: "accountQ1" },
                    ],
                    [
                        { text: "❓如何建立MetaMask钱包？", callback_data: "accountQ2" },
                    ],
                    [
                        { text: "❓如何连结我的钱包和MappedSwap账户？", callback_data: "accountQ3" },
                    ],
                    [
                        { text: "返回", callback_data: "general" },
                    ]
                ]
            }
        }
    },
    accountQ1: {
        text: "❓如何建立Eurus钱包？\n\n✅您可从以下连结获得更多细节:\nhttps://docs.mappedswap.io/docs/CreateAccount/1ConnectYourCryptoWallet/\n若您对Eurus钱包有任何疑问，请参考Eurus钱包常见问题页面：https://www.eurus.network/support/eurus-wallet/",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "account" },
                    ]
                ]
            }
        }
    },
    accountQ2: {
        text: "❓如何建立MetaMask钱包？\n\n✅您可从以下连结获得更多细节：\nhttps://docs.mappedswap.io/docs/CreateAccount/1ConnectYourCryptoWallet/\n若您对MetaMask钱包有任何疑问，请参考MetaMask钱包常见问题页面：https://metamask.io/faqs.html",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "account" },
                    ]
                ]
            }
        }
    },
    accountQ3: {
        text: "❓如何连结我的钱包和ＭappedSwap账户？\n\n1️⃣ 第一步，请先建立Eurus或MetaMask的钱包账户；\n2️⃣ 接着连结Eurus钱包或MetaMask钱包到MappedSwap主网路：开启MappedSwap并点选右上角 “连接钱包”。\n3️⃣ 当出现“登入成功”的讯息后，您就可以在MappedSwap上进行交易。",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "account" },
                    ]
                ]
            }
        }
    },

    // Trade Q&A
    trade: {
        text: "🚀请选择以下问题与回答！",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "❓为什麽我不能买BTCM/ETHM?", callback_data: "tradeQ1" },
                    ],
                    [
                        { text: "❓我可以从MappedSwap借贷多少额度？", callback_data: "tradeQ2" },
                    ],
                    [
                        { text: "❓MappedSwap每笔交易收取多少交易费？", callback_data: "tradeQ3" },
                    ],
                    [
                        { text: "❓为什么我的资产无法从MappedSwap帐户划转至我的钱包？", callback_data: "tradeQ4" },
                    ],
                    [
                        { text: "❓如何买入USDM/BTCM/ETHM?", callback_data: "tradeQ5" },
                    ],
                    [
                        { text: "❓如何卖出 USDM/BTCM/ETHM?", callback_data: "tradeQ6" },
                    ],
                    [
                        { text: "返回", callback_data: "general" },
                    ]
                ]
            }
        }
    },
    tradeQ1: {
        text: "❓为什麽我不能买BTCM/ETHM?\n\n✅首先，您需要先从 Eurus/MetaMask 钱包划转USDM至您的 MappedSwap 帐户。请留意，钱包与帐户间的划转都将收取费用 (EUN)。",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ2: {
        text: "❓我可以从MappedSwap借贷多少额度？\n\n✅MappedSwap 允许使用者使用基于 USDM 的净资产总值的 10 倍额度，您可以在主页的左上角确认您的可用额度。",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ3: {
        text: "❓MappedSwap每笔交易收取多少交易费？\n\n✅交易费按每笔掉期交易收取，按出售资产规模的0.3%计算，直接从掉期交易中提取。​例如，如果用户卖出 1 个 BTCM，将从订单中取出 0.003 个 BTCM，剩余的 0.997 个 BTCM 将进行掉期交易。",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ4: {
        text: "❓为什么我的资产无法从MappedSwap帐户划转至我的钱包？ \n\n✅如果您有任一货币结馀显示为负值。您将无法从MappedSwap中划转资产到您的钱包。",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ5: {
        text: "❓如何买入USDM/BTCM/ETHM? \n\n✅我们提供两种方式供您购买Mapped Tokens:\n1. 请前往Uniswap并找到Mapped Tokens交易对进行兑换 (诚挚建议)\n2. 我们也提供USDC/WBTC/ETH与USDM/BTCM/ETHM的直接兑换。请充值您需要兑换的数量 (USDC/WBTC/ETH) 至以下地址。 (作业时间：週一至週五，10:00am - 15:00pm，UTC+8。)\n\nAddress: 0x48EaddbDa5f4D59f84B9960C86fd2e570fAc6dB2 (ERC-20 network)\n\n*举例来说如果您要兑换一个BTCM，您需要充值一个WBTC到以上地址。我们将会将对应的数量打款至您的Eurus地址。\n\n*请留意以下注意事项：\n1. 以上MappedSwap的充值地址是ERC-20地址。在打款送出前，请注意网络选择为ERC-20网络。\n2. MappedSwap不会收取任何费用，您要负担的只有转帐矿工费。\n3. 若您已完成转帐，请务必向即时客服提供以下资讯：\n*您的打款币别及数量\n*您用于发送款项的地址\n\n4. 打款后您将在30分钟内收到对应的资产类别及数量。若您在非作业时间进行打款，兑换过程将会花费较久时间，敬请见谅。\n5. 请注意MappedSwap即时客服永远不会主动接触您并提供转帐地址。任何主动向您传送地址的传送者都有可能是诈骗，请小心留意，注意资产安全！\n6. 如果您在使用MappedSwap的过程中，有任何疑虑，请直接与即时客服联繫或是寄信到contact@mappedswap.io。我们将为您提供即时的协助。",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    tradeQ6: {
        text: "❓如何卖出 USDM/BTCM/ETHM? \n\n✅我们提供两种方式供您卖出Mapped Tokens:\n1. 请前往Uniswap并找到Mapped Tokens交易对进行兑换 (诚挚建议)。\n2. 或请点击*即时客服*，我们将会为您提供解决方案。",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "trade" },
                    ]
                ]
            }
        } 
    },
    

    // Referral Q&A
    referral: {
        text: "🚀请选择以下问题与回答！",
        options: {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "❓为什么要加入推荐计划？如何运作？", callback_data: "referralQ1" },
                    ],
                    [
                        { text: "❓如何获得资金代码？", callback_data: "referralQ2" },
                    ],
                    [
                        { text: "返回", callback_data: "general" },
                    ]
                ]
            }
        }
    },
    referralQ1: {
        text: "❓为什么要加入推荐计划？如何运作？\n\n✅Mappedswap的推荐计划采用无限层级模式，推荐人不仅可以享受直接推荐用户的佣金，还可以无限往下追溯间接推荐的用户的交易量，用以提升自己的返佣比例及佣金。只要您的返佣比例高，就可以体验无需交易即可赚取加密货币！邀请朋友一起来吧! ",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "referral" },
                    ]
                ]
            }
        }
    },
    referralQ2: {
        text: "❓如何获得资金代码？\n\n✅请联系您的推荐人，或者点击以下连结进入官方资讯页面：https://mappedswap.io/",
        options: {
            reply_markup: {
                inline_keyboard:
                [
                    [
                        { text: "返回", callback_data: "referral" },
                    ]
                ]
            }
        }
    }
}