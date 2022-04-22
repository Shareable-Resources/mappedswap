import Web3 from "web3";
import {
  getSideChainNetworks,
  // getEurusApiUrl,
  // getAdminApiUrl,
  getUsdmSmartContractAddress,
  getBtcmSmartContractAddress,
  getEthmSmartContractAddress,
  getPoolSmartContractAddress,
  getPayoutContractAddress,
  getStakingContractAddress,
  getMstSmartContractAddress,
  getMappedSwapToken,
  getMiningPoolTokenContract,
  getERC20Token,
  getEthereumNetworks,
  getMappedSwapTokenForEthereum,
  getEurusFixedRateExchangeContractAddress,
  getEurusFixedRateExchangeProviderAddress,
  getEurusUsdcContractAddress
} from "../network";
import EurusERC20 from "../contracts/EurusERC20.json";
import Pool from "../contracts/Pool.json";
import Staking from "../contracts/Staking.json";
import Payout from "../contracts/Payout.json";
import Mining from "../contracts/Mining.json";
import FixedRateExchange from "../contracts/FixedRateExchange.json";
import { getWalletAddress, clearAllUserInfo, getTokenList, getMappedSwapTokenList } from "../store";
import axios from "axios";
import icon_ethm from "../asset/icon_ethm.svg";
import icon_btcm from "../asset/icon_btcm.svg";
import icon_usdm from "../asset/icon_usdm.svg";
import { bigNumbverDivideDecimals, bigNumbverMultipleDecimals, bigNumberTimes, bigNumberToFixed } from "../utils";
import notify from "../component/Toast";

const ESTIMATE_GAS_BUFFER = 1.1;

export function getEthereum() {
  const { ethereum } = window;
  // console.log("ethereum", ethereum);
  return ethereum;
}

export function checkDappBrowser() {
  if (getEthereum()) {
    return true;
  } else {
    return false;
  }
}

export async function getAccount() {
  const _walletAddress = getWalletAddress();
  if (_walletAddress) {
    return _walletAddress;
  } else {
    // try {
    //   // Request account access if needed
    //   const accounts = await getEthereum().send("eth_requestAccounts");
    //   console.log(" accounts", accounts);
    //   // Accounts now exposed, use them
    //   getEthereum().send("eth_sendTransaction", {from: accounts[0] /* ... */});
    //   return accounts;
    // } catch (error) {
    //   // User denied account access
    // }
    return getEthereum().request({ method: "eth_requestAccounts" });
  }
}

export async function watchWalletAsset(tokenName, isEthNetworkBol) {
  let addResult = "";
  // alert("watchWalletAsset");
  try {
    const switchResult = await switchEthereumChain(isEthNetworkBol);
    let address = " ";
    let mappedSwapTokenList = getMappedSwapTokenList();
    if (!isEthNetworkBol) {
      address = getMappedSwapToken()[tokenName];
    } else if (isEthNetworkBol) {
      address = getMappedSwapTokenForEthereum()[tokenName];
    }
    // alert("switchResult");
    // alert(switchResult);
    if (switchResult) {
      await getEthereum()
        .request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: address,
              symbol: tokenName,
              decimals: mappedSwapTokenList.find((token) => token.tokenName === tokenName).decimal,
              // image: mappedSwapTokenList.find((token) => token.tokenName === tokenName).tokenIcon,
            },
          },
        })
        .then((success) => {
          if (success) {
            addResult = true;
          } else {
            addResult = false;
          }
        });
    }
    return addResult;
  } catch (error) {
    console.log("#### watchWalletAsset Error:", error);
  }
}

export function addAccountChangeListener(fundingCode) {
  // getEthereum().on("accountsChanged", (accounts) => {
  //   clearAllUserInfo();
  //   if (fundingCode) {
  //     window.location.href = `/account?r=${fundingCode}`;
  //   } else {
  //     window.location.href = `/account`;
  //   }
  // });
  console.log("addAccountChangeListener fundingCode:", fundingCode);
}

export function isMetamask() {
  if (checkDappBrowser()) {
    const isMetamaskBol = getEthereum().isMetaMask;
    if (!isMetamaskBol) {
      return false;
    } else {
      return true;
    }
  }
}

export function isEurusWallet() {
  if (checkDappBrowser()) {
    const isEurusWalletBol = getEthereum().isEurusWallet;
    if (!isEurusWalletBol) {
      return false;
    } else {
      return true;
    }
  }
}

export function getOwnerWalletAddress() {
  if (checkDappBrowser()) {
    const ownerWalletAddress = getEthereum().ownerWalletAddress;
    if (!ownerWalletAddress) {
      return "";
    } else {
      return ownerWalletAddress;
    }
  }
}

export async function addEthereumChain(isEthNetworkBol = false) {
  // alert("#### addEthereumChain start");
  let result = false;
  let rpcUrl = getSideChainNetworks().url;
  let chainId = getSideChainNetworks().chainId;
  let chainName = getSideChainNetworks().name;
  let metamaskBlockExplorerUrl = getSideChainNetworks().blockExplorerUrls;
  if (isEthNetworkBol) {
    rpcUrl = getEthereumNetworks().url;
    chainId = getEthereumNetworks().chainId;
    chainName = getEthereumNetworks().name;
    metamaskBlockExplorerUrl = getEthereumNetworks().blockExplorerUrls;
  }
  let web3 = new Web3(rpcUrl);
  let chainIdHex = web3.utils.numberToHex(chainId);
  let nativeCurrency = "EUN";

  const networkObject = {
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: chainIdHex, // A 0x-prefixed hexadecimal string
        chainName: chainName,
        nativeCurrency: {
          name: nativeCurrency,
          symbol: nativeCurrency, // 2-6 characters long
          decimals: 18,
        },
        rpcUrls: [rpcUrl],
        ...(metamaskBlockExplorerUrl && { blockExplorerUrls: [metamaskBlockExplorerUrl] }),
      },
    ],
  };
  // alert(JSON.stringify(networkObject));

  try {
    await getEthereum().request(networkObject);
    result = true;
  } catch (addError) {
    console.log("#### addEthereumChain addError:", addError);
  }
  console.log("#### addEthereumChain result:", result);
  return result;
}

export async function switchEthereumChain(isEthNetworkBol = false) {
  let result = false;
  let chainId = getSideChainNetworks().chainId;
  if (isEthNetworkBol) {
    chainId = getEthereumNetworks().chainId;
  }
  let chainIdHex = Web3.utils.numberToHex(chainId);

  console.log("#### switchEthereumChain chainId:", chainId);
  console.log("#### switchEthereumChain chainIdHex:", chainIdHex);

  try {
    let currentChainId = await getChainId();
    // alert("currentChainId");
    // alert(currentChainId);
    // alert("ChainId");
    // alert(chainId);
    if (currentChainId.toString() === chainId.toString()) {
      result = true;
    } else {
      let switchEthereumChainResult = await getEthereum().request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      // alert("switchEthereumChainResult");
      // alert(JSON.stringify(switchEthereumChainResult));
      if (switchEthereumChainResult === null) {
        // alert("currentChainId");
        // alert(currentChainId);
        // alert("ChainId");
        // alert(chainId);
        // window.location.reload();
      }
    }
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    // alert("switchError");
    // alert(JSON.stringify(switchError));
    console.log(switchError);
    if (switchError.code === 4902 || switchError.code === -32603) {
      await addEthereumChain(isEthNetworkBol);
    }
    // handle other "switch" errors
  }
  let chainId2 = await getChainId();
  if (chainId2 == chainId) {
    result = true;
  }
  console.log("#### switchEthereumChain result:", result);
  return result;
}

