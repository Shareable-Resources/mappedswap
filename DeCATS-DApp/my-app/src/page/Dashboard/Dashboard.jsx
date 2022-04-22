import style from "./Dashboard.module.scss";
import icon_arrowup from "../../asset/icon_arrowup.svg";
import icon_arrowdown from "../../asset/icon_arrowdown.svg";
import icon_usdm from "../../asset/icon_usdm.svg";
import icon_btcm from "../../asset/icon_btcm.svg";
import icon_ethm from "../../asset/icon_ethm.svg";
import icon_transfer from "../../asset/icon_transfer.svg";
import icon_price_active from "../../asset/icon_price_active.svg";
import {getTokenBalance, getCustomerInfo, amountDivideDecimals, getAssetDetails, floorPrecised, getPairDetail} from "../../web3";
import {useState, useEffect} from "react";
import {getWalletAddress, getToken, getTokenList, getUserState, setUserState, getIsAgent, getIsMobile, loginWithMetamask} from "../../store";
import {useTranslation} from "react-i18next";
import ProgressBar from "../../component/Progressbar";
import axios from "axios";
import {tokenLatestPrice, tokenHistoryPrice, getProfitAndLoss} from "../../api";
import notify from "../../component/Toast";
import {useHistory, useLocation} from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import GetfundingModal from "../../component/GetfundingModal";
import TransferFundModal from "../../component/TransferFundModal";
import {getAnalytics, logEvent} from "firebase/analytics";
import moment from "moment";
import ProfitAndLossChartModal from "../../component/ProfitAndLossChartModal";
import Tooltip from "@mui/material/Tooltip";

