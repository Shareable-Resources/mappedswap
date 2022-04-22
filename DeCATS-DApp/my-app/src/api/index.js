import {getWalletAddress} from "../store";

export function priceHistory(pairName, interval) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/priceHistories/getKLineData?pairName=${pairName}&timeInterval=${interval}`;
}

export function tokenTradeVolume(pairName, duration) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/priceHistories/getKLineDataVolumeSum?pairName=${pairName}&duration=${duration}`;
}

export function tokenLatestPrice() {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/prices`;
}

export function tokenHistoryPrice(pairName) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/priceHistories/getHistoryPrice?pairName=${pairName}`;
}

export function tokenBlockPriceList(pageSize, page, pairName, dateFrom, dateTo) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/prices/getAllBlockPrice?recordPerPage=${pageSize}&pageNo=${page}&pairName=${pairName}&dateFrom=${dateFrom}&dateTo=${dateTo} `;
}

export function fundingCode() {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/customers/loadFundingCode`;
}

export function allFundingCode(pageSize, page) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/customers/getAllFundingCode?recordPerPage=${pageSize}&pageNo=${page}`;
}

export function transactionHistory(pageSize, page) {
  let walletAddress = getWalletAddress();
  return `${process.env.REACT_APP_DECATS_DAPP_API}/transactions?recordPerPage=${pageSize}&pageNo=${page}&address=${walletAddress}`;
}

export function withdrawDepositHistory(pageSize, page, TYPE) {
  let walletAddress = getWalletAddress();
  return `${process.env.REACT_APP_DECATS_DAPP_API}/balancesHistories?recordPerPage=${pageSize}&pageNo=${page}&type=${TYPE}&address=${walletAddress}`;
}

export function interestHistory(pageSize, page) {
  let walletAddress = getWalletAddress();
  return `${process.env.REACT_APP_DECATS_DAPP_API}/interestHistories?recordPerPage=${pageSize}&pageNo=${page}&address=${walletAddress}`;
}

export function friendList(inputWalletAddress) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/commissionJobs/getSubAgentsWeeklyCommission${inputWalletAddress && `?address=${inputWalletAddress}`}`;
}

export function expectedCommission(stakedMST) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/commissionJobs/getExpectedCommission?holdMST=${stakedMST}`;
}

export function MSTRate() {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/agents/getMstToUsdRate`;
}

export function LedgerList(pageSize, page, month, year, STATUS) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/commissionJobs/getLedgers?recordPerPage=${pageSize}&pageNo=${page}${month && `&dateMonth=${month}`}&dateYear=${year}${STATUS && `&status=${STATUS}`}${`&distCommission=0`}`;
}

export function LedgerDetail(cronJobId) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/commissionJobs/getLedgersDetails?cronJobId=${cronJobId}`;
}

export function acquireSuccessForDistributions() {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/commissionJobs/acquireSuccess`;
}

export function claimableRewardDetail(pageSize, page, token) {
  if (token == "USDC") {
    token = "USD";
  } else if (token == "wBTC") {
    token = "BTC";
  }
  return `${process.env.REACT_APP_DECATS_DAPP_API}/miningRewards/getRewardByAddress?recordPerPage=${pageSize}&pageNo=${page}&token=${token}`;
}

export function acquireSuccessForMiningRewards() {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/miningRewards/updateRewardById`;
}

export function getClaimSummary(token) {
  if (token == "USDC") {
    token = "USD";
  } else if (token == "wBTC") {
    token = "BTC";
  }
  return `${process.env.REACT_APP_DECATS_DAPP_API}/miningRewards/getClaimSummary?token=${token}`;
}

export function mstDistRules() {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/mstDistRules`;
}

export function getBurnTransaction(pageSize, page) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/transactions/getAllBurnTranscation?recordPerPage=${pageSize}&pageNo=${page}`;
}

export function getBuyBackTransaction(pageSize, page) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/transactions/getAllBuyBackTranscation?recordPerPage=${pageSize}&pageNo=${page}`;
}

export function getProfitAndLoss(dateFrom, dateTo) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/profitAndLossReports?recordPerPage=30&pageNo=0&dateFrom=${dateFrom}&dateTo=${dateTo}`;
}

export function connectWallet() {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/connectedWallets/create`;
}

export function leaderBoardRanking(recordSize) {
  return `${process.env.REACT_APP_DECATS_DAPP_API}/leaderBoardRankings?recordPerPage=${recordSize}&pageNo=0`;
}