export async function getChainId() {
  let net_version = null;
  try {
    net_version = await getEthereum().request({ method: "eth_chainId" });
    net_version = parseInt(net_version).toString();
    console.log("net_version: ", net_version);
  } catch (error) {
    console.log("getChainId error: ", error);
  }
  return net_version;
}

export function amountDivideDecimals(amount, decimals) {
  return bigNumbverDivideDecimals(amount, decimals);
}

export async function getAssetDetails(tokenName) {
  let walletAddress = getWalletAddress();
  let poolAddresss = getPoolSmartContractAddress();
  let assetAddress = "";
  if (tokenName === "ETHM") {
    assetAddress = getEthmSmartContractAddress();
  } else if (tokenName === "BTCM") {
    assetAddress = getBtcmSmartContractAddress();
  } else if (tokenName === "USDM") {
    assetAddress = getUsdmSmartContractAddress();
  }
  let displayBalance = 0;
  let balance = 0;
  let decimals = 6;
  let currencyCode = "";
  let hourlyInterest = 0;
  let result;
  try {
    let url = getSideChainNetworks().url;
    currencyCode = "";
    let web3 = new Web3(url);
    if (assetAddress == "0x0") {
      balance = await web3.eth.getBalance(walletAddress);
      decimals = 18;
    } else {
      let erc20ContractJson = EurusERC20;
      var erc20TokenContract = new web3.eth.Contract(erc20ContractJson.abi, assetAddress);
      balance = await erc20TokenContract.methods.balanceOf(walletAddress).call();
      decimals = await erc20TokenContract.methods.decimals().call();
      currencyCode = await erc20TokenContract.methods.symbol().call();
      displayBalance = amountDivideDecimals(balance, decimals);

      let poolContractJson = Pool;
      var poolTokenContract = new web3.eth.Contract(poolContractJson.abi, poolAddresss);
      result = await poolTokenContract.methods.getTokenInfo(tokenName).call();
      hourlyInterest = result[1][0].value;
    }
  } catch (err) {
    console.error("#### getAssetDetails network, assetAddress, walletAddress, err: ", assetAddress, walletAddress, err);
  }
  return { balance: displayBalance, decimals: decimals, currencyCode: currencyCode, assetAddress: assetAddress, hourlyInterest: hourlyInterest };
}

export async function getCustomerInfo(inputWalletAddress = '') {
  let walletAddress = getWalletAddress();
  if (inputWalletAddress) {
    walletAddress = inputWalletAddress
  }
  let poolAddresss = getPoolSmartContractAddress();
  let customerInfo = "";
  try {
    if (walletAddress) {
      let url = getSideChainNetworks().url;
      let web3 = new Web3(url);
      let contractJson = Pool;
      var poolContract = new web3.eth.Contract(contractJson.abi, poolAddresss);
      customerInfo = await poolContract.methods.getCustomerInfo(walletAddress).call();
    }
  } catch (err) {
    console.error("getCustomerInfo error", err);
  }
  return customerInfo;
}

export async function getPairInfo(token0Name, token1Name) {
  let poolAddresss = getPoolSmartContractAddress();
  let pairPrice = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Pool;
    var poolContract = new web3.eth.Contract(contractJson.abi, poolAddresss);
    let pairInfo = await poolContract.methods.getPairInfo(`${token0Name}/${token1Name}`).call();
    const token0Detail = getTokenList().find((token) => token.tokenName === token0Name);
    const token0Decimals = token0Detail.decimal;
    const token1Detail = getTokenList().find((token) => token.tokenName === token1Name);
    const token1Decimals = token1Detail.decimal;

    if (token1Name === "USDM") {
      const token1Reserve = amountDivideDecimals(pairInfo["reserve1"], token1Decimals);
      const token0Reserve = amountDivideDecimals(pairInfo["reserve0"], token0Decimals);
      pairPrice = toFixed(token0Reserve / token1Reserve, 6).toString();
    } else {
      const token1Reserve = amountDivideDecimals(pairInfo["reserve1"], token0Decimals);
      const token0Reserve = amountDivideDecimals(pairInfo["reserve0"], token1Decimals);
      pairPrice = toFixed(token1Reserve / token0Reserve, token0Decimals).toString();
    }
  } catch (err) {
    console.error("getPairInfo error", err);
  }
  return pairPrice;
}

export async function getPairReserve(token0Name, token1Name) {
  let poolAddresss = getPoolSmartContractAddress();
  let token1Reserve = "";
  let token0Reserve = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Pool;
    var poolContract = new web3.eth.Contract(contractJson.abi, poolAddresss);
    let pairInfo = await poolContract.methods.getPairInfo(`${token0Name}/${token1Name}`).call();
    if (token1Name === pairInfo.token1Name) {
      token1Reserve = pairInfo["reserve1"];
      token0Reserve = pairInfo["reserve0"];
    } else {
      token1Reserve = pairInfo["reserve0"];
      token0Reserve = pairInfo["reserve1"];
    }
  } catch (err) {
    console.error("getPairInfo error", err);
  }
  return { token0: token0Reserve, token1: token1Reserve };
}

export async function getPairDetail(token0Name, token1Name) {
  let poolAddresss = getPoolSmartContractAddress();
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Pool;
    var poolContract = new web3.eth.Contract(contractJson.abi, poolAddresss);
    let pairInfo = await poolContract.methods.getPairInfo(`${token0Name}/${token1Name}`).call();
    return { token0Name: pairInfo.token0Name, token0Reserve: pairInfo.reserve0, token1Name: pairInfo.token1Name, token1Reserve: pairInfo.reserve1 };
  } catch (err) {
    console.error("getPairInfo error", err);
  }
  return;
}

export async function getTokenReserve(token0Name, token1Name) {
  let poolAddresss = getPoolSmartContractAddress();
  let token1Reserve = "";
  let token0Reserve = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Pool;
    var poolContract = new web3.eth.Contract(contractJson.abi, poolAddresss);
    let pairInfo = await poolContract.methods.getPairInfo(`${token0Name}/${token1Name}`).call();
    if (token1Name === "USDM") {
      token1Reserve = pairInfo["reserve1"];
      token0Reserve = pairInfo["reserve0"];
    } else {
      token1Reserve = pairInfo["reserve1"];
      token0Reserve = pairInfo["reserve0"];
    }
  } catch (err) {
    console.error("getPairInfo error", err);
  }
  return { token0: token0Reserve, token1: token1Reserve };
}

export function toFixed(number, maxDecimals) {
  var output = "0.00000000";
  // var power = Math.pow(10, maxDecimals);
  let outputNumber = "";
  try {
    // outputNumber = Math.floor(number * power) / power;
    outputNumber = Number(bigNumberToFixed(number, maxDecimals))
    output = outputNumber.toLocaleString("en-US", { minimumFractionDigits: maxDecimals });
  } catch (error) {
    console.error("toFixed error", error);
  }
  return output;
}

