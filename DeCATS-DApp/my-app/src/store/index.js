import icon_usdm from "../asset/icon_usdm.svg";
import icon_ethm from "../asset/icon_ethm.svg";
import icon_btcm from "../asset/icon_btcm.svg";
import icon_mst from "../asset/icon_mst.svg";
import icon_ethmPair from "../asset/icon_ethmPair.svg";
import icon_btcmPair from "../asset/icon_btcmPair.svg";
import icon_eurus_wallet from "../asset/icon_eurus_wallet.svg";
import icon_network_eth from "../asset/icon_network_eth.svg";
import icon_wbtc from "../asset/icon_wbtc.svg";
import icon_weth from "../asset/icon_weth.svg";
import icon_usdc from "../asset/icon_usdc.svg";
import icon_usdt from "../asset/icon_usdt.svg";
import {isTokenValid} from "../utils";
import { getAnalytics, logEvent } from "firebase/analytics";
import { checkDappBrowser, customerLogin, getAccount, getCustomerInfo } from "../web3";
import jwt_decode from "jwt-decode";
import notify from "../component/Toast";
import { connectWallet } from "../api";
import axios from "axios";


const USERNAME_KEY = "eurus_merchant_demo_username";
const WALLET_ADDRESS_KEY = "metamask_wallet_address";
const OWNER_WALLET_ADDRESS_KEY = "owner_wallet_address";
const AGENT_TOKEN = "agent_token";
const LANG = "i18nextLng";
const USER_STATUS = "user_status";
const IS_MOBILE_KEY = "isMobile";
const IS_AGENT_KEY = "isAgent";
const POPUP_FARM_TOKEN = "popup_farm_token";
const LOGIN_TOKEN_LIST = "loginTokenList";

const tokenList = [
  {tokenName: "BTCM", tokenIcon: icon_btcm, pairIcon: icon_btcmPair, decimal: 18},
  {tokenName: "ETHM", tokenIcon: icon_ethm, pairIcon: icon_ethmPair, decimal: 18},
  {tokenName: "USDM", tokenIcon: icon_usdm, decimal: 6},
  {tokenName: "MST", tokenIcon: icon_mst, decimal: 18},
  {tokenName: "BTC", tokenIcon: icon_wbtc, pairIcon: icon_btcmPair, decimal: 8},
  {tokenName: "ETH", tokenIcon: icon_weth, pairIcon: icon_ethmPair, decimal: 18},
  {tokenName: "USD", tokenIcon: icon_usdc, decimal: 6},
  {tokenName: "wBTC", tokenIcon: icon_wbtc, pairIcon: icon_btcmPair, decimal: 8},
  {tokenName: "USDC", tokenIcon: icon_usdc, decimal: 6},
  {tokenName: "USDT", tokenIcon: icon_usdt, decimal: 6},
];

const MappedSwapTokenList = [
  {tokenName: "BTCM", tokenIcon: icon_btcm, pairIcon: icon_btcmPair, decimal: 18},
  {tokenName: "ETHM", tokenIcon: icon_ethm, pairIcon: icon_ethmPair, decimal: 18},
  {tokenName: "USDM", tokenIcon: icon_usdm, decimal: 6},
  {tokenName: "MST", tokenIcon: icon_mst, decimal: 18},
];

const EthereumTokenList = [
  {tokenName: "ETH", tokenIcon: icon_weth, pairIcon: icon_ethmPair, decimal: 18},
  {tokenName: "wBTC", tokenIcon: icon_wbtc, pairIcon: icon_btcmPair, decimal: 8},
  {tokenName: "USDC", tokenIcon: icon_usdc, decimal: 6},
  {tokenName: "USDT", tokenIcon: icon_usdt, decimal: 6},
];

const networkList = [
  {networkName: "Eurus", networkIcon: icon_eurus_wallet},
  {networkName: "Ethereum", networkIcon: icon_network_eth},
];

export function getAppVersion() {
  return "1.3.0";
}

export function getTokenList() {
  return tokenList;
}

export function getEthereumTokenList() {
  return EthereumTokenList;
}

export function getMappedSwapTokenList() {
  return MappedSwapTokenList;
}

