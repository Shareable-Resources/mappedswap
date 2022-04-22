import icon_decats from "../asset/icon_decats.svg";
import icon_wallet from "../asset/icon_wallet.svg";
import icon_metamask from "../asset/icon_metamask.svg";
import icon_eurus_wallet from "../asset/icon_eurus_wallet.svg";
import style from "./Navbar.module.scss";
import icon_menu_trade from "../asset/icon_menu_trade.svg";
import icon_menu_account from "../asset/icon_menu_account.svg";
import icon_menu_info from "../asset/icon_menu_info.svg";
import icon_menu_referral from "../asset/icon_menu_referral.svg";
import icon_menu_farm from "../asset/icon_menu_farm.svg";
import { useLocation, NavLink } from "react-router-dom";
import { useHistory } from "react-router";
import jwt_decode from "jwt-decode";
import icon_dropdownselect from "../asset/icon_dropdownselect.svg";
import { getAccount, getCustomerInfo, checkDappBrowser, customerLogin, isEurusWallet, isMetamask, getOwnerWalletAddress } from "../web3";
import { useState } from "react";
import { setWalletAddress, getWalletAddress, setToken, getLang, clearAllUserInfo, updateLoginTokenList, getLoginTokenFromList, getToken, setOwnerWalletAddress, loginWithMetamask } from "../store";
import { useTranslation } from "react-i18next";
import notify from "../component/Toast";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import Menu from "@mui/material/Menu";
import { shortenHash, isTokenValid, isMobile } from "../utils";
import { getAnalytics, logEvent } from "firebase/analytics";
import AddTokenModal from "./AddTokenModal";
import axios from "axios";
import { connectWallet, fundingCode } from "../api";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const languageList = [
    { label: "简体", value: "zh_CN" },
    { label: "繁體", value: "zh_TW" },
    { label: "Eng", value: "en" },
    { label: "한국어", value: "zh_KR" }
  ];

  // const isAgent = getIsAgent()
  const walletAddress = getWalletAddress();
  let location = useLocation();
  const history = useHistory();
  let searchParams = new URLSearchParams(location.search);
  const fundingCodeValue = searchParams.get("r");

  const token = getToken();
  const currentLanguage = getLang();
  const [userEquity, setUserEquity] = useState(0);
  const [isWalletSubMenuOpen, setIsWalletSubMenuOpen] = useState(false);
  const [addTokenModal, setAddTokenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(0);

  const menuOpen = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  async function logoutMetamask() {
    logEvent(getAnalytics(), `nav_logout`);
    clearAllUserInfo();
    window.location.reload();
  }

  function handleSelectLanguage(event) {
    logEvent(getAnalytics(), `nav_language_select`);
    const selected = languageList.find(({ value }) => value === event.target.value);
    i18n.changeLanguage(selected.value);
  }

  function getWalletIcon() {
    if (isMetamask()) {
      return icon_metamask;
    } else if (isEurusWallet()) {
      return icon_eurus_wallet;
    } else {
      return icon_wallet;
    }
  }

  function getWalletDesscription() {
    if (isMetamask()) {
      return t("connectToMetaMask");
    } else if (isEurusWallet()) {
      return t("connectToEurus");
    } else {
      return t("connectToWallet");
    }
  }

  function copy(message) {
    logEvent(getAnalytics(), `nav_copy_address`);
    var input = document.createElement("input");
    input.value = message;
    console.log(input);
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length);
    document.execCommand("copy");
    document.body.removeChild(input);
    setIsWalletSubMenuOpen(!isWalletSubMenuOpen);
    notify("primary", t("copySuccess"));
  }

  function getTradePathActive() {
    if (location.pathname === "/trade/BTCM" || location.pathname === "/trade/ETHM") {
      return true;
    } else {
      return false;
    }
  }

  function getMSTInfoPathActive() {
    if (location.pathname === "/info/mst" || location.pathname === "/info/pool" || location.pathname === "/info/pool/BTCM" || location.pathname === "/info/pool/ETHM") {
      return true;
    } else {
      return false;
    }
  }

  function getReferralPathActive() {
    if (location.pathname === "/referral" || location.pathname === "/referral/friendlist" || location.pathname === "/referral/reward") {
      return true;
    } else {
      return false;
    }
  }

  function getVolumeTradingCompPathActive() {
    if (location.pathname === "/campaign") {
      return true;
    } else {
      return false;
    }
  }

  function directToAccount() {
    logEvent(getAnalytics(), `nav_direct_account`);
    history.push("/account");
  }

  function directToTrade() {
    logEvent(getAnalytics(), `nav_direct_trade`);
    history.push("/trade/BTCM");
  }

  function directToInfo() {
    logEvent(getAnalytics(), `nav_direct_info`);
    history.push("/info/pool");
  }

  function directToFarm() {
    logEvent(getAnalytics(), `nav_direct_farm`);
    history.push("/stake");
  }

  function directToReferral() {
    logEvent(getAnalytics(), `nav_direct_referral`);
    history.push("/referral");
  }

  function directToCampaign() {
    logEvent(getAnalytics(), `nav_direct_campaign`);
    history.push("/campaign");
  }

  function toggleAddTokenModal() {
    if (token) {
      setAddTokenModal(!addTokenModal);
      setIsWalletSubMenuOpen(false);
    } else {
      notify("warn", t("pleaseLoginInMetamask"));
    }
  }

  return (
    <>
      <div id={style["top-nav-container"]}>
        <div id={style["header"]}>
          <div className={style["header-left"]}>
            <div className={style["card-icon"]} onClick={() => window.open(process.env.REACT_APP_DECATS_MAINPAGE)}>
              <img src={icon_decats} alt="decats" />
            </div>
            <div className={style["header-title"]}>MappedSwap</div>
            <div className={style["nav-containers"]}>
              <div className={style["nav-container"]} onClick={directToAccount}>
                <div className={`${style["nav-tab"]} ${location.pathname === "/account" && style["active-menu"]}`}>
                  <span>{t("account")}</span>
                </div>
              </div>
              <div className={style["nav-container"]} onClick={directToTrade}>
                <div className={`${style["nav-tab"]} ${getTradePathActive() && style["active-menu"]}`}>
                  <span>{t("trade")}</span>
                </div>
              </div>
              <div className={style["nav-container"]} onClick={directToInfo}>
                <div className={`${style["nav-tab"]} ${getMSTInfoPathActive() && style["active-menu"]}`}>
                  <span>{t("mstInfo")}</span>
                </div>
              </div>
              <div className={style["nav-container"]} onClick={directToFarm}>
                <div className={`${style["nav-tab"]} ${location.pathname === "/stake" && style["active-menu"]}`}>
                  <span>{t("liquidity")}</span>
                </div>
              </div>
              <div className={style["nav-container"]} onClick={directToReferral}>
                <div className={`${style["nav-tab"]} ${getReferralPathActive() && style["active-menu"]}`}>
                  <span>{t("referral")}</span>
                </div>
              </div>
              <div className={style["nav-container"]} onClick={directToCampaign}>
                <div className={`${style["nav-tab"]} ${style["campaign-tab"]}  ${getVolumeTradingCompPathActive() && style["active-menu"]}` }>
                  <span>{t("Campaign")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={style["header-right"]}>
            {
              isMobile() &&
              <div className={style["logout-wrap"]}>
                <div className={`${style["logout"]} ${style["campaign"]}`}>
                  <div className={style["campaign-container"]} onClick={directToCampaign}>
                    Campaign
                  </div>
                </div>
              </div>
            }
            <div className={style["logout-wrap"]}>
              <div className={style["logout"]}>
                {walletAddress ? (
                  <div className={style["address-container"]} onClick={() => setIsWalletSubMenuOpen(!isWalletSubMenuOpen)}>
                    <div className={style["card-icon"]}>
                      <img src={getWalletIcon()} alt="trade" />
                    </div>
                    <span>{walletAddress && shortenHash(walletAddress)}</span>
                    <div className={`${style["select-icon"]}`}>
                      <img src={icon_dropdownselect} alt="ethm" />
                    </div>
                  </div>
                ) : (
                  <div className={style["login-container"]} onClick={() => loginWithMetamask(t, fundingCodeValue, location, token, walletAddress)}>
                    {getWalletDesscription()}
                  </div>
                )}
              </div>
              <div className={`${style["sub-menu"]} ${isWalletSubMenuOpen && style["active-sub-menu"]}`}>
                <div className={`${style["token-name"]}`} onClick={() => copy(walletAddress)}>
                  <span> {t("copyAddress")}</span>
                </div>
                <div className={style["token-name"]} onClick={logoutMetamask}>
                  <span> {t("disconnect")}</span>
                </div>
                {token && isMetamask() && (
                  <div className={style["token-name"]} onClick={() => toggleAddTokenModal()}>
                    <span>+ {t("addToken")}</span>
                  </div>
                )}
                <div className={style["token-name"]} onClick={() => window.open(process.env.REACT_APP_EURUS_TOKEN_BRIDGE)}>
                  <span> {t("eurusTokenBridge")}</span>
                </div>
              </div>
            </div>
            <div className={style["card-select"]}>
              <FormControl>
                <Select value={currentLanguage} onChange={handleSelectLanguage} displayEmpty inputProps={{ "aria-label": "Without label" }}>
                  <MenuItem value={"en"}>Eng</MenuItem>
                  <MenuItem value={"zh_CN"}>简体</MenuItem>
                  <MenuItem value={"zh_TW"}>繁體</MenuItem>
                  <MenuItem value={"zh_KR"}>한국어</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
      </div>
      <div id={style["bottom-nav-container"]}>
        <span className={` ${location.pathname === "/account" ? style["active"] : ""}`} onClick={directToAccount}>
          <div className={style["card-icon"]}>
            <img src={icon_menu_account} alt="trade" />
          </div>
          <div>{t("account")}</div>
        </span>
        <span className={` ${getTradePathActive() ? style["active"] : ""}`} onClick={directToTrade}>
          <div className={style["card-icon"]}>
            <img src={icon_menu_trade} alt="trade" />
          </div>
          <div>{t("trade")}</div>
        </span>
        <span className={` ${getMSTInfoPathActive() ? style["active"] : ""}`} onClick={directToInfo}>
          <div className={style["card-icon"]}>
            <img src={icon_menu_info} alt="trade" />
          </div>
          <div>{t("mstInfo")}</div>
        </span>
        <span className={` ${location.pathname === "/stake" ? style["active"] : ""}`} onClick={directToFarm}>
          <div className={style["card-icon"]}>
            <img src={icon_menu_farm} alt="trade" />
          </div>
          <div>{t("liquidity")}</div>
        </span>
        <span className={`${getReferralPathActive() ? style["active"] : ""}`} onClick={directToReferral}>
          <div className={style["card-icon"]}>
            <img src={icon_menu_referral} alt="trade" />
          </div>
          <div>{t("referral")}</div>
        </span>
      </div>
      <AddTokenModal modal={addTokenModal} toggle={toggleAddTokenModal} />
    </>
  );
};

export default Navbar;