export function toFixedWithNoComma(number, maxDecimals) {
  return toFixed(number, maxDecimals).replace(/,/g, "");
}

export async function buyToken(pairName, tokenNameBuy, tokenNameSell, inputAmountBuy, inputAmountSellMax) {
  console.log("buyToken:", pairName, tokenNameBuy, tokenNameSell, inputAmountBuy, inputAmountSellMax);
  const switchResult = await switchEthereumChain();
  if (switchResult) {
    const contractAddress = getPoolSmartContractAddress();
    const walletAddress = getWalletAddress();
    const url = getSideChainNetworks().url;
    let web3 = new Web3(url);

    // const assetBuyDetail = await getAssetDetails(tokenNameBuy)
    const assetBuyDetail = getTokenList().find((token) => token.tokenName === tokenNameBuy);
    const buyDecimal = assetBuyDetail.decimal;
    let amountBuy = toFixedWithNoComma(amountMultipleDecimals(inputAmountBuy, buyDecimal), 0);

    // const assetSellDetail = await getAssetDetails(tokenNameSell)
    const assetSellDetail = getTokenList().find((token) => token.tokenName === tokenNameSell);
    const sellDecimal = assetSellDetail.decimal;
    let amountSellMax = toFixedWithNoComma(amountMultipleDecimals(inputAmountSellMax, sellDecimal), 0);

    const deadline = Math.floor(Date.now() / 1000) + 300;

    let txnData = web3.eth.abi.encodeFunctionCall(
      {
        name: "buy",
        type: "function",
        inputs: [
          { internalType: "address", name: "customer", type: "address" },
          { internalType: "string", name: "pairName", type: "string" },
          { internalType: "string", name: "tokenNameBuy", type: "string" },
          { internalType: "uint256", name: "amountBuy", type: "uint256" },
          { internalType: "uint256", name: "amountSellMax", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
      },
      [walletAddress, pairName, tokenNameBuy, web3.utils.toBN(amountBuy), web3.utils.toBN(amountSellMax), deadline]
    );

    let requestParams = {
      from: walletAddress,
      to: contractAddress,
      value: "0x00",
      // gasPrice: '0x09184e72a000',
      // gas: '0x186A0',//gas limit
      data: txnData,
    };

    try {
      requestParams.gasPrice = await getSideChainGasPriceInWei();
      // requestParams.gas = "0xAA690";
      let _estimateGas = await web3.eth.estimateGas(requestParams);
      console.log("buyToken _estimateGas:", _estimateGas);
      _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
      console.log("buyToken _estimateGas:", _estimateGas);
      _estimateGas = web3.utils.numberToHex(_estimateGas);
      requestParams.gas = _estimateGas;
    } catch (error) {
      console.log("buyToken estimateGas error:", error);
      requestParams.gas = "0xAA690";
    }

    console.log("buyToken requestParams:", requestParams);

    return getEthereum().request({
      method: "eth_sendTransaction",
      params: [requestParams],
    });
  }
  return null;
}

export async function getTransaction(txnHash, isEthNetworkBol = false) {
  console.log("getTransaction txnHash", txnHash);
  let outTxn = {};
  try {
    let url = getSideChainNetworks().url;
    if (isEthNetworkBol) {
      url = getEthereumNetworks().url;
    }
    let web3 = new Web3(url);
    let txn = await web3.eth.getTransaction(txnHash);
    let txnReceipt = await web3.eth.getTransactionReceipt(txnHash);

    console.log("getTransaction txn:", txn);
    console.log("getTransaction txnReceipt:", txnReceipt);

    if (txnReceipt == null || txnReceipt == undefined) {
      return {};
    }
    if (txnReceipt && txnReceipt.transactionHash) {
      outTxn = {
        gas_fee: amountDivideDecimals(txn.gasPrice * txnReceipt.gasUsed, 18),
        txn_id: txnReceipt.transactionHash,
        status: txnReceipt.status,
      };
      if (txnReceipt.revertReason) {
        outTxn.revertReason = web3.utils.hexToAscii(txnReceipt.revertReason);
      }
    }
  } catch (err) {
    console.error("#### getTransaction err: ", err);
  }
  return outTxn;
}

export async function sellToken(pairName, tokenNameSell, tokenNameBuy, inputAmountSell, inputAmountBuyMin) {
  const switchResult = await switchEthereumChain();
  if (switchResult) {
    const contractAddress = getPoolSmartContractAddress();
    const walletAddress = getWalletAddress();
    const url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    // const assetSellDetail = await getAssetDetails(tokenNameSell)
    const assetSellDetail = getTokenList().find((token) => token.tokenName === tokenNameSell);
    const sellDecimal = assetSellDetail.decimal;
    const amountSell = toFixedWithNoComma(amountMultipleDecimals(inputAmountSell, sellDecimal), 0);
    // const assetBuyDetail = await getAssetDetails(tokenNameBuy)
    const assetBuyDetail = getTokenList().find((token) => token.tokenName === tokenNameBuy);
    const buyDecimal = assetBuyDetail.decimal;
    let amountBuyMin = toFixedWithNoComma(amountMultipleDecimals(inputAmountBuyMin, buyDecimal), 0);

    const deadline = Math.floor(Date.now() / 1000) + 300;

    let txnData = web3.eth.abi.encodeFunctionCall(
      {
        name: "sell",
        type: "function",
        inputs: [
          { internalType: "address", name: "customer", type: "address" },
          { internalType: "string", name: "pairName", type: "string" },
          { internalType: "string", name: "tokenNameSell", type: "string" },
          { internalType: "uint256", name: "amountSell", type: "uint256" },
          { internalType: "uint256", name: "amountBuyMin", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
      },
      [walletAddress, pairName, tokenNameSell, web3.utils.toBN(amountSell), web3.utils.toBN(amountBuyMin), deadline]
    );

    let requestParams = {
      from: walletAddress,
      to: contractAddress,
      value: "0x00",
      // gasPrice: '0x09184e72a000',
      // gas: '0x186A0',//gas limit
      data: txnData,
    };

    try {
      requestParams.gasPrice = await getSideChainGasPriceInWei();
      // requestParams.gas = "0xAA690";
      let _estimateGas = await web3.eth.estimateGas(requestParams);
      console.log("sellToken _estimateGas:", _estimateGas);
      _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
      console.log("sellToken _estimateGas:", _estimateGas);
      _estimateGas = web3.utils.numberToHex(_estimateGas);
      requestParams.gas = _estimateGas;
    } catch (error) {
      console.log("sellToken estimateGas error:", error);
      requestParams.gas = "0xAA690";
    }

    console.log("sellToken requestParams:", requestParams);

    return getEthereum().request({
      method: "eth_sendTransaction",
      params: [requestParams],
    });
  }
  return null;
}

export function amountMultipleDecimals(amount, decimals) {
  return bigNumbverMultipleDecimals(amount, decimals);
}

export async function getSideChainGasPriceInWei() {
  let gasPrice = "0x8F0D1800"; //2400000000
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    gasPrice = await web3.eth.getGasPrice();
    gasPrice = web3.utils.numberToHex(gasPrice.toString());
  } catch (err) {
    gasPrice = "0x8F0D1800";
    console.error("#### getGasPrice err: ", err);
  }
  return gasPrice;
}

export async function getTokenBalance(tokenName) {
  const walletAddress = getWalletAddress();
  let poolAddresss = getPoolSmartContractAddress();
  let realizedBalance = 0;
  let usdmEquivalent = 0;
  let decimals = 0;
  let interest = 0;
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Pool;
    var poolContract = new web3.eth.Contract(contractJson.abi, poolAddresss);
    const customerInfo = await poolContract.methods.getCustomerInfo(walletAddress).call();
    // const assetDetail = await getAssetDetails(tokenName)
    const assetDetail = getTokenList().find((token) => token.tokenName === tokenName);
    decimals = assetDetail.decimal;
    for (let item of customerInfo[0]) {
      if (item["tokenName"] === tokenName) {
        interest = amountDivideDecimals(item["interest"], decimals);
        realizedBalance = amountDivideDecimals(item["realizedBalance"], decimals);
        usdmEquivalent = amountDivideDecimals(item["usdmEquivalent"], 6);
      }
    }
  } catch (err) {
    console.error("getCustomerInfo error", err);
  }
  return { tokenName: tokenName, realizedBalance: realizedBalance, usdmEquivalent: usdmEquivalent, interest: interest };
}

export async function depositToPool(tokeName, amount) {
  const switchResult = await switchEthereumChain();
  try {
    if (switchResult) {
      let url = getSideChainNetworks().url;
      let web3 = new Web3(url);
      const walletAddress = getWalletAddress();
      let poolAddresss = getPoolSmartContractAddress();
      const assetDetail = await getAssetDetails(tokeName);
      const assetAddress = assetDetail.assetAddress;
      const decimals = assetDetail.decimals;
      let amountData = toFixedWithNoComma(amountMultipleDecimals(amount, decimals), 0);

      console.log("assetAddress", assetAddress);

      let txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "transfer",
          type: "function",
          inputs: [
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
        },
        [poolAddresss, web3.utils.toBN(amountData)]
      );

      let requestParams = {
        from: walletAddress,
        to: assetAddress,
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getSideChainGasPriceInWei();
        // requestParams.gas = "0xAA690";
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("depositToPool _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("depositToPool _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("depositToPool estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      console.log("requestParams", requestParams);

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (err) {
    console.error(" withdrawFromPool error", err);
  }
}

export async function withdrawFromPool(tokenName, amount) {
  const switchResult = await switchEthereumChain();

  try {
    if (switchResult) {
      const url = getSideChainNetworks().url;
      const contractAddress = getPoolSmartContractAddress();
      const walletAddress = getWalletAddress();

      let web3 = new Web3(url);
      const assetDetail = getTokenList().find((token) => token.tokenName === tokenName);
      const decimal = assetDetail.decimal;
      let amountData = toFixedWithNoComma(amountMultipleDecimals(amount, decimal), 0);

      let txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "withdraw",
          type: "function",
          inputs: [
            { internalType: "string", name: "tokenName", type: "string" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
        },
        [tokenName, web3.utils.toBN(amountData)]
      );

      let requestParams = {
        from: walletAddress,
        to: contractAddress,
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getSideChainGasPriceInWei();
        // requestParams.gas = "0xAA690";
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("withdrawFromPool _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("withdrawFromPool _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("withdrawFromPool estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (err) {
    console.error(" withdrawFromPool error", err);
  }
}

export async function withdrawUsdcFromPool(amount) {
  const switchResult = await switchEthereumChain();

  try {
    if (switchResult) {
      const url = getSideChainNetworks().url;
      const contractAddress = getPoolSmartContractAddress();
      const walletAddress = getWalletAddress();

      let web3 = new Web3(url);
      const assetDetail = getTokenList().find((token) => token.tokenName === 'USDM');
      const decimal = assetDetail.decimal;
      let amountData = toFixedWithNoComma(amountMultipleDecimals(amount, decimal), 0);

      const withdrawUsdcExchangeRate = await getWithdrawUsdcExchangeRate()
      console.log("withdrawUsdcFromPool withdrawUsdcExchangeRate:", withdrawUsdcExchangeRate);
      const withdrawUsdcAmountOut = await getWithdrawUsdcAmountOut(amountData)
      // console.log("withdrawUsdcFromPool withdrawUsdcAmountOut:", withdrawUsdcAmountOut);
      let txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "withdrawAndExchange",
          type: "function",
          "inputs": [
            { "internalType": "string", "name": "tokenName", "type": "string" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "internalType": "contract IFixedRateExchange", "name": "exchange", "type": "address" },
            { "internalType": "address", "name": "provider", "type": "address" },
            { "internalType": "contract IERC20", "name": "toToken", "type": "address" },
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" }
          ],
        },
        [
          'USDM',
          web3.utils.toBN(amountData),
          getEurusFixedRateExchangeContractAddress(),
          getEurusFixedRateExchangeProviderAddress(),
          getEurusUsdcContractAddress(),
          web3.utils.toBN(withdrawUsdcAmountOut)
        ]
      );

      // console.log("withdrawUsdcFromPool amount:", amount);
      // console.log("withdrawUsdcFromPool amountData:", amountData);
      // console.log("withdrawUsdcFromPool txnData 0:", [
      //   'USDM', 
      //   web3.utils.toBN(amountData), 
      //   getEurusFixedRateExchangeContractAddress(), 
      //   getEurusFixedRateExchangeProviderAddress(), 
      //   getEurusUsdcContractAddress(),
      //   web3.utils.toBN(withdrawUsdcAmountOut)
      // ]);
      // console.log("withdrawUsdcFromPool txnData 1:", txnData);

      let requestParams = {
        from: walletAddress,
        to: contractAddress,
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getSideChainGasPriceInWei();
        // requestParams.gas = "0xAA690";
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("withdrawUsdcFromPool _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("withdrawUsdcFromPool _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("withdrawUsdcFromPool estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (err) {
    console.error(" withdrawUsdcFromPool error", err);
  }
}

export async function getWithdrawUsdcExchangeRate() {
  let contractAddresss = getEurusFixedRateExchangeContractAddress();
  let result = false;
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = FixedRateExchange;
    var poolContract = new web3.eth.Contract(contractJson.abi, contractAddresss);
    result = await poolContract.methods.getRate(
      getEurusFixedRateExchangeProviderAddress(),
      getUsdmSmartContractAddress(),
      getEurusUsdcContractAddress()
    ).call();
  } catch (err) {
    console.error("getWithdrawUsdcExchangeRate error", err);
  }
  return result;
}

export async function getWithdrawUsdcAmountOut(amountIn) {
  let contractAddresss = getEurusFixedRateExchangeContractAddress();
  let result = false;
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = FixedRateExchange;
    var poolContract = new web3.eth.Contract(contractJson.abi, contractAddresss);
    result = await poolContract.methods.getAmountOut(
      getEurusFixedRateExchangeProviderAddress(),
      getUsdmSmartContractAddress(),
      getEurusUsdcContractAddress(),
      amountIn
    ).call();
  } catch (err) {
    console.error("getWithdrawUsdcAmountOut error", err);
  }
  return result;
}

export function floorPrecised(num, decimal = 6) {
  // let number = toFixedWithNoComma(num, decimal);
  // var power = Math.pow(10, decimal);
  // const outPutValue = toFixed(Math.floor(number * power) / power, decimal);

  const outPutValue = toFixed(num, decimal);
  if (outPutValue === "0" && decimal === 6) {
    return "0.000000";
  } else {
    return outPutValue;
  }
}

export function numberToFormattedString(number, maxDecimals) {
  var output = "0";
  try {
    output = number.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
    if (output === "0") {
      output = "0";
    }
  } catch (error) {
    // numberToFormattedString error
  }
  return output;
}

export function numberToFormattedStringWithNoComma(number, maxDecimals) {
  return numberToFormattedString(number, maxDecimals).replaceAll(",", "");
}

export function deleteScientific(x) {
  return numberToFormattedStringWithNoComma(Number(x), 0);
}

export function deleteScientificForTruncateNum(x) {
  if (x === 0) {
    return "0";
  }
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split("e-")[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = "0." + new Array(e).join("0") + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split("+")[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join("0");
    }
  }
  if (!x) {
    return "0";
  }
  return x;
}

export async function signTxnData(walletAddress, msgParams) {
  let result = "";

  console.log("walletAddress", walletAddress);
  try {
    console.log("msgParams", msgParams);
    console.log(getEthereum());
    result = await getEthereum().request({
      method: "eth_signTypedData_v4",
      params: [walletAddress, JSON.stringify(msgParams)],
    });
    console.log("result", result);
  } catch (err) {
    console.error("signTxnData err:", err);
  }
  return result;
}

export async function personalSign(walletAddress, message) {
  let signature = "";
  try {
    // console.log("walletAddress", walletAddress);
    // console.log("message", message);
    const ethResult = await getEthereum().request({
      method: "personal_sign",
      params: [walletAddress, message],
    });

    console.log("ethResult", ethResult);
    signature = ethResult;
  } catch (err) {
    console.error("#### sign err: ", err);
  }
  return signature;
}

export async function customerLogin(inputWalletAddress, fundingCodeValue, ownerWalletAddress) {
  let url = process.env.REACT_APP_DECATS_DAPP_API + "/customers/login";
  const ts = Date.now();
  const deviceId = "";
  const walletAddress = inputWalletAddress.toLowerCase();
  let message = "";
  let signature = "";
  let body = {};

  if (ownerWalletAddress) {
    message = "deviceId=" + deviceId + "&timestamp=" + ts + "&walletAddress=" + ownerWalletAddress.toLowerCase().substring(2);
    signature = await personalSign(walletAddress, message);
    body = {
      signature: signature,
      message: message,
      address: ownerWalletAddress.toLowerCase(),
      centralizedWalletAddress: walletAddress,
      ...(fundingCodeValue && { fundingCode: fundingCodeValue }),
    };
  } else {
    message = "deviceId=" + deviceId + "&timestamp=" + ts + "&walletAddress=" + walletAddress.substring(2);
    signature = await personalSign(walletAddress, message);
    console.log("  signature ", signature);
    body = {
      signature: signature,
      message: message,
      address: walletAddress,
      ...(fundingCodeValue && { fundingCode: fundingCodeValue }),
    };
  }

  const headers = {
    "Content-Type": "application/json",
  };
  return axios.post(url, body, { headers: headers });
}

export function tokenFormater(tokenName) {
  if (tokenName === "BTCM") {
    return "BTC";
  }
  if (tokenName === "ETHM") {
    return "ETH";
  }
  if (tokenName === "USDM") {
    return "USD";
  } else {
    return tokenName;
  }
}

export async function checkIsClaimed(roundId, agentAddress) {
  let payoutContractAddresss = getPayoutContractAddress();
  let result = false;
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Payout;
    var poolContract = new web3.eth.Contract(contractJson.abi, payoutContractAddresss);
    result = await poolContract.methods.isClaimed(roundId, agentAddress).call();
  } catch (err) {
    console.error("getCustomerInfo error", err);
  }
  return result;
}

export async function claimDistribution(roundId, tokenList, amountList) {
  const switchResult = await switchEthereumChain();
  if (switchResult) {
    try {
      const url = getSideChainNetworks().url;
      const chainId = getSideChainNetworks().chainId;
      const net_version = await getChainId();
      if (net_version !== chainId) {
        throw Error(9991);
      }
      const web3 = new Web3(url);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];

      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "claim",
          type: "function",
          inputs: [
            { internalType: "uint256", name: "roundID", type: "uint256" },
            { internalType: "address[]", name: "tokenList", type: "address[]" },
            { internalType: "uint256[]", name: "amountList", type: "uint256[]" },
          ],
        },
        [roundId, tokenList, amountList]
      );

      let requestParams = {
        from: walletAddress,
        to: getPayoutContractAddress(),
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getSideChainGasPriceInWei();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("claimDistribution _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("claimDistribution _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("claimDistribution estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    } catch (error) {
      console.log("claimDistribution error: ", error);
    }
  }
  return null;
}

export async function getUserStake(targetContractAddress, tokenAddress, contractJson) {
  const walletAddress = getWalletAddress();
  let userStake = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    var contract = new web3.eth.Contract(contractJson.abi, targetContractAddress);
    userStake = await contract.methods.getUserStaked(tokenAddress, walletAddress).call();
  } catch (err) {
    console.error("getUserStake error", err);
  }
  return userStake;
}

export async function getUserFreeStaking(targetContractAddress, tokenAddress, contractJson) {
  const walletAddress = getWalletAddress();
  let userStake = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    var contract = new web3.eth.Contract(contractJson.abi, targetContractAddress);
    userStake = await contract.methods.getUserFreeStaking(tokenAddress, walletAddress).call();
  } catch (err) {
    console.error("getUserStake error", err);
  }
  return userStake;
}

export async function getUserStakingDetails(targetContractAddress, tokenAddress, contractJson) {
  console.log("targetContractAddress", targetContractAddress);
  const walletAddress = getWalletAddress();
  let userStake = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    var contract = new web3.eth.Contract(contractJson.abi, targetContractAddress);
    userStake = await contract.methods.getUserStakingDetails(tokenAddress, walletAddress).call();
  } catch (err) {
    console.error("getUserStakingDetails error", err);
  }
  return userStake;
}

export async function getUserLockedStaking(targetContractAddress, tokenAddress, contractJson) {
  const walletAddress = getWalletAddress();
  let userStake = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    var contract = new web3.eth.Contract(contractJson.abi, targetContractAddress);
    userStake = await contract.methods.getUserLockedStaking(tokenAddress, walletAddress).call();
  } catch (err) {
    console.error("getUserLockedStaking error", err);
  }
  return userStake;
}

export async function getUserStaking(targetContractAddress, tokenAddress, contractJson) {
  const walletAddress = getWalletAddress();
  let userStake = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    var contract = new web3.eth.Contract(contractJson.abi, targetContractAddress);
    userStake = await contract.methods.getUserStaking(tokenAddress, walletAddress).call();
  } catch (err) {
    console.error("getUserLockedStaking error", err);
  }
  return userStake;
}

export async function getUserStakeForLiquidityMining(targetContractAddress, tokenAddress, contractJson) {
  const walletAddress = getWalletAddress();
  let userStake = "";
  try {
    let url = getEthereumNetworks()().url;
    let web3 = new Web3(url);
    var contract = new web3.eth.Contract(contractJson.abi, targetContractAddress);
    userStake = await contract.methods.getUserStaked(tokenAddress, walletAddress).call();
  } catch (err) {
    console.error(" getUserStakeForLiquidityMining error", err);
  }
  return userStake;
}

export async function getUserRedemptionDetails() {
  const walletAddress = getWalletAddress();
  const stakeAddresss = getStakingContractAddress();
  const tokenAddress = getMstSmartContractAddress();
  let redemptionDetails = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Staking;
    var stakeContract = new web3.eth.Contract(contractJson.abi, stakeAddresss);
    redemptionDetails = await stakeContract.methods.getUserRedemptionDetails(tokenAddress, walletAddress).call();
  } catch (err) {
    console.error("getUserRedemptionDetails error", err);
  }
  return redemptionDetails;
}

export async function getRedeemWaitPeriod() {
  const stakeAddresss = getStakingContractAddress();
  let waitPeriod = "";
  try {
    let url = getSideChainNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Staking;
    var stakeContract = new web3.eth.Contract(contractJson.abi, stakeAddresss);
    waitPeriod = await stakeContract.methods.getRedeemWaitPeriod().call();
  } catch (err) {
    console.error("getRedeemWaitPeriod error", err);
  }
  return waitPeriod;
}

export async function checkApprovedAmountForLiquidityMining(tokenName) {
  let walletAddress = getWalletAddress();
  let customerInfo = "";
  let approvedAmount = 0;
  try {
    if (walletAddress) {
      let url = getEthereumNetworks().url;
      let web3 = new Web3(url);
      let erc20ContractJson = EurusERC20;
      var erc20TokenContract = new web3.eth.Contract(erc20ContractJson.abi, getERC20Token()[tokenName]);
      approvedAmount = await erc20TokenContract.methods.allowance(walletAddress, getMiningPoolTokenContract()[tokenName]).call();
      return approvedAmount;
    }
  } catch (err) {
    console.error("getCustomerInfo error", err);
  }
  return customerInfo;
}

export async function approveAllowance(tokenName, stakeAmount) {
  try {
    const switchResult = await switchEthereumChain(true);
    if (switchResult) {
      const url = getEthereumNetworks().url;
      const decimal = getTokenList().find((token) => token.tokenName === tokenName).decimal;
      let stakeAmountData = toFixedWithNoComma(amountMultipleDecimals(stakeAmount, decimal), 0);
      const web3 = new Web3(url);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "approve",
          type: "function",
          inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
        },
        [getMiningPoolTokenContract()[tokenName], stakeAmountData]
      );

      let requestParams = {
        from: walletAddress,
        to: getERC20Token()[tokenName],
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getEthEstimateGasPrice();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("approveAllowance _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("approveAllowance _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("approveAllowance estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      console.log(requestParams);
      // console.log(getEthereum().request({
      //     method: 'eth_sendTransaction',
      //     params: [requestParams]
      //   }))

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("approveAllowance error: ", error);
  }
  return null;
}

export async function redeemRequest(tokenName, redeemAmount) {
  try {
    const switchResult = await switchEthereumChain();
    if (switchResult) {
      const url = getSideChainNetworks().url;
      const chainId = getSideChainNetworks().chainId;
      const web3 = new Web3(url);
      const net_version = await getChainId();
      if (net_version !== chainId) {
        throw Error(9991);
      }
      const decimal = getTokenList().find((token) => token.tokenName === tokenName).decimal;
      let redeemAmountData = toFixedWithNoComma(amountMultipleDecimals(redeemAmount, decimal), 0);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      const tokenAddress = getMappedSwapToken()[tokenName];

      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "requestRedemption",
          type: "function",
          inputs: [
            { internalType: "contract IERC20", name: "tokenAddr", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
        },
        [tokenAddress, redeemAmountData]
      );

      let requestParams = {
        from: walletAddress,
        to: getStakingContractAddress(),
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getSideChainGasPriceInWei();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("redeemRequest _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("redeemRequest _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("redeemRequest estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("redeemRequest error", error);
  }
  return null;
}

export async function redeemUnlock(tokenName) {
  try {
    const switchResult = await switchEthereumChain();
    if (switchResult) {
      const url = getSideChainNetworks().url;
      const chainId = getSideChainNetworks().chainId;
      const web3 = new Web3(url);
      const net_version = await getChainId();
      if (net_version !== chainId) {
        throw Error(9991);
      }
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      const tokenAddress = getMappedSwapToken()[tokenName];

      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "redeemToken",
          type: "function",
          inputs: [{ internalType: "contract IERC20", name: "tokenAddr", type: "address" }],
        },
        [tokenAddress]
      );

      let requestParams = {
        from: walletAddress,
        to: getStakingContractAddress(),
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getSideChainGasPriceInWei();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("redeemUnlock _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("redeemUnlock _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("redeemUnlock estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      // console.log(getEthereum().request({
      //     method: 'eth_sendTransaction',
      //     params: [requestParams]
      //   }))

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("redeemUnlock error: ", error);
  }
  return null;
}

export async function transferToken(tokenName, stakeAmount, targetContractAddress) {
  try {
    const switchResult = await switchEthereumChain();
    if (switchResult) {
      const url = getSideChainNetworks().url;
      const chainId = getSideChainNetworks().chainId;
      const web3 = new Web3(url);
      const net_version = await getChainId();
      if (net_version !== chainId) {
        throw Error(9991);
      }
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const decimal = getTokenList().find((token) => token.tokenName === tokenName).decimal;
      let stakeAmountData = toFixedWithNoComma(amountMultipleDecimals(stakeAmount, decimal), 0);
      const walletAddress = accounts[0];

      // alert('url', url)
      // alert('chainId', chainId)
      // alert('net_version', net_version)

      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "transfer",
          type: "function",
          inputs: [
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
        },
        [targetContractAddress, web3.utils.toBN(stakeAmountData)]
      );

      let requestParams = {
        from: walletAddress,
        to: getMappedSwapToken()[tokenName],
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };
      try {
        requestParams.gasPrice = await getSideChainGasPriceInWei();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("transferToke _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("transferToke _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("transferToke estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      // console.log(getEthereum().request({
      //     method: 'eth_sendTransaction',
      //     params: [requestParams]
      //   }))

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("transferToke error: ", error);
  }
  return null;
}

export async function getTotalAnnualRewards(miningPoolAddress) {
  let annualReward = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningPoolAddress);
    annualReward = await miningContract.methods.getTotalAnnualRewards().call();
  } catch (err) {
    console.error("getTotalAnnualRewards  error", err);
  }
  return annualReward;
}

export async function getFixedPoolCapacityUSD(miningPoolAddress) {
  let poolCapacity = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningPoolAddress);
    poolCapacity = await miningContract.methods.getFixedPoolCapacityUSD().call();
  } catch (err) {
    console.error("getFixedPoolCapacityUSD error", err);
  }
  return poolCapacity;
}

export async function getFixedPoolUsageUSD(miningPoolAddress) {
  let poolUsage = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningPoolAddress);
    poolUsage = await miningContract.methods.getFixedPoolUsageUSD().call();
  } catch (err) {
    console.error("getFixedPoolUsageUSD error", err);
  }
  return poolUsage;
}

export async function getLockPeriod(miningPoolAddress) {
  let lockPeriod = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningPoolAddress);
    lockPeriod = await miningContract.methods.getLockPeriod().call();
  } catch (err) {
    console.error("getLockPeriod error", err);
  }
  return lockPeriod;
}

export async function getPoolStake(miningPoolAddress) {
  let poolStake = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningPoolAddress);
    poolStake = await miningContract.methods.getPoolStake().call();
  } catch (err) {
    console.error("getPoolStake error", err);
  }
  return poolStake;
}

export async function getMiningUserStake(miningPoolAddress, contractJson) {
  const walletAddress = getWalletAddress();
  let userStake = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    var contract = new web3.eth.Contract(contractJson.abi, miningPoolAddress);
    userStake = await contract.methods.getUserStake(walletAddress).call();
  } catch (err) {
    console.error("getMiningUserStake error", err);
  }
  return userStake;
}

export async function getUserStakeUnlocked(miningPoolAddress) {
  const walletAddress = getWalletAddress();
  let userStakeUnlocked = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningPoolAddress);
    userStakeUnlocked = await miningContract.methods.getUserStakeUnlocked(walletAddress).call();
  } catch (err) {
    console.error(" getUserStakeUnlockede error", err);
  }
  return userStakeUnlocked;
}

export async function getUserStakeRewards(miningPoolAddress) {
  const walletAddress = getWalletAddress();
  let userStakeReward = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningPoolAddress);
    userStakeReward = await miningContract.methods.getUserStakeRewards(walletAddress).call();
  } catch (err) {
    console.error(" getUserStakeRewards error", err);
  }
  return userStakeReward;
}

