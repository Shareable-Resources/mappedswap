export default {
  common: {
    search: '查詢',
    reset: '重置',
    export: '導出',
    create: '新增',
    asset: '資產',
    available: '可用餘額',
    frozen: '凍結餘額',
    total: '餘額總數',
    totalUSDT: '餘額總值（USDT）',
    addr: '地址',
    email: '電郵',
    status: '狀態',
    registerDate: '註冊時間',
    registerFrom: '註冊來源',
    userGroup: '用戶組別',
    userNo: '用戶編號',
    userName: '用戶名稱',
    operation: '操作',
    details: '詳情',
    check: '查看',
    addrType: '地址類型',
    creator: '創建人',
    updator: '更新人',
    createTime: '創建時間',
    updateTime: '更新時間',
    confirm: '確定',
    cancel: '取消',
    edit: '編輯',
    close: '關閉',
    orderID: '訂單號',
    transactionHash: '交易哈希',
    amount: '數量',
    originID: '參考號',
    merchantID: '商戶編號',
    merchantName: '商戶名稱',
    refund: '退款',
    audit: '審批',
    submitFinancePw: '提交人財務密碼',
    auditorFinancePw: '審批人財務密碼',
    type: '類型',
    msg: '消息',
    retry: '重試',
    tz: '時區',
    tip: '提示',
    upload: '上載',
    approve: '通過',
    reject: '拒絕',
    startDate: '開始日期',
    endDate: '結束日期',
    date: '日期',
    selectMonth: '選擇月份'
  },
  filter: {
    realTime: '實時更新',
    snapShot: '快照時間',
    dailyReport: '每日報表'
  },
  options: {
    // userBal
    decentralized: '去中心化',
    centralized: '中心化',
    merchant: '商戶',
    // walletBal
    allWallet: '所有錢包',
    createWallet: '生成地址錢包',
    groupWallet: '歸集錢包',
    feeWallet: '歸集手續費錢包',
    withdrawWallet: '出幣錢包',
    // user
    deleted: '刪除',
    normal: '正常',
    closed: '關閉',
    frozen: '凍結',
    initial: '初始',
    pending: '待定',
    inactive: 'inactive',
    active: 'active',
    rejected: '拒絕',
    namefilled: 'namefilled',
    // merchant
    disable: 'Disable',
    restaurant: 'Restaurant',
    market: 'Market',
    travel: 'Travel',
    others: 'Others',
    // order
    deposit: '充值',
    withdraw: '提現',
    payment: '支付',
    transfer: '轉賬',
    // config
    listed: '上架',
    unlisted: '下架',
    visible: '可見',
    invisible: '不可見',
    from: 'FROM',
    to: 'TO',
    default: '默認',
    fixAmount: '固定數量',
    TYPE_ETH: 'TYPE_ETH',
    EURUS_ETH: 'EURUS_ETH',
    autoFee: '自動報價',
    manual: '手動',
    connected: '已連線',
    disconnected: '已斷線',
    BTC_USDT: 'BTC/USDT',
    ETH_USDT: 'ETH/USDT',
    TRX_USDT: 'TRX/USDT',
    DGT_USDT: 'DGT/USDT',
    GCT_USDT: 'GCT/USDT',
    binance: 'Binance',
    coinbase: 'Coinbase',
    gainbit: 'Gainbit',
    kraken: 'Kraken',
    huobi: 'Huobi',
    // stats
    mainChain: '主鏈',
    sideChain: '私鏈',
    merchantMainChainSubAddr: '商戶主鍊子地址',
    genAddrWallet: '生成地址錢包',
    sweepWallet: '歸集錢包',
    sweepFeeWallet: '歸集手續費錢包',
    hotWallet: '出幣錢包'
  },
  dashboard: {
    cumNoUser: '累計註冊用戶數量'
  },
  userBal: {
    group: '用戶組別'
  },
  walletBal: {
    designatedAddr: '指定地址',
    walletName: '錢包名稱'
  },
  user: {
    kycLevel: 'KYC 等級',
    kycSubmitTime: 'KYC 提交時間',
    kycApproveTime: 'KYC 通過時間',
    privateChainAddr: '私鏈地址',
    kycStatus: 'KYC狀態',
    inviteCode: '邀請碼',
    lastLogin: '最後登錄時間',
    transRecord: '交易記錄',
    genAddr: '生成地址',
    genAddrTip: '請輸入資產幣種'
  },
  merchant: {
    businessType: '行業分類',
    pubkey: '公鑰',
    assetCBURL: '資產回調地址',
    queryCBURL: '查詢回調地址',
    MD5Key: 'MD5密鑰',
    reportPW: '報表密碼',
    uploadTip: '請上載公鑰文件[.pem/.txt]'
  },
  order: {
    recevAddr: '收款地址',
    lastUpdateTime: '最後更新時間',
    privateChainFromAddr: '私鏈轉出方地址',
    privateChainToAddr: '私鏈接收方地址',
    privateChainHash: '私鏈交易哈希',
    privateChainGas: '私鏈交易費',
    publicChainHash: '主鏈交易哈希',
    publicChainFromAddr: '主鏈轉出地址',
    publicChainToAddr: '主鏈收款地址',
    fromBal: '交易前餘額',
    fromFrozen: '交易前凍結',
    toBal: '交易後餘額',
    toFrozen: '交易後凍結',
    fee: '費用',
    paidTotal: '總支付',
    publicChainGas: '主鏈交易費',
    toUser: '收款人',
    fromUser: '用戶編號',
    feePaidBy: '費用支付方',
    fromFromBal: '轉出方交易前餘額',
    fromFromFrozen: '轉出方交易前凍結',
    fromToBal: '轉出方交易後餘額',
    fromToFrozen: '轉出方交易後凍結',
    toFromBal: '接收方交易前餘額',
    toFromFrozen: '接收方交易前凍結',
    toToBal: '接收方交易後餘額',
    toToFrozen: '接收方交易後凍結',
    acceptedFrom: '交易途徑',
    txType: '交易類型',
    otherSide: '對手方',
    callbackAddr: '回調地址',
    fromAddr: '轉出地址'
  },
  admin: {
    roleName: '角色名',
    rights: '權限',
    adminName: '管理員名',
    lastLoginIP: '最後登錄 IP',
    newPW: '新密碼',
    cfNewPW: '再次確認新密碼',
    oldPW: '舊密碼',
    inpPwTip: '請輸入密碼',
    inpPwTip2: '請再次輸入密碼',
    pwErrTip: '兩次輸入密碼不一致'
  },
  config: {
    appidOrMerchant: 'APPID/Merchantid',
    unit: '小數位',
    withdrawFee: '提現手續費',
    withdrawFeeAmount: '提現手續費數量',
    userSelected: '用戶自選',
    minWithdrawAmount: '每筆最小提現額',
    maxWithdrawAmount: '每筆最大提現額',
    maxWithdrawAmountDaily: '每日最大提現額',
    maxWithdrawAmountDaily0: 'KYC 0每日最大提現額',
    maxWithdrawAmountDaily1: 'KYC 1每日最大提現額',
    maxWithdrawAmountDaily2: 'KYC 2每日最大提現額',
    maxWithdrawAmountDaily3: 'KYC 3每日最大提現額',
    minDepositAmount: '每筆最小充值額',
    maxWithdrawAmountApproval: '提現自動審批最大額度',
    maxDepositAmountApproval: '充值自動審批最大額度',
    displaySort: 'APP顯示排序',
    appVisible: 'APP可見',
    feeRate: '費率手續費',
    fixFee: '固定手續費',
    feePaidBy: '扣手續費方',
    maxAutoApprovalAmount: '自動審批最大額度',
    paymentFeeRate: '支付費率手續費',
    fixRate: '固定費率',
    paymentFeeAmount: '支付固定手續費',
    paymentFeePaidBy: '扣支付手續費方',
    transferFeeRate: '轉賬費率手續費',
    transferFeeAmount: '轉賬固定手續費',
    transferFeePaidBy: '扣轉賬手續費方',
    maxPaymentAmountApproval: '支付自動審批最大額度',
    maxTransferAmountApproval: '轉賬自動審批最大額度',
    trandingPair: '交易對',
    marketFeed: '行情源',
    marketQuoVisible: '行情頁可見狀態',
    basicAsset: '基礎貨幣',
    quoteAsset: '報價貨幣',
    decimalDisplay: '報價小數位',
    feeType: '報價方式',
    marketFeedPrice: '行情源價格',
    genPrice: '生成價格',
    marketFeedStatus: '行情源狀態',
    marketPriceDisplaySort: 'APP行情頁排序',
    dailyReportStartTime: '每日報表開始時間',
    dailyReportEndTime: '每日報表結束時間'
  },
  stats: {
    newUserDuringPeriodCount: '期間新註冊用戶數量',
    cumUserCount: '累計註冊用戶數量',
    kycUserDuringPeriodCount: '期間通過KYC用戶數量',
    cumKycUserDuringPeriodCount: '累計已通過KYC用戶數量',
    activeUserDuringPeriodCount: '期間活躍用戶數量',
    paidUserDuringPeriodCount: '期間支付用戶數',
    transferOutUserDuringPeriodCount: '期間轉出用戶數',
    transferInUserDuringPeriodCount: '期間轉入用戶數',
    newMerchantDuringPeriodCount: '期間新增商戶數量',
    cumMerchantCount: '累計商戶數量',
    depositDuringPeriodAmount: '期間充值總數',
    withdrawDuringPeriodAmount: '期間提現總數',
    paymentDuringPeriodAmount: '期間支付總數',
    transferDuringPeriodAmount: '期間轉賬總數',
    depositOrderDuringPeriodCount: '期間充值筆數',
    withdrawOrderDuringPeriodCount: '期間提現筆數',
    paymentOrderDuringPeriodCount: '期間支付筆數',
    transferOrderDuringPeriodCount: '期間轉賬筆數',
    allMerchant: '所有商戶',
    allUser: '所有用戶',
    merchantRecvPaymentDuringPeriodAmount: '期間代收總數',
    paymentFeeDuringPeriodAmount: '期間代收手續費',
    merchantPaidOutDuringPeriodAmount: '期間代付總數',
    withdrawFeeDuringPeriodAmount: '期間提現手續費',
    sideChainPaidOutFeeDuringPeriodAmount: '期間代付私鏈手續費',
    sideChainPaymentFeeDuringPeriodAmount: '期間支付私鏈手續費',
    sideChainTransferFeeDuringPeriodAmount: '期間轉賬私鏈手續費',
    assetType: '資產種類',
    usedAmount: '已用數量',
    availableAmount: '可用數量',
    totalAmount: '總數量',
    walletType: '錢包組別',
    walletAddr: '錢包地址',
    mainChainGasFeePaidAmount: '公鏈支出',
    mainChainGas_ETH: '公鏈支出（ETH）',
    mainChainGas_BTC: '公鏈支出（BTC）',
    mainChainGas_TRX: '公鏈支出（TRX）',
    type: '組別',
    sideChainGasFeeRevAmount: '私鏈鏈上收入',
    sideChainGasFeePaidAmount: '私鏈鏈上支出'
  },
  route: {
    dashboard: '首頁',
    balance: '餘額管理',
    userBalance: '用戶餘額',
    walletBalance: '錢包餘額',
    userAddrBalance: '用戶地址餘額列表',
    user: '用戶管理',
    merchant: '商戶管理',
    order: '訂單管理',
    deposit: '充值記錄',
    withdraw: '提現記錄',
    payment: '支付記錄',
    transfer: '轉賬記錄',
    transaction: '交易記錄',
    callback: '回調記錄',
    bill: '賬單管理',
    dailyBill: '日結單',
    monthlyBill: '月結單',
    statistics: '統計管理',
    userSta: '用戶統計',
    merchantSta: '商戶統計',
    orderSta: '訂單統計',
    userAddrSta: '用戶地址統計',
    publicChainSta: '公鏈統計',
    privateChainSta: '私鏈統計',
    admin: '管理員管理',
    role: '角色列表',
    adminList: '管理員列表',
    changePW: '修改密碼',
    wallet: '錢包管理',
    groupWallet: '歸集錢包管理',
    exportWallet: '出幣錢包管理',
    audit: '審批管理',
    kycAudit: 'KYC審批',
    orderAudit: '訂單審批',
    config: '配置管理',
    assetConfig: '資產配置',
    feeConfig: '費用配置',
    marketPriceConfig: '行情配置',
    reportTimeConfig: '報表時間範圍配置',
    alertNotification: '警報通知管理',
    orderAduitAlert: '訂單審批警報配置',
    walletBalAlert: '錢包餘額警報配置',
    exportStatusAlert: '出幣狀態警報配置',
    log: '日誌管理',
    userLoginLog: '用戶登錄日誌',
    adminOperationLog: '後台操作日誌',
    information: '資訊管理',
    announcement: '公告管理',
    msgNotification: '信息通知管理',
    manualOrder: '人工訂單管理',
    createManualOrder: '新建人工訂單',
    auditManualOrder: '審批人工訂單',
    agent: '代理',
    agentInfo: '代理資料',
    agentList: '代理列表',
    customer: '客戶',
    customerList: '客戶列表',
    customerBalance: '客戶結餘',
    customerCredit: '授信紀錄',
    customerBalanceHistory: '額度紀錄',
    settlement: '結算報表',
    settlementDaily: '日報表',
    transactionHistory: '交易紀錄',
    interestHistory: '實際收息紀錄'
  },
  navbar: {
    dashboard: '首頁',
    github: 'Github',
    logOut: '退出登錄',
    profile: '個人中心',
    theme: 'Theme',
    size: '佈局大小'
  },
  login: {
    title: 'DeCATS代理系統',
    logIn: '登錄',
    username: '登錄號',
    appid: 'APP編號',
    googlecode: '登錄驗證碼',
    password: '登錄密碼'
  },
  documentation: {
    documentation: '文檔',
    github: 'Github 地址'
  },
  permission: {
    addRole: '新增角色',
    editPermission: '編輯權限',
    roles: '你的權限',
    switchRoles: '切換權限',
    tips: '在某些情況下，不適合使用 v-permission。例如：Element-UI 的 el-tab 或 el-table-column 以及其它動態渲染 dom 的場景。你只能通過手動設置 v-if 來實現。',
    delete: '刪除',
    confirm: '確定',
    cancel: '取消'
  },
  guide: {
    description: '引導頁對於一些第一次進入項目的人很有用，你可以簡單介紹下項目的功能。本 Demo 是基於',
    button: '打開引導'
  },
  components: {
    documentation: '文檔',
    tinymceTips: '富文本是管理後台一個核心的功能，但同時又是一個有很多坑的地方。在選擇富文本的過程中我也走了不少的彎路，市面上常見的富文本都基本用過了，最終權衡了一下選擇了Tinymce。更詳細的富文本比較和介紹見',
    dropzoneTips: '由於我司業務有特殊需求，而且要傳七牛 所以沒用第三方，選擇了自己封裝。代碼非常的簡單，具體代碼你可以在這裡看到 @/components/Dropzone',
    stickyTips: '當頁面滾動到預設的位置會吸附在頂部',
    backToTopTips1: '頁面滾動到指定位置會在右下角出現返回頂部按鈕',
    backToTopTips2: '可自定義按鈕的樣式、show/hide、出現的高度、返回的位置 如需文字提示，可在外部使用Element的el-tooltip元素',
    imageUploadTips: '由於我在使用時它只有vue@1版本，而且和mockjs不兼容，所以自己改造了一下，如果大家要使用的話，優先還是使用官方版本。'
  },
  table: {
    dynamicTips1: '固定表頭, 按照表頭順序排序',
    dynamicTips2: '不固定表頭, 按照點擊順序排序',
    dragTips1: '默認順序',
    dragTips2: '拖拽後順序',
    title: '標題',
    importance: '重要性',
    type: '類型',
    remark: '點評',
    search: '搜索',
    add: '添加',
    export: '導出',
    reviewer: '審核人',
    id: '序號',
    date: '時間',
    author: '作者',
    readings: '閱讀數',
    status: '狀態',
    actions: '操作',
    edit: '編輯',
    publish: '發佈',
    draft: '草稿',
    delete: '刪除',
    cancel: '取 消',
    confirm: '確 定'
  },
  example: {
    warning: '創建和編輯頁面是不能被 keep-alive 緩存的，因為keep-alive 的 include 目前不支持根據路由來緩存，所以目前都是基於 component name 來進行緩存的。如果你想類似的實現緩存效果，可以使用 localStorage 等瀏覽器緩存方案。或者不要使用 keep-alive 的 include，直接緩存所有頁面。詳情見'
  },
  errorLog: {
    tips: '請點擊右上角bug小圖標',
    description: '現在的管理後台基本都是spa的形式了，它增強了用戶體驗，但同時也會增加頁面出問題的可能性，可能一個小小的疏忽就導致整個頁面的死鎖。好在 Vue 官網提供了一個方法來捕獲處理異常，你可以在其中進行錯誤處理或者異常上報。',
    documentation: '文檔介紹'
  },
  excel: {
    export: '導出',
    selectedExport: '導出已選擇項',
    placeholder: '請輸入文件名(默認excel-list)'
  },
  zip: {
    export: '導出',
    placeholder: '請輸入文件名(默認file)'
  },
  pdf: {
    tips: '這裡使用   window.print() 來實現下載pdf的功能'
  },
  theme: {
    change: '換膚',
    documentation: '換膚文檔',
    tips: 'Tips: 它區別於 navbar 上的 theme-pick, 是兩種不同的換膚方法，各自有不同的應用場景，具體請參考文檔。'
  },
  tagsView: {
    refresh: '刷新',
    close: '關閉',
    closeOthers: '關閉其它',
    closeAll: '關閉所有'
  },
  settings: {
    title: '系統佈局配置',
    theme: '主題色',
    tagsView: '開啓 Tags-View',
    fixedHeader: '固定 Header',
    sidebarLogo: '側邊欄 Logo'
  },
  agent: {
    walletAddress: '錢包地址',
    email: '電郵',
    name: '名稱',
    credit: '信用額度(USDL)',
    usedCreditForAgents: '已授權代理信用(USDL)',
    usedCreditForCustomers: '已授權客戶信用(USDL)',
    feeRate: '交易費分成比例(%)',
    interestRate: '利息分成比例(%)',
    password: '密碼',
    confirmPassword: '確定密碼',
    directFee: '直客手續費',
    directInterest: '直客利息',
    directFeeIncome: '直客手續費收入',
    directInterestIncome: '直客利息收入',
    allSubAgentFee: '代理手續費',
    allSubAgentInterest: ' 代理利息',
    allSubAgentFeeIncome: '代理手續費收入',
    allSubAgentInterestIncome: '代理利息收入',
    allChildAgentFeeIncome: '直屬代理手續費收入',
    allChildAgentInterestIncome: '直屬代理利息收入',
    netAgentFeeIncome: '淨代理手續費收入',
    netAgentInterestIncome: '淨代理利息收入',
    totalIncome: '總收入'
  },
  customer: {
    walletAddress: '錢包地址',
    email: '電郵',
    name: '名稱',
    credit: '信用額度(USDL)',
    riskLevel: '風險水平(%)',
    status: '狀態',
    statusOption: {
      enabled: '啓用',
      disabled: '禁用'
    },
    token: '貨幣',
    sumOfIncome: '結餘',
    usdlValue: '等值USDL',
    lastModifiedDate: '最後更新日期',
    balance: '結餘',
    amount: '數量',
    txnType: '類型',
    txStatus: '狀態',
    txHash: '交易哈希',
    sellToken: '賣出貨幣',
    sellAmount: '賣出數量',
    buyToken: '買入貨幣',
    buyAmount: '買入數量',
    totalUsdl: 'USDL 總數',
    totalBtcl: 'BTCL 總數',
    totalEthl: 'ETHL 總數',
    tradeTime: '交易時間',
    timeLength: '時長',
    interestRate: '利率',
    interest: '利息',
    origCredit: '原本信用額度(USDL)'
  },
  txnStatusOption: {
    confirmed: 'Confirmed',
    rejected: 'rejected',
    accepted: 'Accepted'
  },
  txnTypeOption: {
    deposit: '存款',
    withdraw: '取款',
    trade: '交易'
  },
  decatsToken: {
    usdl: 'USDL',
    ethl: 'ETHL',
    btcl: 'BTCL'
  }
}
