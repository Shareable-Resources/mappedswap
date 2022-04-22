import style from "./PoolInfo.module.scss";
import {Container, Row} from "reactstrap";
import icon_btcmPair from "../../asset/icon_btcmPair.svg";
import icon_ethmPair from "../../asset/icon_ethmPair.svg";
import {useState, useEffect} from "react";
import {amountDivideDecimals, getPairReserve, floorPrecised, tokenFormater, getPairDetail} from "../../web3";
import {getTokenList, getTransactionFeeRatio} from "../../store";
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {tokenTradeVolume, tokenLatestPrice, tokenHistoryPrice} from "../../api";
import axios from "axios";
import notify from "../../component/Toast";
import PriceHistories from "./PriceHistories";
import {useHistory} from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const PoolInfo = ({defaultTokenName, isMobile}) => {
  const transactionFee = getTransactionFeeRatio();
  const history = useHistory();
  const [direction, setDirection] = useState(0);
  const {t} = useTranslation();
  let {selectedTradeToken} = useParams();
  const tokenList = getTokenList();
  const baseToken = tokenList.find(({tokenName}) => tokenName === "USDM");
  const [tradeToken, setTradeToken] = useState(isMobile ? tokenList.find(({tokenName}) => tokenName === "BTCM") : tokenList.find(({tokenName}) => tokenName === defaultTokenName));
  const [baseTokenReserve, setBaseTokenReserve] = useState("");
  const [tradeTokenReserve, setTradeTokenReserve] = useState("");
  const [tradeVolume, setTradeVolume] = useState("0");
  const [selectedChartTab, setSelectedChartTab] = useState("chart");
  const [volumeDiff, setVolumeDiff] = useState(0);
  const [pairInfo, setPairInfo] = useState(null);
  const [chartCurrentPrice, setChartCurrentPrice] = useState({});
  const [chartHistoryPrice, setChartHistoryPrice] = useState("");
  const [historyVolume, setHistoryReserve] = useState("");

  useEffect(() => {
    initiateDetail();
  }, [selectedTradeToken, defaultTokenName, tradeToken]);

  async function initiateDetail() {
    try {
      await getLatestPrice();
      await getHistoryPrice();
      await getReserve();
      await getPairInfo();
      await getVolume();
    } catch (error) {
      console.log("initiateDetail", error);
    }
  }

  async function getReserve() {
    try {
      const pairReserveInfo = await getPairReserve(baseToken.tokenName, tradeToken.tokenName);
      setBaseTokenReserve(pairReserveInfo.token0);
      setTradeTokenReserve(pairReserveInfo.token1);
    } catch (error) {
      console.error("Get Reserve error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getVolume() {
    const duration = "24";
    try {
      let TRADEVOLUMEAPI = tokenTradeVolume(`${tradeToken.tokenName}/${baseToken.tokenName}`, duration);
      let response = await axios.get(TRADEVOLUMEAPI);
      if (response.data.success && response.data.data) {
        const sumOfVolume24 = amountDivideDecimals(Number(response.data.data[0].sumOfVolume), 6);
        const sumOfVolume48 = amountDivideDecimals(Number(response.data.data[1].sumOfVolume), 6);
        let volumeDiffInput = 0;
        if (sumOfVolume24 === 0 && sumOfVolume48 === 0) {
          volumeDiffInput = 0;
        } else if (sumOfVolume48 === 0) {
          volumeDiffInput = 100;
        } else {
          volumeDiffInput = ((sumOfVolume24 - sumOfVolume48) / sumOfVolume48) * 100;
        }
        setVolumeDiff(volumeDiffInput);
        setTradeVolume(sumOfVolume24);
      }
    } catch (error) {
      console.error("getVolume error", error);
      notify("warn", t("networkError"));
    }
  }

  function getDisplayTradeTokenReserve() {
    if (tradeTokenReserve && tradeToken.decimal) {
      return floorPrecised(amountDivideDecimals(tradeTokenReserve, tradeToken.decimal), 2);
    } else {
      return "0";
    }
  }

  function getDisplayBaseTokenReserve() {
    if (baseTokenReserve && baseToken.decimal) {
      return floorPrecised(amountDivideDecimals(baseTokenReserve, baseToken.decimal), 2);
    } else {
      return "0";
    }
  }

  async function getPairInfo() {
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

  async function getLatestPrice() {
    try {
      let _pairInfo = pairInfo;
      if (!pairInfo) {
        _pairInfo = await getPairInfo();
      }

      let response = await axios.get(tokenLatestPrice());
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
        setChartCurrentPrice({btcPrice: btcPrice, ethPrice: ethPrice});
      }
    } catch (error) {
      console.error("getVolume error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getHistoryPrice() {
    try {
      let _pairInfo = pairInfo;
      if (!pairInfo) {
        _pairInfo = await getPairInfo();
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
        setChartHistoryPrice(tradeTokenPrice);
        setHistoryReserve(baseTokenReserve * 2);
      }
    } catch (error) {
      console.error("getVolume error", error);
      notify("warn", t("networkError"));
    }
  }

  function getVolumeDiff() {
    if (historyVolume && baseTokenReserve && baseToken.decimal) {
      const latestVolume = amountDivideDecimals(baseTokenReserve, baseToken.decimal) * 2;
      return ((latestVolume - historyVolume) / historyVolume) * 100;
    }
  }

  function getDisplayHandlingFee() {
    let displayHandlingFee = 0;
    if (tradeVolume && tradeToken.decimal) {
      if (direction === 0) {
        displayHandlingFee = tradeVolume * transactionFee;
      } else {
        displayHandlingFee = tradeVolume * transactionFee;
      }
    }
    return floorPrecised(displayHandlingFee, 2);
  }

  function directToken(selectedTradeToken) {
    history.push(`/info/pool/${selectedTradeToken}`);
    setTradeToken(tokenList.find(({tokenName}) => tokenName === selectedTradeToken));
  }

  return (
    <>
      <div className={style["quote-container"]}>
        {isMobile && (
          <div className={`${style["top-select-container"]}`}>
            <div className={`${style["token-select-container"]}`}>
              <FormControl>
                <Select value={tradeToken.tokenName} displayEmpty inputProps={{"aria-label": "Without label"}}>
                  <MenuItem value={"BTCM"} onClick={() => directToken("BTCM")}>
                    <span>
                      <div className={style["card-icon"]}>
                        <img src={icon_btcmPair} alt="selected-token" />
                      </div>
                    </span>
                    <span className={style["card-name"]}>BTC - USD</span>
                  </MenuItem>
                  <MenuItem value={"ETHM"} onClick={() => directToken("ETHM")}>
                    <span>
                      <div className={style["card-icon"]}>
                        <img src={icon_ethmPair} alt="selected-token" />
                      </div>
                    </span>
                    <span className={style["card-name"]}>ETH - USD</span>
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        )}
        {!isMobile && (
          <div className={`${style["top-select-container"]}`}>
            <div className={`${style["token-select-container"]}`}>
              <div className={`${style["token-name"]}`}>
                <div className={style["card-icon"]}>
                  <img src={tradeToken?.pairIcon} alt="ethm" />
                </div>
                <span>{`${tokenFormater(tradeToken.tokenName)}`} - USD</span>
              </div>
            </div>
          </div>
        )}
        <div className={`${style["quote-left"]}`}>
          <div className={`${style["chart-container"]}`}>
            {selectedChartTab === "chart" && (
              <div className={style["chart-wrapper"]}>
                <div className={style["large-stat-container"]}>
                  <div className={style["stat-container"]}>
                    <div className={style["card-container"]}>
                      <div className={style["card-body-wrapper"]}>
                        <div className={style["card-header"]}>{t("totalLiquidity")}</div>
                        <div className={style["card-body"]}>${baseTokenReserve && baseToken.decimal ? floorPrecised(amountDivideDecimals(baseTokenReserve, baseToken.decimal) * 2, 2) : 0}</div>
                      </div>
                      <div className={style["card-footer"]}>
                        {getVolumeDiff() > 0 ? <div className={`${style["card-footer"]} ${style["positive"]}`}> +{floorPrecised(getVolumeDiff(), 2)}%</div> : ""}
                        {getVolumeDiff() < 0 ? <div className={`${style["card-footer"]} ${style["negative"]}`}> {floorPrecised(getVolumeDiff(), 2)}%</div> : ""}
                        {getVolumeDiff() === 0 ? <div className={`${style["card-footer"]}`}> {""}</div> : ""}
                      </div>
                    </div>
                    <div className={style["card-container"]}>
                      <div className={style["card-body-wrapper"]}>
                        <div className={`${style["card-header"]} ${style["card-header-volume"]}`}>{t("totalVolume24")}</div>
                        <div className={style["card-body"]}>${floorPrecised(tradeVolume, 2)}</div>
                      </div>
                      {volumeDiff > 0 && <div className={`${style["card-footer"]} ${style["positive"]}`}> +{volumeDiff && floorPrecised(volumeDiff, 2)}%</div>}
                      {volumeDiff < 0 && <div className={`${style["card-footer"]} ${style["negative"]}`}> {volumeDiff && floorPrecised(volumeDiff, 2)}%</div>}
                      {volumeDiff === 0 && <div className={`${style["card-footer"]}`}> {""}</div>}
                    </div>
                    <div className={style["card-container"]}>
                      <div className={style["card-body-wrapper"]}>
                        <div className={style["card-header"]}>{t("handleFee24")}</div>
                        <div className={style["card-body"]}>${getDisplayHandlingFee()}</div>
                      </div>
                      <div className={style["card-footer"]}></div>
                    </div>
                  </div>
                  {/* <div className={style['title-header']}><div id={style['dot']}></div>{t('poolToken')}</div> */}
                  <div className={style["pooled-container"]}>
                    <div className={style["card-header"]}>{t("poolToken")}</div>
                    <div className={style["tokens-container"]}>
                      <div className={`${style["token-container"]} ${style["top-container"]}`}>
                        <div className={style["li-label"]}>
                          <div className={style["card-icon"]}>
                            <img src={tradeToken.tokenIcon} alt="ethm" />
                          </div>
                          {tokenFormater(tradeToken.tokenName)}
                        </div>
                        <div className={style["li-value"]}>{getDisplayTradeTokenReserve()}</div>
                      </div>
                      <div className={style["token-container"]}>
                        <div className={style["li-label"]}>
                          <div className={style["card-icon"]}>
                            <img src={baseToken.tokenIcon} alt="usdm" />
                          </div>
                          {tokenFormater(baseToken.tokenName)}
                        </div>
                        <div className={style["li-value"]}>{getDisplayBaseTokenReserve()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <>
              <PriceHistories pairName={`${tradeToken.tokenName}/USDM`} pairInfo={pairInfo} baseToken={baseToken} tradeToken={tradeToken} />
            </>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoolInfo;