export async function stakeToken(tokenName, stakeAmount) {
  try {
    const switchResult = await switchEthereumChain(true);
    if (switchResult) {
      const url = getEthereumNetworks().url;
      const decimal = getTokenList().find((token) => token.tokenName === tokenName).decimal;
      let stakeAmountData = toFixedWithNoComma(amountMultipleDecimals(stakeAmount, decimal), 0);
      const web3 = new Web3(url);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];

      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "stakeToken",
          type: "function",
          inputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
        },
        [stakeAmountData]
      );

      let requestParams = {
        from: walletAddress,
        to: getMiningPoolTokenContract()[tokenName],
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getEthEstimateGasPrice();
        console.log("requestParams", requestParams);
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("stakeToken _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("stakeToken _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("stakeToken estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("stakeToken error: ", error);
  }

  return null;
}

export async function redeemRequestForMining(tokenName, redeemAmount) {
  try {
    const switchResult = await switchEthereumChain(true);
    if (switchResult) {
      const url = getEthereumNetworks().url;
      const decimal = getTokenList().find((token) => token.tokenName === tokenName).decimal;
      let redeemAmountData = toFixedWithNoComma(amountMultipleDecimals(redeemAmount, decimal), 0);
      const web3 = new Web3(url);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];

      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "requestRedemption",
          type: "function",
          inputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
        },
        [redeemAmountData]
      );

      let requestParams = {
        from: walletAddress,
        to: getMiningPoolTokenContract()[tokenName],
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getEthEstimateGasPrice();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("redeemRequestForMining _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("redeemRequestForMining _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("redeemRequestForMining estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("redeemRequestForMining error", error);
  }

  return null;
}

export async function getUserRedemptionDetailsForLiquidityMining(tokenName) {
  const walletAddress = getWalletAddress();
  const miningAddress = getMiningPoolTokenContract()[tokenName];
  let redemptionDetails = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningAddress);
    redemptionDetails = await miningContract.methods.getUserRedemptionDetails(walletAddress).call();
  } catch (err) {
    console.error("getUserRedemptionDetailsForMining error", err);
  }
  return redemptionDetails;
}