export function getNetworkList() {
  return networkList;
}

export function getTransactionFeeRatio() {
  return 0.003;
}

export function setWalletAddress(walletAddress) {
  return sessionStorage.setItem(WALLET_ADDRESS_KEY, walletAddress);
}

export function getWalletAddress() {
  return sessionStorage.getItem(WALLET_ADDRESS_KEY);
}

export function setOwnerWalletAddress(walletAddress) {
  return sessionStorage.setItem(OWNER_WALLET_ADDRESS_KEY, walletAddress);
}

export function getOwnerWalletAddress() {
  return sessionStorage.getItem(OWNER_WALLET_ADDRESS_KEY);
}

export function setUsername(username) {
  return sessionStorage.setItem(USERNAME_KEY, username);
}

export function setToken(token) {
  return sessionStorage.setItem(AGENT_TOKEN, token);
}

export function getToken() {
  return sessionStorage.getItem(AGENT_TOKEN);
}

export function updateLoginTokenList(walletAddress, token) {
  if (localStorage.getItem(LOGIN_TOKEN_LIST)) {
    let loginTokenListStr = localStorage.getItem(LOGIN_TOKEN_LIST);
    let loginTokenList = JSON.parse(loginTokenListStr);
    loginTokenList[walletAddress] = token;
    localStorage.setItem(LOGIN_TOKEN_LIST, JSON.stringify(loginTokenList));
  } else {
    let loginTokenList = {};
    loginTokenList[walletAddress] = token;
    localStorage.setItem(LOGIN_TOKEN_LIST, JSON.stringify(loginTokenList));
  }
}

export function getLoginTokenFromList(walletAddress) {
  let _loginToken = null;
  try {
    if (localStorage.getItem(LOGIN_TOKEN_LIST)) {
      let loginTokenListStr = localStorage.getItem(LOGIN_TOKEN_LIST);
      let loginTokenList = JSON.parse(loginTokenListStr);
      // alert("loginTokenList", loginTokenList);
      if (loginTokenList && loginTokenList[walletAddress] && isTokenValid(loginTokenList[walletAddress])) {
        _loginToken = loginTokenList[walletAddress];
        // alert(" _loginToken", _loginToken);
        // console.log(" _loginToken", _loginToken);
      }
    }
  } catch (error) {
    console.log("getLoginTokenFromList error:", error);
  }
  return _loginToken;
}

export function removeLoginTokenFromList(walletAddress) {
  try {
    if (localStorage.getItem(LOGIN_TOKEN_LIST)) {
      let loginTokenListStr = localStorage.getItem(LOGIN_TOKEN_LIST);
      let loginTokenList = JSON.parse(loginTokenListStr);
      if (loginTokenList && loginTokenList[walletAddress]) {
        delete loginTokenList[walletAddress];
        localStorage.setItem(LOGIN_TOKEN_LIST, JSON.stringify(loginTokenList));
      }
    }
  } catch (error) {
    console.log("removeLoginTokenFromList error:", error);
  }
}

export function getLang() {
  return localStorage.getItem(LANG);
}

export function getUserState() {
  return sessionStorage.getItem(USER_STATUS);
}

export function setUserState(userState) {
  return sessionStorage.setItem(USER_STATUS, userState);
}

export function clearAllUserInfo() {
  sessionStorage.clear();
}

export function setIsMobile(isMobile) {
  return sessionStorage.setItem(IS_MOBILE_KEY, isMobile);
}

export function getIsMobile() {
  const isMobile = sessionStorage.getItem(IS_MOBILE_KEY);
  if (isMobile === "true") {
    return true;
  } else {
    return false;
  }
}

export function getIsAgent() {
  const isAgent = sessionStorage.getItem(IS_AGENT_KEY);
  if (isAgent === "true") {
    return true;
  } else {
    return false;
  }
}

export function setIsAgent(isAgent) {
  return sessionStorage.setItem(IS_AGENT_KEY, isAgent);
}

export function getPopUpFarmToken() {
  return sessionStorage.getItem(POPUP_FARM_TOKEN);
}

export function setPopUpFarmToken(token) {
  return sessionStorage.setItem(POPUP_FARM_TOKEN, token);
}

