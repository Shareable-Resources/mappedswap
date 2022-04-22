export default {
  common: {
    search: 'Search',
    reset: 'Reset',
    export: 'Export',
    create: 'Create',
    asset: 'Asset',
    available: 'Availiable',
    frozen: 'Frozen',
    total: 'Total',
    totalUSDT: 'Value (USDT)',
    addr: 'Address',
    email: 'Email',
    status: 'Status',
    registerDate: 'Registration Time',
    registerFrom: 'Register From',
    userGroup: 'User Group',
    userNo: 'User ID',
    userName: 'User name',
    operation: 'Operate',
    details: 'Details',
    check: 'View',
    addrType: 'Address Type',
    creator: 'Created By',
    updator: 'Updated By',
    createTime: 'Create Time',
    updateTime: 'Update Time',
    confirm: 'Confirm',
    cancel: 'Cancel',
    edit: 'Edit',
    close: 'Close',
    orderID: 'Order ID',
    transactionHash: 'Tx Hash',
    amount: 'Amount',
    originID: 'Merchant Order ID',
    merchantID: 'Merchant ID',
    merchantName: 'Merchant name',
    refund: 'Refund',
    audit: 'Approval',
    submitFinancePw: 'Submitter Finance GA Code',
    auditorFinancePw: 'Approver Finance GA Code',
    type: 'Type',
    msg: 'Message',
    retry: 'Retry',
    tz: 'Time Zone',
    tip: 'Tip',
    upload: 'Upload',
    approve: 'Approve',
    reject: 'Reject',
    startDate: 'Start Date',
    endDate: 'End Date',
    date: 'Date',
    selectMonth: 'Selected Month'
  },
  filter: {
    realTime: 'Live Update',
    snapShot: 'Snapshot Time',
    dailyReport: 'Daily Report'
  },
  options: {
    // userBal
    decentralized: 'Decentralized',
    centralized: 'Centralized',
    merchant: 'Merchant',
    // walletBal
    allWallet: 'All Wallets',
    createWallet: 'Generating Address Wallet',
    groupWallet: 'Sweep Wallet',
    feeWallet: 'Sweep Fee Wallet',
    withdrawWallet: 'Hot Wallet',
    // user
    deleted: 'Deleted',
    normal: 'Normal',
    closed: 'Closed',
    frozen: 'Frozen',
    initial: 'Initial',
    pending: 'Pending',
    inactive: 'Inactive',
    active: 'Active',
    rejected: 'Rejected',
    namefilled: 'Namefilled',
    // merchant
    disable: 'Disable',
    restaurant: 'Restaurant',
    market: 'Market',
    travel: 'Travel',
    others: 'Others',
    // order
    deposit: 'Deposit',
    withdraw: 'Withdarw',
    payment: 'Payment',
    transfer: 'Transfer',
    // config
    listed: 'Listed',
    unlisted: 'Unlisted',
    visible: 'Visible',
    invisible: 'Invisible',
    from: 'FROM',
    to: 'TO',
    default: 'Default',
    fixAmount: 'Fix Amount',
    TYPE_ETH: 'TYPE_ETH',
    EURUS_ETH: 'EURUS_ETH',
    autoFee: 'Auto Feed',
    manual: 'Manual',
    connected: 'Connected',
    disconnected: 'Disconnected',
    BTC_USDT: 'BTC/USDT',
    ETH_USDT: 'ETH/USDT',
    TRX_USDT: 'TRX/USDT',
    DGT_USDT: 'DGT/USDT',
    GCT_USDT: 'GCT/USDT',
    Binance: 'Binance',
    Coinbase: 'Coinbase',
    Gainbit: 'Gainbit',
    Kraken: 'Kraken',
    Huobi: 'Huobi',
    // stats
    mainChain: 'Main Chain',
    sideChain: 'Side Chain',
    merchantMainChainSubAddr: 'Merchant Main Chain Sub Address',
    genAddrWallet: 'Generating Address Wallet',
    sweepWallet: 'Sweep Wallet',
    sweepFeeWallet: 'Sweep Fee Wallet',
    hotWallet: 'Hot Wallet'
  },
  dashboard: {
    cumNoUser: 'Cumulative number of users'
  },
  userBal: {
    userGroup: 'User Group'
  },
  walletBal: {
    designatedAddr: 'Specified Address',
    walletName: 'Wallet Name'
  },
  user: {
    kycLevel: 'KYC Level',
    kycSubmitTime: 'KYC Submitted Time',
    kycApproveTime: 'KYC Approved Time',
    privateChainAddr: 'Side Chain Address',
    kycStatus: 'KYC Status',
    inviteCode: 'Invitation Code',
    lastLogin: 'Last Login Time',
    transRecord: 'Transaction Record',
    genAddr: 'Generate Address',
    genAddrTip: 'Asset of address want to create'
  },
  merchant: {
    businessType: 'Merchant Category',
    pubkey: 'Pubkey',
    assetCBURL: 'Asset Callback URL',
    queryCBURL: 'Query Callback URL',
    MD5Key: 'MD5Key',
    reportPW: 'Report Password',
    uploadTip: 'Please upload pubkey file [.pem/.txt]'
  },
  order: {
    recevAddr: 'To Address',
    lastUpdateTime: 'Last Update Time',
    privateChainFromAddr: 'From Side Chain Address',
    privateChainToAddr: 'To Side Chain Address',
    privateChainHash: 'Main Chain Tx Hash',
    privateChainGas: 'Side Chain Gas Fee',
    publicChainHash: 'Side Chain Tx Hash',
    publicChainFromAddr: 'From Main Chain Address',
    publicChainToAddr: 'To Main Chain Address',
    fromBal: 'Total Balance Before',
    fromFrozen: 'Frozen Balance Before',
    toBal: 'Total Balance After',
    toFrozen: 'Frozen Balance After',
    fee: 'Fee',
    paidTotal: 'Total Amount Paid',
    publicChainGas: 'Main Chain Gas Fee',
    toUser: 'To UserID',
    fromUser: 'User ID',
    feePaidBy: 'Fee Paid By',
    fromFromBal: 'From User Total Balance Before',
    fromFromFrozen: 'From User Frozen Balance Before',
    fromToBal: 'From User Total Balance After',
    fromToFrozen: 'From User Frozen Balance After',
    toFromBal: 'To User Total Balance Before',
    toFromFrozen: 'To User Frozen Balance Before',
    toToBal: 'To User Total Balance After',
    toToFrozen: 'To User Frozen Balance After',
    acceptedFrom: 'Order Path',
    txType: 'Order Type',
    otherSide: 'Other Party',
    callbackAddr: 'Callback URL',
    fromAddr: 'From Address'
  },
  admin: {
    roleName: 'Role Name',
    rights: 'Rights',
    adminName: 'Administrator Name',
    lastLoginIP: 'Last Login IP',
    newPW: 'New Password',
    cfNewPW: 'Confirm New Password',
    oldPW: 'Old Password',
    inpPwTip: 'Please input password',
    inpPwTip2: 'Please input password again',
    pwErrTip: 'Different password, please check'
  },
  config: {
    appidOrMerchant: 'APPID/Merchantid',
    unit: 'Decimal Places Display',
    withdrawFee: 'Withdraw Fee',
    withdrawFeeAmount: 'Withdraw Fee Amount',
    userSelected: 'User Self-selected',
    minWithdrawAmount: 'Minimum Withdraw Amount Per Order',
    maxWithdrawAmount: 'Maximum Withdraw Amount Per Order',
    maxWithdrawAmountDaily: 'Daily Maximum Withdraw Amount',
    maxWithdrawAmountDaily0: 'KYC 0 Daily Maximum Withdraw Amount',
    maxWithdrawAmountDaily1: 'KYC 1 Daily Maximum Withdraw Amount',
    maxWithdrawAmountDaily2: 'KYC 2 Daily Maximum Withdraw Amount',
    maxWithdrawAmountDaily3: 'KYC 3 Daily Maximum Withdraw Amount',
    minDepositAmount: 'Minimum Deposit Amount Per Order',
    maxWithdrawAmountApproval: 'Maximum Auto Approval Withdraw Amount',
    maxDepositAmountApproval: 'Maximum Auto Approval Deposit Amount',
    displaySort: 'APP Display Sort',
    appVisible: 'APP Visible',
    feeRate: 'Fee Rate',
    fixFee: 'Fix Fee',
    feePaidBy: 'Fee Paid By',
    maxAutoApprovalAmount: 'Maximum Auto Approval Amount',
    paymentFeeRate: 'Payment Fee Rate',
    fixRate: 'Fix Rate',
    paymentFeeAmount: 'Payment Fee Amount',
    paymentFeePaidBy: 'Payment Fee Paid By',
    transferFeeRate: 'Transfer Fee Rate',
    transferFeeAmount: 'Transfer Fee Amount',
    transferFeePaidBy: 'Transfer Fee Paid By',
    maxPaymentAmountApproval: 'Maximum Auto Approval Payment Amount',
    maxTransferAmountApproval: 'Maximum Auto Approval Transfer Amount',
    trandingPair: 'Trading Pair',
    marketFeed: 'Market Feed',
    marketQuoVisible: 'Market Quotation Page Visible',
    basicAsset: 'Basic Asset',
    quoteAsset: 'Quote Asset',
    decimalDisplay: 'Decimal Places Display',
    feeType: 'Feed Type',
    marketFeedPrice: 'Market Feed Price',
    genPrice: 'Generate Price',
    marketFeedStatus: 'Market Feed Status',
    marketPriceDisplaySort: 'APP Display Sort',
    dailyReportStartTime: 'Daily Report Start Time',
    dailyReportEndTime: 'Daily Report End Time'
  },
  stats: {
    newUserDuringPeriodCount: 'Number of new users during period',
    cumUserCount: 'Cumulative number of users',
    kycUserDuringPeriodCount: 'Number of approved KYC users during period',
    cumKycUserDuringPeriodCount: 'Cumulative number of approved KYC users',
    activeUserDuringPeriodCount: 'Number of active users during period',
    paidUserDuringPeriodCount: 'Number of paid users during period',
    transferOutUserDuringPeriodCount: 'Number of transferred out users during period',
    transferInUserDuringPeriodCount: 'Number of transferred in users during period',
    newMerchantDuringPeriodCount: 'Number of new merchants during period',
    cumMerchantCount: 'Cumulative number of merchants',
    depositDuringPeriodAmount: 'Total amount of deposit during period',
    withdrawDuringPeriodAmount: 'Total amount of withdraw during period',
    paymentDuringPeriodAmount: 'Total amount of payment during period',
    transferDuringPeriodAmount: 'Total amount of transfer during period',
    depositOrderDuringPeriodCount: 'Number of deposit orders during period',
    withdrawOrderDuringPeriodCount: 'Number of withdraw orders during period',
    paymentOrderDuringPeriodCount: 'Number of payment orders during period',
    transferOrderDuringPeriodCount: 'Number of transfer orders during period',
    allMerchant: 'All Merchants',
    allUser: 'All Users',
    merchantRecvPaymentDuringPeriodAmount: 'Total amount of merchant received payment during period',
    paymentFeeDuringPeriodAmount: 'Total amount of payment fee during period',
    merchantPaidOutDuringPeriodAmount: 'Total amount of merchant paid out during period(Transfer Out+Withdraw)',
    withdrawFeeDuringPeriodAmount: 'Total amount of withdraw fee during period',
    sideChainPaidOutFeeDuringPeriodAmount: 'Total amount of side chain paid out fee during period(Transfer Out+Withdraw)',
    sideChainPaymentFeeDuringPeriodAmount: 'Total amount of side chain payment fee during period',
    sideChainTransferFeeDuringPeriodAmount: 'Total amount of side chain transfer fee during period',
    assetType: 'Asset Type',
    usedAmount: 'Used Amount',
    availableAmount: 'Availiable Amount',
    totalAmount: 'Total Amount',
    walletType: 'Wallet Type',
    walletAddr: 'Wallet Address',
    mainChainGasFeePaidAmount: 'Main chain gas fee paid',
    mainChainGas_ETH: 'Main chain gas fee paid(ETH)',
    mainChainGas_BTC: 'Main chain gas fee paid(BTC)',
    mainChainGas_TRX: 'Main chain gas fee paid(TRX)',
    type: 'Type',
    sideChainGasFeeRevAmount: 'Side chain gas fee earned',
    sideChainGasFeePaidAmount: 'Side chain gas fee paid'
  },
  route: {
    dashboard: 'Dashboard',
    balance: 'Balance Manage',
    userBalance: 'User Balance',
    walletBalance: 'Wallet Balance',
    userAddrBalance: 'User Address Balance',
    user: 'User Manage',
    merchant: 'Merchant  Manage',
    order: 'Transaction  Manage',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    payment: 'Payment',
    transfer: 'Transfer',
    transaction: 'Transaction',
    callback: 'Callback',
    bill: 'Statement  Manage',
    dailyBill: 'Daily Statement',
    monthlyBill: 'Monthly Statement',
    statistics: 'Statistics  Manage',
    userSta: 'User',
    merchantSta: 'Merchant',
    orderSta: 'Transaction',
    userAddrSta: 'User Address',
    publicChainSta: 'Public Chain',
    privateChainSta: 'Private Chain',
    admin: 'Administrator Mange',
    role: 'Role',
    adminList: 'Administrator',
    changePW: 'Change Password',
    wallet: 'Wallet  Manage',
    groupWallet: 'Sweep Wallet  Manage',
    exportWallet: 'Hot Wallet  Manage',
    audit: 'Approval  Manage',
    kycAudit: 'KYC Approval',
    orderAudit: 'Order Approval',
    config: 'Setting  Manage',
    assetConfig: 'Asset',
    feeConfig: 'Fee',
    marketPriceConfig: 'Market Quotation',
    reportTimeConfig: 'Report Time Range',
    alertNotification: 'Alert  Manage',
    orderAduitAlert: 'Order Alert',
    walletBalAlert: 'Wallet Balance Alert',
    exportStatusAlert: 'Withdraw Status Alert',
    log: 'Log  Manage',
    userLoginLog: 'User Log',
    adminOperationLog: 'Adminstrator Log',
    information: 'Notice Manage',
    announcement: 'Announcement  Manage',
    msgNotification: 'Message Manage',
    manualOrder: 'Manual Order Manage',
    createManualOrder: 'Add Manual Order',
    auditManualOrder: 'Approve Manual Order',
    agent: 'Agent',
    agentInfo: 'Profile',
    agentList: 'Agent List',
    customer: 'Customer',
    customerList: 'List',
    customerBalance: 'Balance',
    customerCredit: 'Credit',
    customerBalanceHistory: 'Balance History',
    settlement: 'Settlement',
    settlementDaily: 'Daily Record',
    transactionHistory: 'Transaction History',
    interestHistory: 'Interest History'
  },
  navbar: {
    dashboard: 'Dashboard',
    github: 'Github',
    logOut: 'Log Out',
    profile: 'Profile',
    theme: 'Theme',
    size: 'Global Size'
  },
  login: {
    title: 'DeCATS Agent System',
    logIn: 'Login',
    username: 'Login ID',
    appid: 'APPID',
    googlecode: 'GA Code',
    password: 'Password'
  },
  documentation: {
    documentation: 'Documentation',
    github: 'Github Repository'
  },
  permission: {
    addRole: 'New Role',
    editPermission: 'Edit',
    roles: 'Your roles',
    switchRoles: 'Switch roles',
    tips: 'In some cases, using v-permission will have no effect. For example: Element-UI  el-tab or el-table-column and other scenes that dynamically render dom. You can only do this with v-if.',
    delete: 'Delete',
    confirm: 'Confirm',
    cancel: 'Cancel'
  },
  guide: {
    description: 'The guide page is useful for some people who entered the project for the first time. You can briefly introduce the features of the project. Demo is based on ',
    button: 'Show Guide'
  },
  components: {
    documentation: 'Documentation',
    tinymceTips: 'Rich text is a core feature of the management backend, but at the same time it is a place with lots of pits. In the process of selecting rich texts, I also took a lot of detours. The common rich texts on the market have been basically used, and I finally chose Tinymce. See the more detailed rich text comparison and introduction.',
    dropzoneTips: 'Because my business has special needs, and has to upload images to qiniu, so instead of a third party, I chose encapsulate it by myself. It is very simple, you can see the detail code in @/components/Dropzone.',
    stickyTips: 'when the page is scrolled to the preset position will be sticky on the top.',
    backToTopTips1: 'When the page is scrolled to the specified position, the Back to Top button appears in the lower right corner',
    backToTopTips2: 'You can customize the style of the button, show / hide, height of appearance, height of the return. If you need a text prompt, you can use element-ui el-tooltip elements externally',
    imageUploadTips: 'Since I was using only the vue@1 version, and it is not compatible with mockjs at the moment, I modified it myself, and if you are going to use it, it is better to use official version.'
  },
  table: {
    dynamicTips1: 'Fixed header, sorted by header order',
    dynamicTips2: 'Not fixed header, sorted by click order',
    dragTips1: 'The default order',
    dragTips2: 'The after dragging order',
    title: 'Title',
    importance: 'Imp',
    type: 'Type',
    remark: 'Remark',
    search: 'Search',
    add: 'Add',
    export: 'Export',
    reviewer: 'reviewer',
    id: 'ID',
    date: 'Date',
    author: 'Author',
    readings: 'Readings',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    publish: 'Publish',
    draft: 'Draft',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  example: {
    warning: 'Creating and editing pages cannot be cached by keep-alive because keep-alive include does not currently support caching based on routes, so it is currently cached based on component name. If you want to achieve a similar caching effect, you can use a browser caching scheme such as localStorage. Or do not use keep-alive include to cache all pages directly. See details'
  },
  errorLog: {
    tips: 'Please click the bug icon in the upper right corner',
    description: 'Now the management system are basically the form of the spa, it enhances the user experience, but it also increases the possibility of page problems, a small negligence may lead to the entire page deadlock. Fortunately Vue provides a way to catch handling exceptions, where you can handle errors or report exceptions.',
    documentation: 'Document introduction'
  },
  excel: {
    export: 'Export',
    selectedExport: 'Export Selected Items',
    placeholder: 'Please enter the file name (default excel-list)'
  },
  zip: {
    export: 'Export',
    placeholder: 'Please enter the file name (default file)'
  },
  pdf: {
    tips: 'Here we use window.print() to implement the feature of downloading PDF.'
  },
  theme: {
    change: 'Change Theme',
    documentation: 'Theme documentation',
    tips: 'Tips: It is different from the theme-pick on the navbar is two different skinning methods, each with different application scenarios. Refer to the documentation for details.'
  },
  tagsView: {
    refresh: 'Refresh',
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  },
  settings: {
    title: 'Page style setting',
    theme: 'Theme Color',
    tagsView: 'Open Tags-View',
    fixedHeader: 'Fixed Header',
    sidebarLogo: 'Sidebar Logo'
  },
  agent: {
    walletAddress: 'Wallet Address',
    email: 'Email',
    name: 'Name',
    credit: 'Credit(USDL)',
    usedCreditForAgents: 'Used Credit For Agents(USDL)',
    usedCreditForCustomers: 'Used Credit For Customers(USDL)',
    feeRate: 'Fee Rate(%)',
    interestRate: 'Interest Rate(%)',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    directFee: 'Direct Fee',
    directInterest: 'Direct Interest',
    directFeeIncome: 'Direct Fee Income',
    directInterestIncome: 'Direct Interest Income',
    allSubAgentFee: 'All Sub Agent Fee',
    allSubAgentInterest: 'All Sub Agent Interest',
    allSubAgentFeeIncome: 'All Sub Agent Fee Income',
    allSubAgentInterestIncome: 'All Sub Agent Interest Income',
    allChildAgentFeeIncome: 'All Child Agent Fee Income',
    allChildAgentInterestIncome: 'All Child Agent Interest Income',
    netAgentFeeIncome: 'Net Agent Fee Income',
    netAgentInterestIncome: 'Net Agent Interest Income',
    totalIncome: 'Total Income'
  },
  customer: {
    walletAddress: 'Wallet Address',
    email: 'Email',
    name: 'Name',
    credit: 'Credit(USDL)',
    riskLevel: 'Risk Level(%)',
    status: 'Status',
    statusOption: {
      enabled: 'Enabled',
      disabled: 'Disabled'
    },
    token: 'Token',
    sumOfIncome: 'Sum Of Income',
    usdlValue: 'USDL Value',
    lastModifiedDate: 'Last Modfied Date',
    balance: 'Balance',
    amount: 'Amount',
    txnType: 'Type',
    txStatus: 'Status',
    txHash: 'Tx Hash',
    sellToken: 'Sell Token',
    sellAmount: 'Sell Amount',
    buyToken: 'Buy Token',
    buyAmount: 'Buy Amount',
    totalUsdl: 'Total USDL',
    totalBtcl: 'Total BTCL',
    totalEthl: 'Total ETHL',
    tradeTime: 'Trade Time',
    timeLength: 'Time Length',
    interestRate: 'Interest Rate',
    interest: 'Interest',
    origCredit: 'Original Credit(USDL)'
  },
  txnStatusOption: {
    confirmed: 'Confirmed',
    rejected: 'rejected',
    accepted: 'Accepted'
  },
  txnTypeOption: {
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    trade: 'Trade'
  },
  decatsToken: {
    usdl: 'USDL',
    ethl: 'ETHL',
    btcl: 'BTCL'
  }
}