export async function getUserStakeRewardDetailsForLiquidityMining(tokenName) {
  const walletAddress = getWalletAddress();
  const miningAddress = getMiningPoolTokenContract()[tokenName];
  let rewardDetails = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningAddress);
    rewardDetails = await miningContract.methods.getUserStakeRewardsDetails(walletAddress).call();
  } catch (err) {
    console.error("getUserRewardDetailsForLiquidityMiningerror", err);
  }
  return rewardDetails;
}

export async function getUserStakeDetailsForLiquidityMining(tokenName) {
  const walletAddress = getWalletAddress();
  const miningAddress = getMiningPoolTokenContract()[tokenName];
  let rewardDetails = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningAddress);
    rewardDetails = await miningContract.methods.getUserStakeDetails(walletAddress).call();
  } catch (err) {
    console.error("getUserRewardDetailsForLiquidityMiningerror", err);
  }
  return rewardDetails;
}

export async function getRedeemWaitPeriodForLiquidityMining(tokenName) {
  const miningAddress = getMiningPoolTokenContract()[tokenName];
  let rewardDetails = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningAddress);
    rewardDetails = await miningContract.methods.getRedeemWaitPeriod().call();
  } catch (err) {
    console.error(" getRedeemWaitPeriodForLiquidityMining", err);
  }
  return rewardDetails;
}