export function getNetWorkGuideLink() {
  return {
    zh_TW: process.env.REACT_APP_NETWORK_GUIDE_ZH_TW,
    zh_CN: process.env.REACT_APP_NETWORK_GUIDE_ZH_CN,
    en: process.env.REACT_APP_NETWORK_GUIDE_EN,
  };
}

export function getSubmitScreenCaptureLink() {
  return {
    zh_TW: process.env.REACT_APP_CAMPAIGN_SCREEN_CAPTURE_ZH_TW,
    zh_CN: process.env.REACT_APP_CAMPAIGN_SCREEN_CAPTURE_ZH_CN,
    en: process.env.REACT_APP_CAMPAIGN_SCREEN_CAPTURE_EN,
    kr: process.env.REACT_APP_CAMPAIGN_SCREEN_CAPTURE_KR
  };
}

export async function connectWalletFn(walletAddress, token, t) {
    try {
      let CONNECTWALLETAPI = connectWallet();
      const data = {
        address: walletAddress,
        connectedType: 0,
      };
      await axios.post(CONNECTWALLETAPI, data, {
        headers: {
          authorization: token,
          "content-type": "application/json",
        },
      });
    } catch (error) {
      console.error(error);
      notify("warn", t("loginFailed"));
    }
  }

export async function loginWithMetamask(t, fundingCodeValue, location, token, walletAddress) {
    logEvent(getAnalytics(), `nav_login`);
    try {
      let isDappbrowser = false;
      if (checkDappBrowser()) {
        isDappbrowser = true;
      }
      if (isDappbrowser) {
        const accounts = await getAccount();
        const accountAddress = accounts[0];
        const _loginToken = getLoginTokenFromList(accountAddress);
        let _decodedLoginToken = {};
        let _tokenAgentTypeInSync = true
        try {
          _decodedLoginToken = jwt_decode(_loginToken);
          if (_decodedLoginToken.isAgent) {
            _tokenAgentTypeInSync = true
          } else {
            _tokenAgentTypeInSync = false
            const _customerInfo = await getCustomerInfo(accountAddress);
            const _maxCredit = _customerInfo.maxFunding
            const _leverage = _customerInfo.leverage
            if (_maxCredit || _leverage) {
              if (_decodedLoginToken.isAgent) {
                _tokenAgentTypeInSync = true
              }
            } else {
              _tokenAgentTypeInSync = true
            }
          }
        } catch (error) {
          console.log("jwt_decode error _loginToken:", _loginToken);
        }
        if (
          _loginToken
          && isTokenValid(_loginToken, 3600)
          && _tokenAgentTypeInSync
          && (!fundingCodeValue || (fundingCodeValue && _decodedLoginToken.isAgent))
        ) {
          setToken(_loginToken);
          setWalletAddress(accountAddress);
          await connectWalletFn(walletAddress, token, t);
          window.location.href = location.pathname;
        } else {
          const ownerWalletAddress = await getOwnerWalletAddress();
          if (ownerWalletAddress) {
            setOwnerWalletAddress(ownerWalletAddress);
          }
          const customerLoginResult = await customerLogin(accountAddress, fundingCodeValue, ownerWalletAddress);
          if (customerLoginResult && customerLoginResult.data && customerLoginResult.data.data) {
            if (customerLoginResult.data.msg === "Funging Code was used, please try a new code!") {
              notify("warn", t("invalidCode"));
            } else if (customerLoginResult.data.msg === "Funging Code not found") {
              notify("warn", t("invalidCode"));
            } else if (customerLoginResult.data.msg === "Funding Code used successfully.") {
              notify("primary", t("validCode"));
            }
            console.log(" customerLoginResult", customerLoginResult);
            setToken(customerLoginResult.data.data);
            updateLoginTokenList(accountAddress, customerLoginResult.data.data);
            setWalletAddress(accountAddress);
            window.location.href = location.pathname;
          } else {
            notify("warn", t("loginFailed"));
          }
        }
      } else {
        notify("primary", t("notDAppBroswer"));
      }
    } catch (err) {
      console.error(err);
      notify("warn", t("loginFailed"));
    }
  }