const Dashboard = () => {
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  const fundingCodeValue = searchParams.get("r");
  const currentTime = Math.floor(Date.now() / 1000);
  const {t} = useTranslation();
  const history = useHistory();
  const token = getToken();
  const isAgent = getIsAgent();
  const walletAddress = getWalletAddress();
  const latestPriceInterval = 5000;
  const tokenList = getTokenList();
  const [amount, setAmount] = useState("");
  const [maxCredit, setMaxCredit] = useState("");
  const [usedCredit, setUsedCredit] = useState("");
  const [currentRiskLevel, setCurrentRiskLevel] = useState("");
  const [totalEquity, setTotalEquity] = useState(0);
  const [btcmCredit, setBtcmCredit] = useState(0);
  const [ethmCredit, setEthmCredit] = useState(0);
  const [usdmCredit, setUsdmCredit] = useState(0);
  const [btcmDisplayBalance, setBtcmDisplayBalance] = useState(0);
  const [ethmDisplayBalance, setEthmDisplayBalance] = useState(0);
  const [usdmDisplayBalance, setUsdmDisplayBalance] = useState(0);
  const [btcmHourlyInterest, setBtcmHourlyInterest] = useState(0);
  const [ethmHourlyInterest, setEthmHourlyInterest] = useState(0);
  const [usdmHourlyInterest, setUsdmHourlyInterest] = useState(0);
  const [userMode, setUserMode] = useState(0);
  const [userEquity, setUserEquity] = useState(0);
  const [userLeverage, setUserLeverage] = useState(0);
  const [btcmDisplayPrice, setBtcmDisplayPrice] = useState(0);
  const [ethmDisplayPrice, setEthmDisplayPrice] = useState(0);
  const [btcmHistoryPrice, setBtcmHistoryPrice] = useState(0);
  const [ethmHistoryPrice, setEthmHistoryPrice] = useState(0);
  const [btcmPriceDifference, setBtcmPriceDifference] = useState(0);
  const [ethmPriceDifference, setEthmPriceDifference] = useState(0);
  const [latestPriceJobLastTime, setLatestPriceJobLastTime] = useState(0);
  const [pairInfo, setPairInfo] = useState(null);
  const [btcmActive, setBtcmActive] = useState(false);
  const [ethmActive, setEthmActive] = useState(false);
  const [usdmActive, setUsdmActive] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [fundingModal, setFundingModal] = useState(false);
  const [userStatus, setUserStatus] = [getUserState(), setUserState];
  const [defaultToken, setDefaultToken] = useState(tokenList.find(({tokenName}) => tokenName === "BTCM"));
  const [selectedToken, setSelectedToken] = useState(defaultToken);
  const [profitAndLossChartModal, setProfitAndLossChartModal] = useState(false);

  const [pnlValue, setPnlValue] = useState(0);
  // const [pnlDateFrom, setpnlDateFrom] = useState("2020-1-1");

  const pnlDateFrom = moment.unix(currentTime).subtract(1, "days").format("YYYY-MM-DD");
  const pnlDateTo = moment.unix(currentTime).subtract(1, "days").format("YYYY-MM-DD");
  function getTokenInfo(tokenNameInput) {
    return getTokenList().find(({tokenName}) => tokenName === tokenNameInput);
  }

  async function getReserve() {
    try {
      const btcmPairReserveInfo = await getPairDetail("BTCM", "USDM");
      const ethmPairReserveInfo = await getPairDetail("ETHM", "USDM");
      const pairInfo = {btcmPairInfo: btcmPairReserveInfo, ethmPairInfo: ethmPairReserveInfo};
      setPairInfo(pairInfo);
      return pairInfo;
    } catch (error) {
      console.error("Get Reserve error", error);
      notify("warn", t("networkError"));
    }
    return {};
  }

  function toggleFundingModal() {
    if (walletAddress) {
      setFundingModal(!fundingModal);
    } else {
      loginWithMetamask(t, fundingCodeValue, location, token, walletAddress);
    }
  }

  async function getHistoryPrice(tradeToken, baseToken) {
    try {
      let _pairInfo = pairInfo;
      if (!pairInfo) {
        _pairInfo = await getReserve();
      }

      let response = await axios.get(tokenHistoryPrice(`${tradeToken.tokenName}/${baseToken.tokenName}`));
      const apiResponse2 = response.data;
      if (apiResponse2 && apiResponse2.returnCode === 0 && apiResponse2.data) {
        const price0 = apiResponse2.data;
        let tradeTokenPrice = 0;

        let baseTokenReserve = amountDivideDecimals(price0.reserve1, baseToken.decimal);
        let tradeTokenReserve = amountDivideDecimals(price0.reserve0, tradeToken.decimal);
        if (price0.pairName.includes("ETH") && _pairInfo.ethmPairInfo.token0Name === "USDM") {
          baseTokenReserve = amountDivideDecimals(price0.reserve0, baseToken.decimal);
          tradeTokenReserve = amountDivideDecimals(price0.reserve1, tradeToken.decimal);
        } else if (price0.pairName.includes("BTC") && _pairInfo.btcmPairInfo.token0Name === "USDM") {
          baseTokenReserve = amountDivideDecimals(price0.reserve0, baseToken.decimal);
          tradeTokenReserve = amountDivideDecimals(price0.reserve1, tradeToken.decimal);
        }
        tradeTokenPrice = baseTokenReserve / tradeTokenReserve;
        return tradeTokenPrice;
      }
    } catch (error) {
      console.error("getVolume error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    let isUnmount = false;
    async function initiateIndividialInfo() {
      try {
        const customerInfo = await getCustomerInfo();
        setUserStatus(customerInfo.status);
        const maxCredit = amountDivideDecimals(customerInfo.maxFunding, 6);
        const usedCredit = amountDivideDecimals(customerInfo.usedFunding, 6);
        const currentRiskLevel = parseFloat(amountDivideDecimals(customerInfo.currentRiskLevel, 6) * 100);
        const userEquity = amountDivideDecimals(customerInfo.equity, 6);
        const userMode = customerInfo.mode;
        const userLeverage = customerInfo.leverage;
        const btcmCredit = await getTokenBalance("BTCM");
        const ethmCredit = await getTokenBalance("ETHM");
        const usdmCredit = await getTokenBalance("USDM");
        const totalEquity = btcmCredit.usdmEquivalent + ethmCredit.usdmEquivalent + usdmCredit.usdmEquivalent;
        setBtcmCredit(btcmCredit);
        setEthmCredit(ethmCredit);
        setUsdmCredit(usdmCredit);
        const btcmAssetDetail = await getAssetDetails("BTCM");
        const ethmAssetDetail = await getAssetDetails("ETHM");
        const usdmAssetDetail = await getAssetDetails("USDM");
        await getPNL();

        if (!isUnmount) {
          setUserLeverage(userLeverage);
          setUserMode(userMode);
          setUserEquity(userEquity);
          setUsedCredit(usedCredit);
          setMaxCredit(maxCredit);
          if (userEquity < 0) {
            setCurrentRiskLevel(100);
          } else {
            setCurrentRiskLevel(currentRiskLevel);
          }
          setTotalEquity(totalEquity);
          setBtcmDisplayBalance(btcmAssetDetail.balance);
          setEthmDisplayBalance(ethmAssetDetail.balance);
          setUsdmDisplayBalance(usdmAssetDetail.balance);
          setBtcmHourlyInterest(btcmAssetDetail.hourlyInterest);
          setEthmHourlyInterest(ethmAssetDetail.hourlyInterest);
          setUsdmHourlyInterest(usdmAssetDetail.hourlyInterest);
        }
      } catch (error) {
        console.log("Network Error");
        notify("warn", t("networkError"));
      }
    }

    async function initiatePriceInfo() {
      const btcmHistoryPrice = await getHistoryPrice(getTokenInfo("BTCM"), getTokenInfo("USDM"));
      const ethmHistoryPrice = await getHistoryPrice(getTokenInfo("ETHM"), getTokenInfo("USDM"));
      setBtcmHistoryPrice(btcmHistoryPrice);
      setEthmHistoryPrice(ethmHistoryPrice);
    }
    if (getWalletAddress()) {
      initiateIndividialInfo();
    }
    initiatePriceInfo();

    return () => (isUnmount = true);
  }, [t, depositModal]);

  useEffect(() => {
    let isUnmount = false;
    async function getLatestPrice() {
      try {
        let _pairInfo = pairInfo;
        if (!pairInfo) {
          _pairInfo = await getReserve();
        }
        let response = await axios.get(tokenLatestPrice(), {
          headers: {
            Authorization: token,
          },
        });
        const apiResponse2 = response.data;
        if (apiResponse2 && apiResponse2.returnCode === 0 && apiResponse2.data && apiResponse2.data.length === 2) {
          const price0 = apiResponse2.data[0];
          const price1 = apiResponse2.data[1];
          let ethPrice = 0;
          let btcPrice = 0;
          if (price0.pairName.includes("ETH")) {
            let usdReserve0 = amountDivideDecimals(price0.reserve1, 6);
            let ethReserve0 = amountDivideDecimals(price0.reserve0, 18);
            if (_pairInfo.ethmPairInfo.token0Name === "USDM") {
              usdReserve0 = amountDivideDecimals(price0.reserve0, 6);
              ethReserve0 = amountDivideDecimals(price0.reserve1, 18);
            }
            ethPrice = usdReserve0 / ethReserve0;
            let usdReserve1 = amountDivideDecimals(price1.reserve1, 6);
            let btcReserve1 = amountDivideDecimals(price1.reserve0, 18);
            if (_pairInfo.btcmPairInfo.token0Name === "USDM") {
              usdReserve1 = amountDivideDecimals(price1.reserve0, 6);
              btcReserve1 = amountDivideDecimals(price1.reserve1, 18);
            }
            btcPrice = usdReserve1 / btcReserve1;
          } else {
            let usdReserve0 = amountDivideDecimals(price0.reserve1, 6);
            let btcReserve0 = amountDivideDecimals(price0.reserve0, 18);
            if (_pairInfo.btcmPairInfo.token0Name === "USDM") {
              usdReserve0 = amountDivideDecimals(price0.reserve0, 6);
              btcReserve0 = amountDivideDecimals(price0.reserve1, 18);
            }
            btcPrice = usdReserve0 / btcReserve0;
            let usdReserve1 = amountDivideDecimals(price1.reserve1, 6);
            let ethReserve1 = amountDivideDecimals(price1.reserve0, 18);
            if (_pairInfo.ethmPairInfo.token0Name === "USDM") {
              usdReserve1 = amountDivideDecimals(price1.reserve0, 6);
              ethReserve1 = amountDivideDecimals(price1.reserve1, 18);
            }
            ethPrice = usdReserve1 / ethReserve1;
          }

          if (!isUnmount) {
            setBtcmPriceDifference(btcPrice - btcmDisplayPrice);
            setEthmPriceDifference(ethPrice - ethmDisplayPrice);
            setBtcmDisplayPrice(btcPrice);
            setEthmDisplayPrice(ethPrice);
            setLatestPriceJobLastTime(Date.now);
          }
        }
      } catch (error) {
        console.error("getVolume error", error);
        // notify('warn', t('networkError'))
      }
    }

    async function startLatestPriceJob() {
      try {
        setTimeout(getLatestPrice, latestPriceJobLastTime === 0 ? 0 : latestPriceInterval);
      } catch (error) {
        console.log("startLatestPriceJob error", error);
      }
    }

    startLatestPriceJob();

    return () => (isUnmount = true);
  }, [latestPriceJobLastTime, btcmDisplayPrice, ethmDisplayPrice, getReserve, pairInfo, t, token]);

  async function getPNL() {
    try {
      let PNLAPI = getProfitAndLoss(pnlDateFrom, pnlDateTo);
      let response = await axios.get(PNLAPI, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.data) {
        // console.log("response", response.data.data);
        const pnlListData = response.data.data.list.rows;
        // const pnlCurrentValue = Number(response.data.data.current.profitAndLoss);
        // console.log(pnlListData);
        if (pnlListData.length > 0) {
          const pnlListValue = pnlListData.reduce((accumulator, item) => {
            return Number(accumulator) + Number(item.profitAndLoss);
          }, 0);
          setPnlValue(pnlListValue);
        }
      }
    } catch (error) {
      console.error("getPNL error", error);
      notify("warn", t("networkError"));
    }
  }

  function getAvailableFunding() {
    // console.log('userEquity',userEquity)
    // console.log('maxCredit',maxCredit)
    // // console.log('userMode', userMode)
    // console.log('value', Math.min(maxCredit, (parseFloat(userLeverage) / 1000) * parseFloat(getTotalEquity())))
    if (userEquity && userEquity > 0) {
      if (userMode === "1") {
        return maxCredit;
      } else if (userMode === "0") {
        return Math.min(maxCredit, (parseFloat(userLeverage) / 1000) * parseFloat(getTotalEquity()));
      } else {
        return 0;
      }
    } else {
      return "0.00";
    }
  }

  function getRemainingAvailableFunding() {
    const remainAvailableFunding = getAvailableFunding() - usedCredit;
    if (remainAvailableFunding < 0 || userEquity < 0) {
      return "0.00";
    } else {
      return remainAvailableFunding;
    }
  }

  function getRiskColorFunction() {
    if (currentRiskLevel > 60) {
      return "#EF6A59";
    } else if (currentRiskLevel > 20) {
      return "#EBC041";
    } else if (currentRiskLevel > 0) {
      return "#00B4C9";
    } else {
      return "";
    }
  }

  function getFundingLeftColorFunction(value) {
    if (value > 80) {
      return "#00B4C9";
    } else if (value > 50) {
      return "#EBC041";
    } else if (value > 0) {
      return "#EF6A59";
    } else {
      return "";
    }
  }

  function closePositionButtonOnClick(tokeName) {
    logEvent(getAnalytics(), `account_close_position`);
    if (token) {
      let tokenBalance = 0;
      if (tokeName === "BTCM") {
        tokenBalance = btcmCredit.realizedBalance - btcmCredit.interest;
      } else if (tokeName === "ETHM") {
        tokenBalance = ethmCredit.realizedBalance - ethmCredit.interest;
      }
      if (tokenBalance > 0) {
        history.push(`/trade/${tokeName}?closePosition=1`);
      } else if (tokenBalance < 0) {
        history.push(`/trade/${tokeName}?closePosition=2`);
      }
    } else {
      notify("warn", t("pleaseLoginInMetamask"));
    }
  }

  function getBtcmUsdmEquivalent() {
    let btcmUsdmEquivalent = 0;
    if (!btcmDisplayPrice && btcmCredit) {
      btcmUsdmEquivalent = floorPrecised(btcmCredit.usdmEquivalent, 2);
    } else if (btcmDisplayPrice && btcmCredit) {
      btcmUsdmEquivalent = floorPrecised(btcmDisplayPrice * (btcmCredit.realizedBalance - btcmCredit.interest), 2);
    }
    return btcmUsdmEquivalent;
  }

  function getEthmUsdmEquivalent() {
    let ethmUsdmEquivalent = 0;
    if (!ethmDisplayPrice && ethmCredit) {
      ethmUsdmEquivalent = floorPrecised(ethmCredit.usdmEquivalent, 2);
    } else if (ethmDisplayPrice && ethmCredit) {
      ethmUsdmEquivalent = floorPrecised(ethmDisplayPrice * (ethmCredit.realizedBalance - ethmCredit.interest), 2);
    }
    return ethmUsdmEquivalent;
  }

  function getTotalEquity() {
    let totalEquityOutput = 0;
    let latesttotalEquity = ethmDisplayPrice * (ethmCredit.realizedBalance - ethmCredit.interest) + btcmDisplayPrice * (btcmCredit.realizedBalance - btcmCredit.interest) + (usdmCredit.realizedBalance - usdmCredit.interest);
    if (!btcmDisplayPrice || !ethmDisplayPrice) {
      totalEquityOutput = totalEquity;
    } else if (ethmDisplayPrice && ethmCredit && btcmDisplayPrice && btcmCredit) {
      totalEquityOutput = latesttotalEquity;
    }

    return totalEquityOutput;
  }

  function getCurrentRiskLevel() {
    let currentRiskLevelOutput = 0;
    if (!btcmDisplayPrice || !ethmDisplayPrice) {
      currentRiskLevelOutput = currentRiskLevel;
    } else if (getTotalEquity() && userLeverage && usedCredit) {
      currentRiskLevelOutput = (1 - (getTotalEquity() * (parseFloat(userLeverage) / 1000)) / usedCredit) * 100;
    }
    if (currentRiskLevelOutput < 0) {
      return 0;
    } else if (currentRiskLevelOutput > 100) {
      return 100;
    }

    return currentRiskLevelOutput;
  }

  function getDisplayBtcmPriceDifference() {
    let output = 0;
    if (btcmDisplayPrice && btcmHistoryPrice) {
      output = ((btcmDisplayPrice - btcmHistoryPrice) / btcmHistoryPrice) * 100;
    }
    return output;
  }

  function getDisplayEthmPriceDifference() {
    let output = 0;
    if (ethmDisplayPrice && ethmHistoryPrice) {
      output = ((ethmDisplayPrice - ethmHistoryPrice) / ethmHistoryPrice) * 100;
    }
    return output;
  }

  function toggleDeposit(defaultTokenName) {
    logEvent(getAnalytics(), `account_toggle_fund_transfer_modal`);
    if (token) {
      setDepositModal(!depositModal);
      setSelectedToken(tokenList.find((token) => token.tokenName === "BTCM"));
      if (defaultTokenName) {
        setAmount(0);
        setSelectedToken(tokenList.find((token) => token.tokenName === defaultTokenName));
      }
    } else {
      notify("warn", t("pleaseLoginInMetamask"));
    }
  }

  function getPnlColor(pnlValue) {
    let color = null;
    if (pnlValue) {
      if (pnlValue < 0) {
        return "red";
      } else if (pnlValue > 0) {
        return "green";
      } else {
        return "";
      }
    }
    return color;
  }

  function toggleProfitAndLossChartModal() {
    logEvent(getAnalytics(), `trade_toggle_mobile_chart_tab`);
    setProfitAndLossChartModal(!profitAndLossChartModal);
  }

  return (
    <>
      <div id={style["account-web"]}>
        <div id={style["info-panel"]}>
          <div className={style["info-container-wrap"]}>
            <div className={style["equity-container"]}>
              <div className={style["title-container"]}>{t("equity")}</div>
              <div className={style["value-container"]}>${getTotalEquity() ? floorPrecised(getTotalEquity(), 2) : "0.00"}</div>
              <div className={style["pnl-container"]}>
                <div className={style["pnl-wrap"]}>
                  <div className={style["li-date"]}>{t("yesterdayPNL")}</div>
                  {token && (
                    <div className={style["tips"]} onClick={() => toggleProfitAndLossChartModal()}>
                      ?
                    </div>
                  )}
                  {/* <div className={style["li-date"]}>
                    ({`${t("since")}`} {pnlDateFrom && pnlDateFrom})
                  </div> */}
                </div>
              </div>
              <div className={style["pnl-value-container"]}>
                <div className={`${style["li-value"]} ${style[`${pnlValue ? getPnlColor(pnlValue) : ""}`]}`}>${pnlValue && floorPrecised(amountDivideDecimals(pnlValue, tokenList.find((token) => token.tokenName === "USDM").decimal), 2)}</div>
              </div>
            </div>
            <div></div>
            <div className={`${style["fund-container"]} ${!isAgent && style["bur"]}`}>
              <div className={style["title-container"]}>
                <div className={style["title"]}>
                  <div>
                    {t("left")} <div className={style["slash"]}>/</div>
                  </div>{" "}
                  <div>{t("avaliable")}</div>
                </div>
                <Tooltip
                  placement={getIsMobile() ? "top" : "right"}
                  enterTouchDelay={0}
                  title={
                    <>
                      <div>{`*${t("learnMoreTotalFunding")}`}</div>
                      <div>{`*${t("learnMoreAvailableFunding")}`}</div>
                      {/* <a href={`${process.env.REACT_APP_DOCS_FUNDING}`}> {t("learnMore")}</a> */}
                    </>
                  }
                  arrow
                >
                  <div className={style["tips"]}>?</div>
                </Tooltip>
              </div>
              <div className={style["value-container"]}>
                <div className={style["top"]}>
                  <div>
                    <span>$ </span>
                    <span>{getRemainingAvailableFunding() ? floorPrecised(getRemainingAvailableFunding(), 2) : "0.00"}</span>
                  </div>
                  <div className={style["slash"]}>/</div>
                </div>

                <div className={style["bottom"]}>
                  <span>$</span> <span>{getAvailableFunding() ? floorPrecised(getAvailableFunding(), 2) : "0.00"}</span>
                </div>
              </div>
              <div className={style["bar-container"]}>
                <ProgressBar completed={(getRemainingAvailableFunding() / getAvailableFunding()) * 100} color={getFundingLeftColorFunction((getRemainingAvailableFunding() / getAvailableFunding()) * 100)} />
              </div>
            </div>
            <div className={`${style["risk-container"]} ${!isAgent && style["bur"]}`}>
              <div className={style["title-container"]}>
                <div>{t("riskLevel")}</div>
                <Tooltip
                  placement={getIsMobile() ? "top" : "right"}
                  enterTouchDelay={0}
                  title={
                    <>
                      <div>{`*${t("learnMoreRiskLevel1")}`}</div>
                      <div>{`*${t("learnMoreRiskLevel2")}`}</div>
                      {/* <a href={`${process.env.REACT_APP_DOCS_RISK_LEVEL}`}> {t("learnMore")}</a> */}
                    </>
                  }
                  arrow
                >
                  <div className={style["tips"]}>?</div>
                </Tooltip>
              </div>
              {getRiskColorFunction() === "" && <div className={`${style["value-container"]}`}>{floorPrecised(getCurrentRiskLevel(), 2)} %</div>}
              {getRiskColorFunction() === "#00B4C9" && <div className={`${style["value-container"]} ${style["green"]}`}>{floorPrecised(getCurrentRiskLevel(), 2)} %</div>}
              {getRiskColorFunction() === "#EBC041" && <div className={`${style["value-container"]} ${style["yellow"]}`}>{floorPrecised(getCurrentRiskLevel(), 2)} %</div>}
              {getRiskColorFunction() === "#EF6A59" && <div className={`${style["value-container"]} ${style["red"]}`}>{floorPrecised(getCurrentRiskLevel(), 2)} %</div>}
              <div className={style["bar-container"]}>
                <ProgressBar completed={getCurrentRiskLevel() < 100 ? parseInt(getCurrentRiskLevel()) : 100} color={getRiskColorFunction()} />
              </div>
            </div>
            {!isAgent && (
              <div className={style["get-funding-container"]}>
                {t("getFundingDescription")}
                <span onClick={toggleFundingModal}> {t("enterReferralCode")}</span>
                <GetfundingModal modal={fundingModal} toggle={toggleFundingModal} />
              </div>
            )}
          </div>
          <div className={style["price-containers"]}>
            <div className={`${style["price-container"]} ${style["left"]}`} onClick={() => history.push(`/trade/BTCM`)}>
              <div className={style["top"]}>
                <div className={style["card-icon"]}>
                  <img src={icon_btcm} alt="total" />
                </div>
                <span> BTC / USD</span>
              </div>
              <div className={style["bottom"]}>
                <div className={style["li-container"]}>
                  <div className={style["li-title"]}>{t("price")}</div>
                  {btcmPriceDifference < 0 && btcmDisplayPrice ? (
                    <div className={style["card-body-down"]}>
                      ${floorPrecised(btcmDisplayPrice, 2)}
                      {
                        <div className={style["card-icon"]}>
                          <img src={icon_arrowdown} alt="down" />
                        </div>
                      }
                    </div>
                  ) : (
                    ""
                  )}
                  {btcmPriceDifference > 0 && btcmDisplayPrice ? (
                    <div className={style["card-body-up"]}>
                      ${floorPrecised(btcmDisplayPrice, 2)}
                      {
                        <div className={style["card-icon"]}>
                          <img src={icon_arrowup} alt="up" />
                        </div>
                      }
                    </div>
                  ) : (
                    ""
                  )}
                  {btcmPriceDifference === 0 && btcmDisplayPrice ? <div className={style["card-body"]}>${floorPrecised(btcmDisplayPrice, 2)}</div> : ""}
                </div>
                <div className={style["li-container"]}>
                  <div className={style["li-title"]}>{t("change")}</div>
                  <div className={style["li-value"]}>
                    {getDisplayBtcmPriceDifference() < 0 ? <div className={style["card-body-down"]}>{floorPrecised(getDisplayBtcmPriceDifference(), 2)}%</div> : ""}
                    {getDisplayBtcmPriceDifference() > 0 ? <div className={style["card-body-up"]}>{floorPrecised(getDisplayBtcmPriceDifference(), 2)}%</div> : ""}
                    {getDisplayBtcmPriceDifference() === 0 ? <div className={style["card-body"]}>{floorPrecised(getDisplayBtcmPriceDifference(), 2)}%</div> : ""}
                  </div>
                </div>
              </div>
            </div>
            <div className={style["price-container"]} onClick={() => history.push(`/trade/ETHM`)}>
              <div className={style["top"]}>
                <div className={style["card-icon"]}>
                  <img src={icon_ethm} alt="total" />
                </div>
                <span> ETH / USD</span>
              </div>
              <div className={style["bottom"]}>
                <div className={style["li-container"]}>
                  <div className={style["li-title"]}>{t("price")}</div>
                  <div className={style["li-value"]}>
                    {ethmPriceDifference < 0 && ethmDisplayPrice ? (
                      <div className={style["card-body-down"]}>
                        ${floorPrecised(ethmDisplayPrice, 2)}
                        {
                          <div className={style["card-icon"]}>
                            <img src={icon_arrowdown} alt="down" />
                          </div>
                        }
                      </div>
                    ) : (
                      ""
                    )}

                    {ethmPriceDifference > 0 && ethmDisplayPrice ? (
                      <div className={style["card-body-up"]}>
                        ${floorPrecised(ethmDisplayPrice, 2)}
                        {
                          <div className={style["card-icon"]}>
                            <img src={icon_arrowup} alt="up" />
                          </div>
                        }
                      </div>
                    ) : (
                      ""
                    )}
                    {ethmPriceDifference === 0 && ethmDisplayPrice ? <div className={style["card-body"]}>${floorPrecised(ethmDisplayPrice, 2)}</div> : ""}
                  </div>
                </div>
                <div className={style["li-container"]}>
                  <div className={style["li-title"]}>{t("change")}</div>
                  <div className={style["li-value"]}>
                    {getDisplayEthmPriceDifference() < 0 ? <div className={style["card-body-down"]}>{floorPrecised(getDisplayEthmPriceDifference(), 2)}%</div> : ""}
                    {getDisplayEthmPriceDifference() > 0 ? <div className={style["card-body-up"]}>{floorPrecised(getDisplayEthmPriceDifference(), 2)}%</div> : ""}
                    {getDisplayEthmPriceDifference() === 0 ? <div className={style["card-body"]}>{floorPrecised(getDisplayEthmPriceDifference(), 2)}%</div> : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id={style["record-container"]}>
          <div className={style["table-wrapper"]}>
            <table>
              <thead>
                <tr>
                  <th className={style["token"]}>{t("currency")}</th>
                  <th className={style["currency"]}>{t("balance")}</th>
                  <th className={style["size"]}>{t("value")}</th>
                  <th className={style["rate"]}>
                    <div>{t("borrowingRate")}</div>
                    <Tooltip placement={getIsMobile() ? "top" : "right"} enterTouchDelay={0} title={<>{t("learnMoreBorrowingRate")}</>} arrow>
                      <div className={style["tips"]}>?</div>
                    </Tooltip>
                  </th>
                  <th className={style["button"]}></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={style["token"]}>
                    <div className={style["token-wrap"]}>
                      <div className={style["card-icon"]}>
                        <img src={icon_btcm} alt="total" />
                      </div>{" "}
                      <span>BTC</span>
                    </div>
                  </td>
                  <td className={style["currency"]}>{btcmCredit && floorPrecised(btcmCredit.realizedBalance - btcmCredit.interest)}</td>
                  <td className={style["size"]}>$ {getBtcmUsdmEquivalent()}</td>
                  <td className={style["rate"]}>{btcmHourlyInterest && amountDivideDecimals(btcmHourlyInterest, 7)}%</td>
                  <td className={style["button"]}>
                    <div className={style["button-wrap"]}>
                      <span onClick={() => toggleDeposit("BTCM")}>{t("transferFund")}</span>
                      <span className={style["bottom-button"]} onClick={() => closePositionButtonOnClick("BTCM")}>
                        {t("closePosition")}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={style["token"]}>
                    <div className={style["token-wrap"]}>
                      <div className={style["card-icon"]}>
                        <img src={icon_ethm} alt="total" />
                      </div>{" "}
                      <span>ETH</span>
                    </div>
                  </td>
                  <td className={style["currency"]}>{ethmCredit && floorPrecised(ethmCredit.realizedBalance - ethmCredit.interest)}</td>
                  <td className={style["size"]}>$ {getEthmUsdmEquivalent()}</td>
                  <td className={style["rate"]}>{ethmHourlyInterest && amountDivideDecimals(ethmHourlyInterest, 7)}%</td>
                  <td className={style["button"]}>
                    <div className={style["button-wrap"]}>
                      <span onClick={() => toggleDeposit("ETHM")}>{t("transferFund")}</span>
                      <span className={style["bottom-button"]} onClick={() => closePositionButtonOnClick("ETHM")}>
                        {t("closePosition")}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={style["token"]}>
                    <div className={style["token-wrap"]}>
                      <div className={style["card-icon"]}>
                        <img src={icon_usdm} alt="total" />
                      </div>{" "}
                      <span>USD</span>
                    </div>
                  </td>
                  <td className={style["currency"]}>{usdmCredit && floorPrecised(usdmCredit.realizedBalance - usdmCredit.interest)}</td>
                  <td className={style["size"]}>$ {usdmCredit && floorPrecised(usdmCredit.usdmEquivalent, 2)}</td>
                  <td className={style["rate"]}>{usdmHourlyInterest && amountDivideDecimals(usdmHourlyInterest, 7)}%</td>
                  <td className={style["button"]}>
                    <div className={`${style["button-wrap"]} ${style["button-wrap-bottom"]}`}>
                      <span onClick={() => toggleDeposit("USDM")}>{t("transferFund")}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id={style["account-mobile"]}>
        <div className={style["equity-container"]}>
          <div className={style["top"]}>
            <div className={style["equity-value"]}>
              <div className={style["li-label"]}>{t("equity")}</div>
              <div className={style["li-value"]}> ${getTotalEquity() ? floorPrecised(getTotalEquity(), 2) : "0.00"}</div>
            </div>
            <div className={style["transfer-button"]}>
              <div className={style["card-icon"]}>
                <img src={icon_transfer} alt="ethm" />
              </div>
              <span onClick={() => toggleDeposit("USDM")}>{t("transferFund")}</span>
            </div>
          </div>
          <div className={`${style["bottom"]}`}>
            <div className={`${style["li-container"]}`}>
              <div className={style["li-label"]}>
                <span>{t("yesterdayPNL")}</span>
                {token && (
                  <div className={style["tips"]} onClick={() => toggleProfitAndLossChartModal()}>
                    ?
                  </div>
                )}
              </div>
              <div className={`${style["li-value"]} ${style[`${pnlValue ? getPnlColor(pnlValue) : ""}`]}`}>${pnlValue && floorPrecised(amountDivideDecimals(pnlValue, tokenList.find((token) => token.tokenName === "USDM").decimal), 2)}</div>
            </div>
            <div className={`${style["bottom-wrap"]} ${!isAgent ? style["bur"] : ""}`}>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>
                  <div>{t("avaliable")}</div>
                  <Tooltip
                    placement={getIsMobile() ? "top" : "right"}
                    enterTouchDelay={0}
                    title={
                      <>
                        <div>{t("learnMoreTotalFunding")}</div>
                      </>
                    }
                    arrow
                  >
                    <div className={style["tips"]}>?</div>
                  </Tooltip>
                </div>
                <div className={style["li-value"]}>{getAvailableFunding() ? floorPrecised(getAvailableFunding(), 2) : "0.00"}</div>
              </div>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>
                  <div>{t("avaliableFunding")}</div>
                  <Tooltip
                    placement={getIsMobile() ? "top" : "right"}
                    enterTouchDelay={0}
                    title={
                      <>
                        <div>{t("learnMoreAvailableFunding")}</div>
                      </>
                    }
                    arrow
                  >
                    <div className={style["tips"]}>?</div>
                  </Tooltip>
                </div>
                <div className={style["li-value"]}>{getRemainingAvailableFunding() ? floorPrecised(getRemainingAvailableFunding(), 2) : "0.00"}</div>
              </div>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>
                  <div>{t("riskLevel")}</div>
                  <Tooltip
                    placement={getIsMobile() ? "top" : "right"}
                    enterTouchDelay={0}
                    title={
                      <>
                        <div>{`*${t("learnMoreRiskLevel1")}`} </div>
                        <div>{`*${t("learnMoreRiskLevel2")}`}</div>
                      </>
                    }
                    arrow
                  >
                    <div className={style["tips"]}>?</div>
                  </Tooltip>
                </div>
                <div className={style["li-value"]}>
                  {getRiskColorFunction() === "" && <div className={`${style["value-container"]}`}>{floorPrecised(getCurrentRiskLevel(), 2)} %</div>}
                  {getRiskColorFunction() === "#00B4C9" && <div className={`${style["value-container"]} ${style["green"]}`}>{floorPrecised(getCurrentRiskLevel(), 2)} %</div>}
                  {getRiskColorFunction() === "#EBC041" && <div className={`${style["value-container"]} ${style["yellow"]}`}>{floorPrecised(getCurrentRiskLevel(), 2)} %</div>}
                  {getRiskColorFunction() === "#EF6A59" && <div className={`${style["value-container"]} ${style["red"]}`}>{floorPrecised(getCurrentRiskLevel(), 2)} %</div>}
                </div>
              </div>
            </div>
            {!isAgent && (
              <div className={style["get-funding-container"]}>
                {t("getFundingDescription")}
                <span onClick={toggleFundingModal}> {t("enterReferralCode")}</span>
                <GetfundingModal modal={fundingModal} toggle={toggleFundingModal} />
              </div>
            )}
          </div>
        </div>
        <div className={style["price-containers"]}>
          <div className={`${style["price-container"]} ${style["left"]}`} onClick={() => history.push(`/trade/BTCM`)}>
            <div className={style["top"]}>
              <div className={style["card-icon"]}>
                <img src={icon_btcm} alt="total" />
              </div>
              <span> BTC / USD</span>
            </div>
            <div className={style["bottom"]}>
              <span>
                {btcmPriceDifference < 0 && btcmDisplayPrice ? (
                  <div className={style["card-body-down"]}>
                    ${floorPrecised(btcmDisplayPrice, 2)}
                    {
                      <div className={style["card-icon"]}>
                        <img src={icon_arrowdown} alt="down" />
                      </div>
                    }
                  </div>
                ) : (
                  ""
                )}
                {btcmPriceDifference > 0 && btcmDisplayPrice ? (
                  <div className={style["card-body-up"]}>
                    ${floorPrecised(btcmDisplayPrice, 2)}
                    {
                      <div className={style["card-icon"]}>
                        <img src={icon_arrowup} alt="up" />
                      </div>
                    }
                  </div>
                ) : (
                  ""
                )}
                {btcmPriceDifference === 0 && btcmDisplayPrice ? <div className={style["card-body"]}>${floorPrecised(btcmDisplayPrice, 2)}</div> : ""}
              </span>
              <span>
                <div className={style["li-value"]}>
                  {getDisplayBtcmPriceDifference() < 0 ? <div className={style["card-body-down"]}>{floorPrecised(getDisplayBtcmPriceDifference(), 2)}%</div> : ""}
                  {getDisplayBtcmPriceDifference() > 0 ? <div className={style["card-body-up"]}>+{floorPrecised(getDisplayBtcmPriceDifference(), 2)}%</div> : ""}
                  {getDisplayBtcmPriceDifference() === 0 ? <div className={style["card-body"]}>{floorPrecised(getDisplayBtcmPriceDifference(), 2)}%</div> : ""}
                </div>
              </span>
            </div>
          </div>
          <div className={style["price-container"]} onClick={() => history.push(`/trade/ETHM`)}>
            <div className={style["top"]}>
              <div className={style["card-icon"]}>
                <img src={icon_ethm} alt="total" />
              </div>
              <span> ETH / USD</span>
            </div>
            <div className={style["bottom"]}>
              <span>
                {" "}
                {ethmPriceDifference < 0 && ethmDisplayPrice ? (
                  <div className={style["card-body-down"]}>
                    ${floorPrecised(ethmDisplayPrice, 2)}
                    {
                      <div className={style["card-icon"]}>
                        <img src={icon_arrowdown} alt="down" />
                      </div>
                    }
                  </div>
                ) : (
                  ""
                )}
                {ethmPriceDifference > 0 && ethmDisplayPrice ? (
                  <div className={style["card-body-up"]}>
                    ${floorPrecised(ethmDisplayPrice, 2)}
                    {
                      <div className={style["card-icon"]}>
                        <img src={icon_arrowup} alt="up" />
                      </div>
                    }
                  </div>
                ) : (
                  ""
                )}
                {ethmPriceDifference === 0 && ethmDisplayPrice ? <div className={style["card-body"]}>${floorPrecised(ethmDisplayPrice, 2)}</div> : ""}
              </span>
              <span>
                <div className={style["li-value"]}>
                  {getDisplayEthmPriceDifference() < 0 ? <div className={style["card-body-down"]}>{floorPrecised(getDisplayEthmPriceDifference(), 2)}%</div> : ""}
                  {getDisplayEthmPriceDifference() > 0 ? <div className={style["card-body-up"]}>+{floorPrecised(getDisplayEthmPriceDifference(), 2)}%</div> : ""}
                  {getDisplayEthmPriceDifference() === 0 ? <div className={style["card-body"]}>{floorPrecised(getDisplayEthmPriceDifference(), 2)}%</div> : ""}
                </div>
              </span>
            </div>
          </div>
        </div>
        <div className={style["record-container"]}>
          <div className={style["table-wrapper"]}>
            <div className={style["table-header"]}>
              <div>{t("currency")}</div>
              <div>{t("balance")}</div>
              <div>{t("value")}</div>
            </div>
            <div className={`${style["table-body"]} ${btcmActive && style["table-body-active"]}`}>
              <div className={style["table-body-top"]} onClick={() => setBtcmActive(!btcmActive)}>
                <div className={style["token-name"]}>
                  <div className={style["card-icon"]}>
                    <img src={icon_btcm} alt="total" />
                  </div>
                  <span> BTC</span>
                </div>
                <div>{btcmCredit && floorPrecised(btcmCredit.realizedBalance - btcmCredit.interest)}</div>
                <div>$ {getBtcmUsdmEquivalent()}</div>
              </div>
              <div className={`${style["table-body-bottom"]}`}>
                <div className={style["borrowing"]}>
                  <div className={style["li-label"]}>
                    <div>
                      <div>{t("borrowingRate")} </div>
                      <Tooltip
                        placement={getIsMobile() ? "top" : "right"}
                        enterTouchDelay={0}
                        title={
                          <>
                            <div>{t("learnMoreBorrowingRate")}</div>
                          </>
                        }
                        arrow
                      >
                        <div className={style["tips"]}>?</div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className={style["li-value"]}>{btcmHourlyInterest && amountDivideDecimals(btcmHourlyInterest, 7)}%</div>
                </div>
                <div className={style["close-position"]} onClick={() => closePositionButtonOnClick("BTCM")}>
                  <span>
                    <div>{t("closePosition")}</div>
                  </span>
                </div>
              </div>
            </div>
            <div className={`${style["table-body"]} ${ethmActive && style["table-body-active"]}`}>
              <div className={style["table-body-top"]} onClick={() => setEthmActive(!ethmActive)}>
                <div className={style["token-name"]}>
                  <div className={style["card-icon"]}>
                    <img src={icon_ethm} alt="total" />
                  </div>
                  <span> ETH</span>
                </div>
                <div>{ethmCredit && floorPrecised(ethmCredit.realizedBalance - ethmCredit.interest)}</div>
                <div>$ {getEthmUsdmEquivalent()}</div>
              </div>
              <div className={`${style["table-body-bottom"]}`}>
                <div className={style["borrowing"]}>
                  <div className={style["li-label"]}>
                    <div>
                      <div>{t("borrowingRate")} </div>
                      <Tooltip
                        placement={getIsMobile() ? "top" : "right"}
                        enterTouchDelay={0}
                        title={
                          <>
                            <div>{t("learnMoreBorrowingRate")}</div>
                          </>
                        }
                        arrow
                      >
                        <div className={style["tips"]}>?</div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className={style["li-value"]}>{ethmHourlyInterest && amountDivideDecimals(ethmHourlyInterest, 7)}%</div>
                </div>
                <div className={style["close-position"]} onClick={() => closePositionButtonOnClick("ETHM")}>
                  <span>
                    {" "}
                    {/* <div className={style["card-icon"]}>
                      <img src={icon_transfer} alt="total" />
                    </div> */}
                    <div>{t("closePosition")}</div>
                  </span>
                </div>
              </div>
            </div>
            <div className={`${style["table-body"]} ${usdmActive && style["table-body-active"]}`}>
              <div className={style["table-body-top"]} onClick={() => setUsdmActive(!usdmActive)}>
                <div className={style["token-name"]}>
                  <div className={style["card-icon"]}>
                    <img src={icon_usdm} alt="total" />
                  </div>
                  <span>USD</span>
                </div>
                <div>{usdmCredit && floorPrecised(usdmCredit.realizedBalance - usdmCredit.interest)}</div>
                <div>$ {usdmCredit && floorPrecised(usdmCredit.usdmEquivalent, 2)}</div>
              </div>
              <div className={`${style["table-body-bottom"]} ${style["table-body-center"]}`}>
                <div className={style["borrowing"]}>
                  <div className={style["li-label"]}>
                    <div>
                      <div>{t("borrowingRate")} </div>
                      <Tooltip
                        placement={getIsMobile() ? "top" : "right"}
                        enterTouchDelay={0}
                        title={
                          <>
                            <div>{t("learnMoreBorrowingRate")}</div>
                          </>
                        }
                        arrow
                      >
                        <div className={style["tips"]}>?</div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className={style["li-value"]}>{usdmHourlyInterest && amountDivideDecimals(usdmHourlyInterest, 7)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TransferFundModal
        modal={depositModal}
        toggle={toggleDeposit}
        amount={amount}
        setSelectedToken={setSelectedToken}
        selectedToken={selectedToken}
        btcmCredit={btcmCredit}
        ethmCredit={ethmCredit}
        usdmCredit={usdmCredit}
        btcmDisplayBalance={btcmDisplayBalance}
        ethmDisplayBalance={ethmDisplayBalance}
        usdmDisplayBalance={usdmDisplayBalance}
      />
      <ProfitAndLossChartModal modal={profitAndLossChartModal} toggle={toggleProfitAndLossChartModal} />
    </>
  );
};

export default Dashboard;