export async function getRewardWaitPeriodForLiquidityMining(tokenName) {
  const miningAddress = getMiningPoolTokenContract()[tokenName];
  let rewardDetails = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningAddress);
    rewardDetails = await miningContract.methods.getRedeemWaitPeriod().call();
  } catch (err) {
    console.error("  getRewardWaitPeriodForLiquidityMinin", err);
  }
  return rewardDetails;
}

export async function getLockPeriodForLiquidityMining(tokenName) {
  const miningAddress = getMiningPoolTokenContract()[tokenName];
  let rewardDetails = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningAddress);
    rewardDetails = await miningContract.methods.getLockPeriod().call();
  } catch (err) {
    console.error(" getLockPeriodForLiquidityMining", err);
  }
  return rewardDetails;
}

export async function getRewardPeriodForLiquidityMining(tokenName) {
  const miningAddress = getMiningPoolTokenContract()[tokenName];
  let rewardDetails = "";
  try {
    let url = getEthereumNetworks().url;
    let web3 = new Web3(url);
    let contractJson = Mining;
    var miningContract = new web3.eth.Contract(contractJson.abi, miningAddress);
    rewardDetails = await miningContract.methods.getRewardPeriod().call();
  } catch (err) {
    console.error(" getRewardPeriodForLiquidityMining", err);
  }
  return rewardDetails;
}

export async function redeemUnlockForMining(tokenName) {
  try {
    const switchResult = await switchEthereumChain(true);
    if (switchResult) {
      const url = getEthereumNetworks().url;
      const web3 = new Web3(url);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      const miningAddress = getMiningPoolTokenContract()[tokenName];

      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "redeemToken",
          type: "function",
          inputs: [],
        },
        []
      );

      let requestParams = {
        from: walletAddress,
        to: miningAddress,
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getEthEstimateGasPrice();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("redeemUnlockForMining _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("redeemUnlockForMining _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("redeemUnlockForMining estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("redeemUnlockForMining error", error);
  }

  return null;
}

export async function redeemRewardForMining(tokenName) {
  try {
    const switchResult = await switchEthereumChain(true);
    if (switchResult) {
      const url = getEthereumNetworks().url;
      const web3 = new Web3(url);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      const miningAddress = getMiningPoolTokenContract()[tokenName];

      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "claimStakeRewards",
          type: "function",
          inputs: [],
        },
        []
      );

      let requestParams = {
        from: walletAddress,
        to: miningAddress,
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getEthEstimateGasPrice();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("redeemRewardForMining _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("redeemRewardForMining _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("redeemRewardForMining estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      // console.log(getEthereum().request({
      //     method: 'eth_sendTransaction',
      //     params: [requestParams]
      //   }))

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log(" redeemRewardForMining error", error);
  }

  return null;
}

export async function checkIsEthereumNetworks() {
  try {
    const url = getEthereumNetworks().url;
    const chainId = getEthereumNetworks().chainId;
    const web3 = new Web3(url);
    const net_version = await getChainId();
    if (net_version !== chainId) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log(" checkIsEthereumNetworks err", error);
  }
}

export async function checkIssideChainNetworks() {
  try {
    const url = getSideChainNetworks().url;
    const chainId = getSideChainNetworks().chainId;
    const web3 = new Web3(url);
    const net_version = await getChainId();
    if (net_version !== chainId) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log(" checkIssideChainNetworks()error", error);
  }
}

export async function stakeETH(tokenName, stakeAmount) {
  try {
    const switchResult = await switchEthereumChain(true);
    if (switchResult) {
      const url = getEthereumNetworks().url;
      const decimal = getTokenList().find((token) => token.tokenName === tokenName).decimal;
      let stakeAmountData = toFixedWithNoComma(amountMultipleDecimals(stakeAmount, decimal), 0);
      const web3 = new Web3(url);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];

      const txnData = web3.eth.abi.encodeFunctionCall({ inputs: [], name: "stakeETH", outputs: [], stateMutability: "payable", type: "function" }, []);

      let requestParams = {
        from: walletAddress,
        to: getMiningPoolTokenContract()[tokenName],
        value: web3.utils.numberToHex(stakeAmountData),
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getEthEstimateGasPrice();
        console.log("requestParams", requestParams);
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("stakeETH _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("stakeETH _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("stakeETH estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }
      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("stakeETH error: ", error);
  }

  return null;
}

export async function redeemUnlockForMiningForETH(tokenName) {
  try {
    const switchResult = await switchEthereumChain(true);
    if (switchResult) {
      const url = getEthereumNetworks().url;
      const web3 = new Web3(url);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      const miningAddress = getMiningPoolTokenContract()[tokenName];

      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          name: "redeemETH",
          type: "function",
          inputs: [],
        },
        []
      );

      let requestParams = {
        from: walletAddress,
        to: miningAddress,
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getEthEstimateGasPrice();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("redeemUnlockForMiningForETH _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("redeemUnlockForMiningForETH _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("redeemUnlockForMiningForETH estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("redeemUnlockForMiningForETH error", error);
  }

  return null;
}

export async function mappedswapPoolDeposit(tokenName, receiver, amount) {
  const tokenAddress = getMappedSwapToken()[tokenName];
  const decimal = getTokenList().find((token) => token.tokenName === tokenName).decimal;
  let amountData = toFixedWithNoComma(amountMultipleDecimals(amount, decimal), 0);
  const switchResult = await switchEthereumChain();

  try {
    if (switchResult) {
      const url = getSideChainNetworks().url;
      const chainId = getSideChainNetworks().chainId;
      const net_version = await getChainId();

      if (net_version !== chainId) {
        throw Error(9991);
      }
      const web3 = new Web3(url);
      const accounts = await getEthereum().request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      const txnData = web3.eth.abi.encodeFunctionCall(
        {
          inputs: [
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "bytes", name: "data", type: "bytes" },
          ],
          name: "transfer",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        [getPoolSmartContractAddress(), amountData, web3.utils.padLeft(receiver, 64)]
      );

      let requestParams = {
        from: walletAddress,
        to: tokenAddress,
        value: "0x00",
        // gasPrice: '0x09184e72a000',
        // gas: '0x186A0',//gas limit
        data: txnData,
      };

      try {
        requestParams.gasPrice = await getSideChainGasPriceInWei();
        let _estimateGas = await web3.eth.estimateGas(requestParams);
        console.log("mappedswapPoolDeposit _estimateGas:", _estimateGas);
        _estimateGas = bigNumberToFixed(bigNumberTimes(_estimateGas, ESTIMATE_GAS_BUFFER), 0);
        console.log("mappedswapPoolDeposit _estimateGas:", _estimateGas);
        _estimateGas = web3.utils.numberToHex(_estimateGas);
        requestParams.gas = _estimateGas;
      } catch (error) {
        console.log("mappedswapPoolDeposit estimateGas error:", error);
        requestParams.gas = "0xAA690";
      }

      console.log("mappedswapPoolDeposit requestParams:", requestParams);

      return getEthereum().request({
        method: "eth_sendTransaction",
        params: [requestParams],
      });
    }
  } catch (error) {
    console.log("mappedswapPoolDeposit error: ", error);
  }

  return null;
}

export async function ethereumRequest(requestObj) {
  let ethereumResponse = null;
  try {
    ethereumResponse = await getEthereum().request(requestObj);
  } catch (error) {
    console.log("ethereumRequest error:", error);
    console.log("ethereumRequest error requestObj:", requestObj);
  }
  return ethereumResponse;
}

export async function importTokensToMetamask() {
  let ethereumResponse = null;
  try {
    ethereumResponse = getEthereum().request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: getMappedSwapToken()["USDM"],
          symbol: "USDM",
          decimals: 6,
          // image: 'https://foo.io/token-image.svg',
        },
      },
    });
    ethereumResponse = getEthereum().request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: getMappedSwapToken()["ETHM"],
          symbol: "ETHM",
          decimals: 18,
          // image: 'https://foo.io/token-image.svg',
        },
      },
    });
    ethereumResponse = getEthereum().request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: getMappedSwapToken()["BTCM"],
          symbol: "BTCM",
          decimals: 18,
          // image: 'https://foo.io/token-image.svg',
        },
      },
    });
  } catch (error) {
    console.log("importTokensToMetamask error:", error);
  }
  return ethereumResponse;
}

export async function getEthEstimateGasPrice() {
  let price = 200000000000;
  try {
    let url = 'https://ethgasstation.info/api/ethgasAPI.json?';
    let resp = await axios.get(url, { timeout: 3000 })
    if (resp && resp.status === 200 && resp.data && resp.data.fast) {
      price = resp.data.fast * 100000000;
    }
    console.log('#### getEthEstimateGasPrice price: ', price);
  } catch (err) {
    console.error('#### getEthEstimateGasPrice err: ', err);
  }
  return price;
}
