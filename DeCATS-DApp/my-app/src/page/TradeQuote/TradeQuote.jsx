import style from "./TradeQuote.module.scss";
import {Container, Row} from "reactstrap";
import icon_ethmPair from "../../asset/icon_ethmPair.svg";
import icon_btcmPair from "../../asset/icon_btcmPair.svg";
import icon_arrowup from "../../asset/icon_arrowup.svg";
import icon_arrowdown from "../../asset/icon_arrowdown.svg";
import icon_dropdownSelect from "../../asset/icon_dropdownselect.svg";
import icon_price_inactive from "../../asset/icon_price_inactive.svg";
import icon_price_active from "../../asset/icon_price_active.svg";
import icon_record_inactive from "../../asset/icon_record_inactive.svg";
import icon_record_active from "../../asset/icon_record_active.svg";
import {useState, useEffect} from "react";
import {useHistory} from "react-router";
import {buyToken, sellToken, getTransaction, amountDivideDecimals, getCustomerInfo, getPairReserve, floorPrecised, amountMultipleDecimals, getAssetDetails, truncateNum, tokenFormater, getPairDetail, truncateNumforCP} from "../../web3";
import {getIsMobile, getToken, getTokenList, getTransactionFeeRatio} from "../../store";
import Navbar from "../../component/Navbar";
import {useParams, useLocation} from "react-router-dom";
import {buyTradeToken, sellTradeToken, buyBaseToken, sellBaseToken} from "../../uniswap";
import {useTranslation} from "react-i18next";
import {tokenLatestPrice, tokenHistoryPrice} from "../../api";
import {sleep, getAvailableFunding, bigNumberAbsoluteValue, bigNumberSum, bigNumberMinus, bigNumberDivided, bigNumberTimes, bigNumberToFixed, bigNumberCompare, isNumber, getErrorMsgKey} from "../../utils";
import axios from "axios";
import notify from "../../component/Toast";
import NumberFormat from "react-number-format";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "../../component/Footer";
import Slider from "../../component/Slider";
import TradeQuoteLeft from "./TradeQuoteLeft";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import {logEvent, getAnalytics} from "firebase/analytics";
import Tooltip from "@mui/material/Tooltip";

const TradeQuote = () => {
  const {t} = useTranslation();
  const token = getToken();

  let {selectedTradeToken} = useParams();
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  const isClosePosition = searchParams.get("closePosition") === "1" || searchParams.get("closePosition") === "2" ? true : false;
  const inputClosePosition = searchParams.get("closePosition");
  const [isClosePositionCompleted, setIsClosePositionCompleted] = useState(false);

  const updatePriceInterval = 5000;
  const [updatePriceTimestamp, setUpdatePriceTimestamp] = useState(0);
  const [isUpdatePriceJobStartBol, setIsUpdatePriceJobStartBol] = useState(false);
  let defaultDirection = "buy";
  if (isClosePosition && inputClosePosition === "1") {
    defaultDirection = "sell";
  }
  const [selectedDirection, setSelectedDirection] = useState(defaultDirection);
  const [isLoading, setIsLoading] = useState(false);
  const [isCardCollpase2, setCardCollpase2] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [selectedMobileDetailTab, setSelectedMobileDetailTab] = useState("");
  const history = useHistory();
  const transactionFeeRatio = getTransactionFeeRatio();

  const tokenList = getTokenList();
  const baseToken = tokenList.find(({tokenName}) => tokenName === "USDM");
  const [tradeToken, setTradeToken] = useState(tokenList.find(({tokenName}) => tokenName === selectedTradeToken));
  const [sizeInputValue, setSizeInputValue] = useState("");
  const [amountInputValue, setAmountInputValue] = useState("");
  const [customerInfo, setCustomerInfo] = useState(null);
  const [pairInfo, setPairInfo] = useState(null);
  const [allPairInfo, setAllPairInfo] = useState(null);
  const [allTradeTokenCurrentPrice, setAllTradeTokenCurrentPrice] = useState(null);
  const [priceShock, setPriceShock] = useState(0);
  const [estTransactionPrice, setEstTransactionPrice] = useState(0);
  const [minMaxAmountObj, setMinMaxAmountObj] = useState(null);

  const [maxSpotAmount, setMaxSpotAmount] = useState(0);
  const [maxMarginAmount, setMaxMarginAmount] = useState(0);
  const [maxRepayAmount, setMaxRepayAmount] = useState(0);

  const [tradeTokenCurrentPrice, setTradeTokenCurrentPrice] = useState(0);
  const [tradeTokenLastPrice, setTradeTokenLastPrice] = useState(0);
  const [tradeTokenHistoryPrice, setTradeTokenHistoryPrice] = useState(0);
  const [historyRecordLastUpdated, setHistoryRecordLastUpdated] = useState(Date.now);

  const [transactionTabDisplay, setTransactionTabDisplay] = useState(false);
  const [chartTabDisplay, setChartTabDisplay] = useState(false);

  useEffect(() => {
    initiatePage();
  }, []);

  useEffect(() => {
    const _selectedTradeToken = tokenList.find(({tokenName}) => tokenName === selectedTradeToken);
    if (_selectedTradeToken && _selectedTradeToken.tokenName) {
      setTradeToken(_selectedTradeToken);
    } else {
      history.push("/trade/BTCM");
    }
    initiatePage();
  }, [selectedTradeToken]);

  useEffect(() => {
    initiateParams();
  }, [selectedDirection]);

  useEffect(async () => {
    try {
      if (tradeToken && tradeToken.tokenName && allPairInfo && allPairInfo["BTCM"] && allPairInfo["BTCM"].token0Name && allPairInfo["ETHM"] && allPairInfo["ETHM"].token0Name) {
        let _tokenLatestPriceResponse = await axios.get(tokenLatestPrice(), {
          headers: {Authorization: token},
        });
        const _tokenLatestPriceData = _tokenLatestPriceResponse.data;
        if (_tokenLatestPriceData && _tokenLatestPriceData.returnCode === 0 && _tokenLatestPriceData.data && _tokenLatestPriceData.data.length === 2) {
          const price0 = _tokenLatestPriceData.data[0];
          const price1 = _tokenLatestPriceData.data[1];
          let _allTradeTokenCurrentPrice = {};
          if (price0.pairName.includes("BTCM")) {
            let _baseReserveBtcm = amountDivideDecimals(price0.reserve1, 6);
            let _tradeReserveBtcm = amountDivideDecimals(price0.reserve0, 18);
            if (allPairInfo["BTCM"].token0Name === "USDM") {
              _baseReserveBtcm = amountDivideDecimals(price0.reserve0, 6);
              _tradeReserveBtcm = amountDivideDecimals(price0.reserve1, 18);
            }
            _allTradeTokenCurrentPrice["BTCM"] = bigNumberDivided(_baseReserveBtcm, _tradeReserveBtcm);

            let _baseReserveEthm = amountDivideDecimals(price1.reserve1, 6);
            let _tradeReserveEthm = amountDivideDecimals(price1.reserve0, 18);
            if (allPairInfo["ETHM"].token0Name === "USDM") {
              _baseReserveEthm = amountDivideDecimals(price1.reserve0, 6);
              _tradeReserveEthm = amountDivideDecimals(price1.reserve1, 18);
            }
            _allTradeTokenCurrentPrice["ETHM"] = bigNumberDivided(_baseReserveEthm, _tradeReserveEthm);
          } else if (price1.pairName.includes("BTCM")) {
            let _baseReserveBtcm = amountDivideDecimals(price1.reserve1, 6);
            let _tradeReserveBtcm = amountDivideDecimals(price1.reserve0, 18);
            if (allPairInfo["BTCM"].token0Name === "USDM") {
              _baseReserveBtcm = amountDivideDecimals(price1.reserve0, 6);
              _tradeReserveBtcm = amountDivideDecimals(price1.reserve1, 18);
            }
            _allTradeTokenCurrentPrice["BTCM"] = bigNumberDivided(_baseReserveBtcm, _tradeReserveBtcm);

            let _baseReserveEthm = amountDivideDecimals(price0.reserve1, 6);
            let _tradeReserveEthm = amountDivideDecimals(price0.reserve0, 18);
            if (allPairInfo["ETHM"].token0Name === "USDM") {
              _baseReserveEthm = amountDivideDecimals(price0.reserve0, 6);
              _tradeReserveEthm = amountDivideDecimals(price0.reserve1, 18);
            }
            _allTradeTokenCurrentPrice["ETHM"] = bigNumberDivided(_baseReserveEthm, _tradeReserveEthm);
          }

          if (_allTradeTokenCurrentPrice) {
            // console.log("getLatestPrice _allTradeTokenCurrentPrice: ", _allTradeTokenCurrentPrice)
            setAllTradeTokenCurrentPrice(_allTradeTokenCurrentPrice);
            setTradeTokenLastPrice(tradeTokenCurrentPrice);
            setTradeTokenCurrentPrice(_allTradeTokenCurrentPrice[tradeToken.tokenName]);
          }
        }
      }
    } catch (error) {
      console.log("getLatestPrice error", error);
    }
    await sleep(updatePriceInterval);
    setUpdatePriceTimestamp(Date.now);
  }, [updatePriceTimestamp]);

  useEffect(() => {
    if (isClosePositionCompleted) {
      if (inputClosePosition === "1") {
        // console.log("####### useEffect isClosePosition maxSpotAmount:", maxSpotAmount)
        updateSizeInputValue(maxSpotAmount);
      } else if (inputClosePosition === "2") {
        // console.log("####### useEffect isClosePosition maxRepayAmount:", maxRepayAmount)
        updateSizeInputValue(maxRepayAmount);
      }
    }
  }, [isClosePositionCompleted]);

  useEffect(async () => {
    if (customerInfo && pairInfo) {
      await getMaxSpotAmount();
      await getMaxMarginAmount();
      await getMaxRepayAmount();
      if (!isClosePositionCompleted && isClosePosition) {
        setIsClosePositionCompleted(true);
      }
    }
    if (pairInfo && !isUpdatePriceJobStartBol) {
      setIsUpdatePriceJobStartBol(true);
      setUpdatePriceTimestamp(Date.now);
    }
  }, [selectedDirection, customerInfo, pairInfo]);

  function initiateParams() {
    if (selectedTradeToken) {
      setTradeToken(tokenList.find(({tokenName}) => tokenName === selectedTradeToken));
      setSizeInputValue("");
      setAmountInputValue("");
      setPriceShock(0);
      setEstTransactionPrice(0);
      setMinMaxAmountObj(null);
    }
  }

  async function initiatePage() {
    initiateParams();
    try {
      setIsLoading(true);
      await updateCustomerInfo();
      await getPairInfo();
      // await getPairInfo()
      // await fetchToken()
    } catch (error) {
      console.log("initiatePage", error);
    }
    setIsLoading(false);
  }

  async function updateCustomerInfo() {
    try {
      const customerInfo = await getCustomerInfo();
      if (customerInfo) {
        setCustomerInfo(customerInfo);
        console.log("updateCustomerInfo customerInfo: ", customerInfo);
      }
    } catch (error) {
      console.error("updateCustomerInfo error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getPairInfo() {
    try {
      const _tokenList = ["BTCM", "ETHM"];
      let _allPairInfo = {};
      let _allTradeTokenHistoryPrice = {};
      for (let index = 0; index < _tokenList.length; index++) {
        const tokenListEle = _tokenList[index];
        const pairInfo = await getPairDetail(tokenListEle, "USDM");
        console.log("getPairInfo tokenListEle: ", tokenListEle);
        console.log("getPairInfo pairInfo: ", pairInfo);
        if (pairInfo && pairInfo.token0Reserve && pairInfo.token1Reserve) {
          if (pairInfo.token0Name === "USDM") {
            _allPairInfo[tokenListEle] = {
              tradeTokenReserve: pairInfo.token1Reserve,
              baseTokenReserve: pairInfo.token0Reserve,
              token0Name: "USDM",
              token1Name: tokenListEle,
            };
          } else {
            _allPairInfo[tokenListEle] = {
              tradeTokenReserve: pairInfo.token0Reserve,
              baseTokenReserve: pairInfo.token1Reserve,
              token1Name: "USDM",
              token0Name: tokenListEle,
            };
          }
          let tokenHistoryPriceResponse = await axios.get(tokenHistoryPrice(`${tokenListEle}/${baseToken.tokenName}`));
          const tokenHistoryPriceData = tokenHistoryPriceResponse.data;
          if (tokenHistoryPriceData && tokenHistoryPriceData.returnCode === 0 && tokenHistoryPriceData.data) {
            const price0 = tokenHistoryPriceData.data;

            let _baseTokenHistoryReserve = amountDivideDecimals(price0.reserve1, baseToken.decimal);
            let _tradeTokenHistoryReserve = amountDivideDecimals(price0.reserve0, tradeToken.decimal);
            if (pairInfo.token0Name === "USDM") {
              _baseTokenHistoryReserve = amountDivideDecimals(price0.reserve0, baseToken.decimal);
              _tradeTokenHistoryReserve = amountDivideDecimals(price0.reserve1, tradeToken.decimal);
            }
            _allTradeTokenHistoryPrice[tokenListEle] = bigNumberDivided(_baseTokenHistoryReserve, _tradeTokenHistoryReserve);
          }
        }
      }
      if (_allPairInfo && _allTradeTokenHistoryPrice) {
        console.log("_allPairInfo: ", _allPairInfo);
        console.log("_allTradeTokenHistoryPrice: ", _allTradeTokenHistoryPrice);
        setAllPairInfo(_allPairInfo);
        if (tradeToken && tradeToken.tokenName) {
          setPairInfo(_allPairInfo[tradeToken.tokenName]);
          setTradeTokenHistoryPrice(_allTradeTokenHistoryPrice[tradeToken.tokenName]);
        }
      }
    } catch (error) {
      console.error("getPairInfo error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getMaxRepayAmount() {
    let _maxRepayAmount = 0;
    if (tradeToken && tradeToken.tokenName && baseToken && baseToken.tokenName && pairInfo) {
      if (selectedDirection === "buy") {
        const _tradeBalance = getTokenBalanceFromCustomerInfo(tradeToken.tokenName);
        // console.log("getMaxRepayAmount _tradeBalance:", _tradeBalance)
        if (_tradeBalance < 0) {
          _maxRepayAmount = Math.abs(bigNumberToFixed(amountDivideDecimals(_tradeBalance, tradeToken.decimal), 6));
        }
      } else if (selectedDirection === "sell") {
        const _baseBalance = getTokenBalanceFromCustomerInfo(baseToken.tokenName);
        // console.log("getMaxRepayAmount _baseBalance:", _baseBalance)
        if (_baseBalance < 0) {
          const _absBaseBalance = Math.abs(_baseBalance);
          const buyBaseTokenResult = await buyBaseToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, _absBaseBalance);
          // console.log("getMaxSpotAmount buyBaseTokenResult:", buyBaseTokenResult)
          _maxRepayAmount = amountDivideDecimals(buyBaseTokenResult.maxAmountIn, tradeToken.decimal);
        }
      }
    }
    setMaxRepayAmount(parseFloat(bigNumberToFixed(_maxRepayAmount, 6)));
  }

  async function getMaxSpotAmount() {
    let _maxAmount = 0;
    if (tradeToken && tradeToken.tokenName && pairInfo) {
      if (selectedDirection === "buy") {
        const _usdmBalance = getTokenBalanceFromCustomerInfo("USDM");
        // console.log("getMaxSpotAmount _usdmBalance:", _usdmBalance)
        if (_usdmBalance > 0) {
          const sellBaseTokenResult = await sellBaseToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, _usdmBalance);
          // console.log("getMaxSpotAmount sellBaseTokenResult:", sellBaseTokenResult)
          _maxAmount = amountDivideDecimals(sellBaseTokenResult.minAmountOut, tradeToken.decimal);
        }
      } else if (selectedDirection === "sell") {
        const _tradeBalance = getTokenBalanceFromCustomerInfo(tradeToken.tokenName);
        // console.log("getMaxSpotAmount _tradeBalance:", _tradeBalance)
        if (_tradeBalance > 0) {
          _maxAmount = amountDivideDecimals(_tradeBalance, tradeToken.decimal);
        }
      }
    }
    setMaxSpotAmount(parseFloat(bigNumberToFixed(_maxAmount, 6)));
  }

  async function getMaxMarginAmount() {
    let _maxAmount = 0;
    if (tradeToken && tradeToken.tokenName && pairInfo) {
      if (selectedDirection === "buy") {
        let _usdmBalance = getTokenBalanceFromCustomerInfo("USDM");
        // console.log("getMaxMarginAmount _usdmBalance:", _usdmBalance)
        if (_usdmBalance < 0) {
          _usdmBalance = 0;
        }
        let _fundingLeft = getFundingLeft();
        // console.log("getMaxMarginAmount _fundingLeft:", _fundingLeft)
        if (_fundingLeft < 0) {
          _fundingLeft = 0;
        }
        if (_fundingLeft > 0 || _usdmBalance > 0) {
          const sellBaseTokenResult = await sellBaseToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, bigNumberSum(_fundingLeft, _usdmBalance));
          // console.log("getMaxMarginAmount sellBaseTokenResult:", sellBaseTokenResult)
          _maxAmount = amountDivideDecimals(sellBaseTokenResult.minAmountOut, tradeToken.decimal);
        }
      } else if (selectedDirection === "sell") {
        let _tradeBalance = getTokenBalanceFromCustomerInfo(tradeToken.tokenName);
        // console.log("getMaxMarginAmount _tradeBalance:", _tradeBalance)
        let _baseTokenReserve = pairInfo.baseTokenReserve;
        let _tradeTokenReserve = pairInfo.tradeTokenReserve;
        // console.log("getMaxMarginAmount _baseTokenReserve:", _baseTokenReserve)
        // console.log("getMaxMarginAmount _tradeTokenReserve:", _tradeTokenReserve)
        if (_tradeBalance > 0) {
          const sellTradeTokenResult = await sellTradeToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, _tradeBalance);
          // console.log("getMaxMarginAmount sellTradeTokenResult:", sellTradeTokenResult)
          _baseTokenReserve = bigNumberMinus(_baseTokenReserve, sellTradeTokenResult.amountOut);
          _tradeTokenReserve = bigNumberSum(_tradeTokenReserve, _tradeBalance);
          // console.log("getMaxMarginAmount _baseTokenReserve:", _baseTokenReserve)
          // console.log("getMaxMarginAmount _tradeTokenReserve:", _tradeTokenReserve)
        } else {
          _tradeBalance = 0;
        }
        let _sellBaseTokenResultAmount = 0;
        const _fundingLeft = getFundingLeft();
        // console.log("getMaxMarginAmount _fundingLeft:", _fundingLeft)
        if (_fundingLeft > 0) {
          const sellBaseTokenResult = await sellBaseToken(tradeToken.tokenName, _baseTokenReserve, _tradeTokenReserve, _fundingLeft);
          // console.log("getMaxMarginAmount sellBaseTokenResult:", sellBaseTokenResult)
          if (sellBaseTokenResult) {
            _sellBaseTokenResultAmount = sellBaseTokenResult.minAmountOut;
          }
        }
        _maxAmount = amountDivideDecimals(bigNumberSum(_tradeBalance, _sellBaseTokenResultAmount), tradeToken.decimal);
      }
    }
    setMaxMarginAmount(parseFloat(bigNumberToFixed(_maxAmount, 6)));
  }

  async function confirmBtnOnClick(event) {
    event.preventDefault();
    logEvent(getAnalytics(), `trade_confirm`);
    if (!isLoading && customerInfo && pairInfo && tradeToken && tradeToken.tokenName && baseToken && baseToken.tokenName && sizeInputValue && minMaxAmountObj && minMaxAmountObj.displayAmount) {
      console.log("confirmBtnOnClick start");
      setIsLoading(true);
      try {
        const _maxInputValue = getMaxInputValue();
        const _usedCredit = getUserUsedFunding();
        const _availableFunding = getUserAvailableFunding();
        let _insufficientAvailableFundingBol = false;
        let _inputTooHighBol = false;
        if (bigNumberCompare(sizeInputValue, _maxInputValue) > 0) {
          _inputTooHighBol = true;
        }
        if (bigNumberCompare(_usedCredit, 0) > 0 && bigNumberCompare(_usedCredit, _availableFunding) > 0) {
          if (selectedDirection === "buy") {
            let _tradeBalance = getDisplayTokenBalance(tradeToken.tokenName);
            const _displayBorrowingAmount = getDisplayBorrowingAmount();
            if (bigNumberCompare(_displayBorrowingAmount, 0) > 0 && bigNumberCompare(_tradeBalance, 0) > 0) {
              _insufficientAvailableFundingBol = true;
            }
          } else if (selectedDirection === "sell") {
            const _displayBorrowingAmount = getDisplayBorrowingAmount();
            if (bigNumberCompare(_displayBorrowingAmount, 0) > 0) {
              _insufficientAvailableFundingBol = true;
            }
          }
        }
        if (_insufficientAvailableFundingBol) {
          notify("warn", t("insufficientAvailableFunding"));
        } else if (_inputTooHighBol) {
          notify("warn", t("inputTooHigh"));
        } else {
          const pairName = `${tradeToken.tokenName}/${baseToken.tokenName}`;
          let txnHash = "";
          if (selectedDirection === "buy") {
            txnHash = await buyToken(pairName, tradeToken.tokenName, baseToken.tokenName, sizeInputValue, minMaxAmountObj.displayAmount);
          } else if (selectedDirection === "sell") {
            txnHash = await sellToken(pairName, tradeToken.tokenName, baseToken.tokenName, sizeInputValue, minMaxAmountObj.displayAmount);
          }
          if (txnHash) {
            console.log("txnHash", txnHash);
            await getTransactionReceipt(txnHash);
          } else {
            console.log("confirmBtnOnClick txnHash:", txnHash);
            notify("warn", t("transactionFailed"));
          }
        }
      } catch (error) {
        console.log("confirmBtnOnClick error:", error);
        notify("warn", t(getErrorMsgKey(error, "transactionFailed")));
      }
      setIsLoading(false);
    }
  }

  async function getTransactionReceipt(txnHash) {
    console.log("getTransactionReceipt txnHash", txnHash);
    try {
      let keepDoingBol = true;
      while (keepDoingBol) {
        let txnData = await getTransaction(txnHash);
        console.log("getTransactionReceipt txnData", txnData);
        if (txnData && txnData.txn_id) {
          keepDoingBol = false;
          if (txnData.status == false) {
            notify("primary", t("transactionFailed"));
          } else {
            notify("primary", t("transactionSuccess"));
            await initiatePage();
            setHistoryRecordLastUpdated(Date.now);
          }
        } else {
          await sleep(2000);
        }
      }
    } catch (error) {
      console.error("getTransactionReceipt error", error);
      notify("warn", t("networkError"));
    }
  }

  function getMaxRepayBtnDisplay() {
    if (selectedDirection === "buy") {
      return tokenFormater(tradeToken?.tokenName) + " " + t("Repay");
    } else {
      return tokenFormater(baseToken?.tokenName) + " " + t("Repay");
    }
  }

  function maxRepayBtnOnClick(event) {
    event.preventDefault();
    logEvent(getAnalytics(), `trade_max_repay_button`);
    console.log("maxRepayBtnOnClick maxRepayAmount:", maxRepayAmount);
    updateSizeInputValue(maxRepayAmount);
  }

  function maxSpotBtnOnClick(event) {
    event.preventDefault();
    logEvent(getAnalytics(), `trade_max_spot_button`);
    console.log("maxSpotBtnOnClick maxSpotAmount:", maxSpotAmount);
    updateSizeInputValue(maxSpotAmount);
  }

  function maxMarginBtnOnClick(event) {
    event.preventDefault();
    logEvent(getAnalytics(), `trade_max_margin_button`);
    console.log("maxMarginBtnOnClick maxMarginAmount:", maxMarginAmount);
    updateSizeInputValue(maxMarginAmount);
  }

  function getMaxInputValue() {
    let _max = 0;
    const _maxMarginAmount = maxMarginAmount;
    const _maxSpotAmount = maxSpotAmount;
    const _maxRepayAmount = maxRepayAmount;
    if (_maxMarginAmount > 0) {
      _max = _maxMarginAmount;
    } else if (_maxSpotAmount > 0) {
      _max = _maxSpotAmount;
    }
    if (bigNumberCompare(_maxRepayAmount, _max) > 0) {
      _max = _maxRepayAmount;
    }
    return _max;
  }

  function directToken(inputTradeToken) {
    history.push(`/trade/${inputTradeToken}`);
    // setTradeToken(tokenList.find(({ tokenName }) => tokenName === inputTradeToken))
    window.location.reload();
  }

  function buySellTabOnClick(tabName) {
    logEvent(getAnalytics(), `trade_direction_click_${tabName}`);
    setSelectedDirection(tabName);
  }

  function getChartCurrentPrice() {
    if (tradeTokenCurrentPrice) {
      return bigNumberToFixed(tradeTokenCurrentPrice, 2);
    }
    return "";
  }

  function getChartCurrentPriceArrowInd() {
    if (tradeTokenCurrentPrice && tradeTokenLastPrice) {
      const _compare = bigNumberCompare(tradeTokenCurrentPrice, tradeTokenLastPrice);
      if (_compare > 0) {
        return 1;
      } else if (_compare < 0) {
        return 2;
      }
    }
    return 0;
  }

  function getChartPriceDiff() {
    if (tradeTokenCurrentPrice && tradeTokenHistoryPrice) {
      let diff = bigNumberMinus(tradeTokenCurrentPrice, tradeTokenHistoryPrice);
      diff = bigNumberDivided(diff, tradeTokenHistoryPrice);
      diff = bigNumberTimes(diff, 100);
      return bigNumberToFixed(diff, 2);
    }
    return "";
  }

  function getCurrentSliderValue(inputValue) {
    // console.log("getCurrentSliderValue inputValue:", inputValue)
    const _max = getMaxInputValue();
    const _sizeInputValue = inputValue;
    if (_max > 0 && _sizeInputValue > 0) {
      let _currentSliderValue = bigNumberToFixed(bigNumberTimes(bigNumberDivided(_sizeInputValue, _max), 100), 0);
      if (_currentSliderValue < 0) {
        _currentSliderValue = 0;
      } else if (_currentSliderValue > 100) {
        _currentSliderValue = 100;
      }
      // console.log("getCurrentSliderValue _currentSliderValue:", _currentSliderValue)
      if (_currentSliderValue) {
        return _currentSliderValue;
      }
    }
    return 0;
  }

  function setCurrentSliderValue(value) {
    logEvent(getAnalytics(), `trade_set_current_slider_value`);
    sliderValueOnChange(value);
  }

  function sliderValueOnChange(value) {
    // console.log("sliderValueOnChange value:", value)
    const _max = getMaxInputValue();
    if (_max > 0 && value > 0) {
      const _currentValue = bigNumberDivided(bigNumberTimes(_max, value), 100);
      // console.log("sliderValueOnChange _currentValue:", _currentValue)
      if (_currentValue > 0) {
        updateSizeInputValue(_currentValue);
      }
    } else {
      updateSizeInputValue(0);
    }
  }

  async function handleSizeInputValueChange(event) {
    event.preventDefault();
    const _inputValue = event.target.value.replace(/,/g, "");
    updateSizeInputValue(_inputValue);
  }

  async function updateSizeInputValue(_inputValue) {
    try {
      if (_inputValue == 0) {
        setSizeInputValue(_inputValue);
        setAmountInputValue(0);
        setPriceShock(0);
        setEstTransactionPrice(0);
        setMinMaxAmountObj(null);
      } else if (isNumber(_inputValue) && _inputValue != sizeInputValue) {
        const _toFixedInputValue = bigNumberToFixed(_inputValue, 6);
        setSizeInputValue(_toFixedInputValue);
        if (_toFixedInputValue > 0 && pairInfo && tradeToken && tradeToken.tokenName) {
          if (selectedDirection === "buy") {
            const buyTradeTokenResult = await buyTradeToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, amountMultipleDecimals(_toFixedInputValue, tradeToken.decimal));
            console.log("updateSizeInputValue buyTradeTokenResult:", buyTradeTokenResult);
            if (buyTradeTokenResult && buyTradeTokenResult.amountIn) {
              const _outputAmountInputValue = amountDivideDecimals(buyTradeTokenResult.amountIn, baseToken.decimal);
              setAmountInputValue(bigNumberToFixed(_outputAmountInputValue, 6));
              setPriceShock(buyTradeTokenResult.priceImpact);
              setEstTransactionPrice(bigNumberDivided(bigNumberTimes(_outputAmountInputValue, 1 - transactionFeeRatio), _toFixedInputValue));
              setMinMaxAmountObj({
                type: "MAX",
                amount: buyTradeTokenResult.maxAmountIn,
                displayAmount: amountDivideDecimals(buyTradeTokenResult.maxAmountIn, baseToken.decimal),
              });
            }
          } else if (selectedDirection === "sell") {
            const sellTradeTokenResult = await sellTradeToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, amountMultipleDecimals(_toFixedInputValue, tradeToken.decimal));
            console.log("updateSizeInputValue sellTradeTokenResult:", sellTradeTokenResult);
            if (sellTradeTokenResult && sellTradeTokenResult.amountOut) {
              const _outputAmountInputValue = amountDivideDecimals(sellTradeTokenResult.amountOut, baseToken.decimal);
              setAmountInputValue(bigNumberToFixed(_outputAmountInputValue, 6));
              setPriceShock(sellTradeTokenResult.priceImpact);
              setEstTransactionPrice(bigNumberDivided(_outputAmountInputValue, bigNumberTimes(_toFixedInputValue, 1 - transactionFeeRatio)));
              setMinMaxAmountObj({
                type: "MIN",
                amount: sellTradeTokenResult.minAmountOut,
                displayAmount: amountDivideDecimals(sellTradeTokenResult.minAmountOut, baseToken.decimal),
              });
            }
          }
        } else {
          setAmountInputValue("");
          setPriceShock(0);
          setEstTransactionPrice(0);
          setMinMaxAmountObj(null);
        }
      }
    } catch (error) {
      console.log("updateSizeInputValue error:", error);
    }
  }

  async function updateAmountInputValue(_inputValue) {
    try {
      if (_inputValue == 0) {
        setAmountInputValue(_inputValue);
        setSizeInputValue(0);
        setPriceShock(0);
        setEstTransactionPrice(0);
        setMinMaxAmountObj(null);
      } else if (isNumber(_inputValue) && _inputValue != amountInputValue) {
        const _toFixedInputValue = bigNumberToFixed(_inputValue, 6);
        setAmountInputValue(_toFixedInputValue);
        if (_toFixedInputValue > 0 && pairInfo && tradeToken && tradeToken.tokenName) {
          if (selectedDirection === "buy") {
            const sellBaseTokenResult = await sellBaseToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, amountMultipleDecimals(_toFixedInputValue, baseToken.decimal));
            console.log("updateAmountInputValue sellBaseTokenResult:", sellBaseTokenResult);
            if (sellBaseTokenResult && sellBaseTokenResult.amountOut) {
              const _outputSizeInputValue = amountDivideDecimals(sellBaseTokenResult.amountOut, tradeToken.decimal);
              const _newSizeValue = bigNumberToFixed(_outputSizeInputValue, 6);
              const buyTradeTokenResult = await buyTradeToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, amountMultipleDecimals(_newSizeValue, tradeToken.decimal));
              if (buyTradeTokenResult && buyTradeTokenResult.amountIn) {
                setSizeInputValue(_newSizeValue);
                setPriceShock(buyTradeTokenResult.priceImpact);
                setMinMaxAmountObj({
                  type: "MAX",
                  amount: buyTradeTokenResult.maxAmountIn,
                  displayAmount: amountDivideDecimals(buyTradeTokenResult.maxAmountIn, baseToken.decimal),
                });
                setEstTransactionPrice(bigNumberDivided(bigNumberTimes(_toFixedInputValue, 1 - transactionFeeRatio), _outputSizeInputValue));
              }
            }
          } else if (selectedDirection === "sell") {
            const buyBaseTokenResult = await buyBaseToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, amountMultipleDecimals(_toFixedInputValue, baseToken.decimal));
            console.log("updateAmountInputValue buyBaseTokenResult:", buyBaseTokenResult);
            if (buyBaseTokenResult && buyBaseTokenResult.amountIn) {
              const _outputSizeInputValue = amountDivideDecimals(buyBaseTokenResult.amountIn, tradeToken.decimal);
              const _newSizeValue = bigNumberToFixed(_outputSizeInputValue, 6);

              const sellTradeTokenResult = await sellTradeToken(tradeToken.tokenName, pairInfo.baseTokenReserve, pairInfo.tradeTokenReserve, amountMultipleDecimals(_newSizeValue, tradeToken.decimal));
              if (sellTradeTokenResult && sellTradeTokenResult.amountOut) {
                setSizeInputValue(_newSizeValue);
                setPriceShock(sellTradeTokenResult.priceImpact);
                setMinMaxAmountObj({
                  type: "MIN",
                  amount: sellTradeTokenResult.minAmountOut,
                  displayAmount: amountDivideDecimals(sellTradeTokenResult.minAmountOut, baseToken.decimal),
                });
                setEstTransactionPrice(bigNumberDivided(_toFixedInputValue, bigNumberTimes(_outputSizeInputValue, 1 - transactionFeeRatio)));
              }
            }
          }
        } else {
          setSizeInputValue("");
          setPriceShock(0);
          setEstTransactionPrice(0);
          setMinMaxAmountObj(null);
        }
      }
    } catch (error) {
      console.log("updateAmountInputValue error:", error);
    }
  }

  async function handleAmountInputValueChange(event) {
    event.preventDefault();
    const _inputValue = event.target.value.replace(/,/g, "");
    updateAmountInputValue(_inputValue);
  }

  function getDisplayBorrowingAmount() {
    if (selectedDirection === "buy") {
      let _usdmBalance = getDisplayTokenBalance("USDM");
      if (bigNumberCompare(_usdmBalance, 0) < 0) {
        _usdmBalance = 0;
      }
      // console.log("getDisplayBorrowingAmount _usdmBalance:", _usdmBalance)
      // console.log("getDisplayBorrowingAmount amountInputValue:", amountInputValue)
      if (bigNumberCompare(amountInputValue, 0) > 0) {
        if (bigNumberCompare(amountInputValue, _usdmBalance) > 0) {
          return bigNumberToFixed(bigNumberMinus(amountInputValue, _usdmBalance), 6);
        }
      }
    } else if (selectedDirection === "sell" && tradeToken.tokenName) {
      let _tradeBalance = getDisplayTokenBalance(tradeToken.tokenName);
      if (bigNumberCompare(_tradeBalance, 0) < 0) {
        _tradeBalance = 0;
      }
      // console.log("getDisplayBorrowingAmount _tradeBalance:", _tradeBalance)
      // console.log("getDisplayBorrowingAmount sizeInputValue:", sizeInputValue)
      if (bigNumberCompare(sizeInputValue, 0) > 0) {
        if (bigNumberCompare(sizeInputValue, _tradeBalance) > 0) {
          return bigNumberToFixed(bigNumberMinus(sizeInputValue, _tradeBalance), 6);
        }
      }
    }
    return 0;
  }

  function getDisplayBorrowingToken() {
    if (selectedDirection === "buy") {
      return ` ${tokenFormater(baseToken?.tokenName)}`;
    } else if (selectedDirection === "sell") {
      return ` ${tokenFormater(tradeToken?.tokenName)}`;
    }
  }

  function getDisplayCurrentRepayAmount() {
    if (selectedDirection === "buy" && tradeToken && tradeToken.tokenName) {
      let _tradeBalanceAbs = getDisplayTokenBalance(tradeToken.tokenName);
      if (bigNumberCompare(_tradeBalanceAbs, 0) < 0) {
        _tradeBalanceAbs = bigNumberAbsoluteValue(_tradeBalanceAbs);
        if (bigNumberCompare(sizeInputValue, 0) > 0) {
          if (bigNumberCompare(_tradeBalanceAbs, sizeInputValue) > 0) {
            return bigNumberToFixed(sizeInputValue, 6);
          } else {
            return bigNumberToFixed(_tradeBalanceAbs, 6);
          }
        }
      }
    } else if (selectedDirection === "sell" && baseToken.tokenName) {
      let _baseBalanceAbs = getDisplayTokenBalance(baseToken.tokenName);
      if (bigNumberCompare(_baseBalanceAbs, 0) < 0) {
        _baseBalanceAbs = bigNumberAbsoluteValue(_baseBalanceAbs);
        if (bigNumberCompare(amountInputValue, 0) > 0) {
          if (bigNumberCompare(_baseBalanceAbs, amountInputValue) > 0) {
            return bigNumberToFixed(amountInputValue, 6);
          } else {
            return bigNumberToFixed(_baseBalanceAbs, 6);
          }
        }
      }
    }
    return 0;
  }

  function getDisplayCurrentRepayToken() {
    if (selectedDirection === "buy") {
      return ` ${tokenFormater(tradeToken?.tokenName)}`;
    } else if (selectedDirection === "sell") {
      return ` ${tokenFormater(baseToken?.tokenName)}`;
    }
  }

  function getDisplayEstTransactionPrice() {
    return estTransactionPrice;
  }

  function getDisplayPriceShock() {
    return priceShock;
  }

  function getDisplayTransactionFee() {
    let _transactionFee = 0;
    if (selectedDirection === "buy") {
      if (amountInputValue) {
        _transactionFee = amountInputValue * transactionFeeRatio;
      }
    } else if (selectedDirection === "sell") {
      if (sizeInputValue) {
        _transactionFee = sizeInputValue * transactionFeeRatio;
      }
    }
    return bigNumberToFixed(_transactionFee, 6);
  }

  function getDisplayTransactionFeeToken() {
    if (selectedDirection === "buy") {
      return ` ${tokenFormater(baseToken?.tokenName)}`;
    } else if (selectedDirection === "sell") {
      return ` ${tokenFormater(tradeToken?.tokenName)}`;
    }
  }

  function getTokenBalanceFromCustomerInfo(tokenName) {
    let _amount = 0;
    if (customerInfo && customerInfo.tokens) {
      const _tokens = customerInfo.tokens;
      for (let index = 0; index < _tokens.length; index++) {
        const _token = _tokens[index];
        if (_token && _token.tokenName === tokenName) {
          _amount = _token.realizedBalance;
          let _interest = _token.interest;
          if (_interest) {
            _amount = bigNumberMinus(_amount, _interest);
          }
        }
      }
    }
    return _amount;
  }

  function getDisplayTokenBalance(inputTokenName) {
    let _displayAmount = 0;
    const _amount = getTokenBalanceFromCustomerInfo(inputTokenName);
    if (_amount) {
      const _tokenDetails = tokenList.find(({tokenName}) => tokenName === inputTokenName);
      // console.log("getDisplayTokenBalance inputTokenName:", inputTokenName)
      // console.log("getDisplayTokenBalance _amount:", _amount)
      // console.log("getDisplayTokenBalance _tokenDetails:", _tokenDetails)
      _displayAmount = amountDivideDecimals(_amount, _tokenDetails.decimal);
    }
    return bigNumberToFixed(_displayAmount, 6);
  }

  function getDisplayUserRiskLevel() {
    let _userRiskLevel = 0;
    if (customerInfo) {
      const _userEquityNoDecimals = getUserEquity();
      const _currentRiskLevel = parseFloat(amountDivideDecimals(customerInfo.currentRiskLevel, 6) * 100);
      const _userEquity = amountDivideDecimals(_userEquityNoDecimals, 6);

      // console.log("getDisplayUserRiskLevel _userEquityNoDecimals:", _userEquityNoDecimals)
      // console.log("getDisplayUserRiskLevel _userEquity:", _userEquity)
      // console.log("getDisplayUserRiskLevel _currentRiskLevel:", _currentRiskLevel)
      if (_userEquity < 0) {
        _userRiskLevel = 100;
      } else {
        _userRiskLevel = _currentRiskLevel;
      }
    }
    return _userRiskLevel;
  }

  function getUserEquity() {
    let _usedEquity = 0;
    if (customerInfo) {
      _usedEquity = customerInfo.equity;
      if (allTradeTokenCurrentPrice && allTradeTokenCurrentPrice["BTCM"] && allTradeTokenCurrentPrice["ETHM"]) {
        let _usdmBalance = getDisplayTokenBalance("USDM");
        let _btcmBalanceInUsd = bigNumberTimes(getDisplayTokenBalance("BTCM"), allTradeTokenCurrentPrice["BTCM"]);
        let _ethmBalanceInUsd = bigNumberTimes(getDisplayTokenBalance("ETHM"), allTradeTokenCurrentPrice["ETHM"]);
        // _usdmBalance = bigNumberToFixed(_usdmBalance, 2)
        // _btcmBalanceInUsd = bigNumberToFixed(_btcmBalanceInUsd, 2)
        // _ethmBalanceInUsd = bigNumberToFixed(_ethmBalanceInUsd, 2)

        // console.log("getUserEquity allTradeTokenCurrentPrice:", allTradeTokenCurrentPrice)
        // console.log("getUserEquity _usdmBalance:", _usdmBalance)
        // console.log("getUserEquity _btcmBalanceInUsd:", _btcmBalanceInUsd)
        // console.log("getUserEquity _ethmBalanceInUsd:", _ethmBalanceInUsd)

        if (_usdmBalance && _btcmBalanceInUsd && _ethmBalanceInUsd) {
          _usedEquity = bigNumberSum(_usdmBalance, _btcmBalanceInUsd, _ethmBalanceInUsd);
          _usedEquity = amountMultipleDecimals(_usedEquity, 6);
          _usedEquity = bigNumberToFixed(_usedEquity, 0);
        }
      }
    }
    return _usedEquity;
  }

  function getUserAvailableFunding() {
    let _userAvailableFunding = 0;
    if (customerInfo) {
      const _usedEquity = getUserEquity();
      const _availableFunding = getAvailableFunding(customerInfo.mode, _usedEquity, customerInfo.maxFunding, customerInfo.leverage);
      _userAvailableFunding = _availableFunding;
    }
    return _userAvailableFunding;
  }

  function getUserUsedFunding() {
    let _userUsedFunding = 0;
    if (customerInfo) {
      _userUsedFunding = customerInfo.usedFunding;
      if (allTradeTokenCurrentPrice && allTradeTokenCurrentPrice["BTCM"] && allTradeTokenCurrentPrice["ETHM"]) {
        let _usdmBalance = getDisplayTokenBalance("USDM");
        let _btcmBalanceInUsd = bigNumberTimes(getDisplayTokenBalance("BTCM"), allTradeTokenCurrentPrice["BTCM"]);
        let _ethmBalanceInUsd = bigNumberTimes(getDisplayTokenBalance("ETHM"), allTradeTokenCurrentPrice["ETHM"]);
        // _usdmBalance = bigNumberToFixed(_usdmBalance, 2)
        // _btcmBalanceInUsd = bigNumberToFixed(_btcmBalanceInUsd, 2)
        // _ethmBalanceInUsd = bigNumberToFixed(_ethmBalanceInUsd, 2)
        let _newUserUsedFunding = 0;
        if (bigNumberCompare(_usdmBalance, 0) < 0) {
          _newUserUsedFunding = bigNumberSum(_newUserUsedFunding, bigNumberAbsoluteValue(_usdmBalance));
        }
        if (bigNumberCompare(_btcmBalanceInUsd, 0) < 0) {
          _newUserUsedFunding = bigNumberSum(_newUserUsedFunding, bigNumberAbsoluteValue(_btcmBalanceInUsd));
        }
        if (bigNumberCompare(_ethmBalanceInUsd, 0) < 0) {
          _newUserUsedFunding = bigNumberSum(_newUserUsedFunding, bigNumberAbsoluteValue(_ethmBalanceInUsd));
        }
        // console.log("###### _usdmBalance:", _usdmBalance)
        // console.log("###### _btcmBalanceInUsd:", _btcmBalanceInUsd)
        // console.log("###### _ethmBalanceInUsd:", _ethmBalanceInUsd)
        _userUsedFunding = amountMultipleDecimals(_newUserUsedFunding, 6);
        _userUsedFunding = bigNumberToFixed(_userUsedFunding, 0);
      }
    }
    return _userUsedFunding;
  }

  function getFundingLeft() {
    let _userFundingLeft = 0;
    if (customerInfo) {
      const _usedEquity = getUserEquity();
      const _usedCredit = getUserUsedFunding();
      const _availableFunding = getUserAvailableFunding();
      const _remainAvailableFunding = bigNumberMinus(_availableFunding, _usedCredit);

      // console.log("###### _usedEquity:", _usedEquity)
      if (_remainAvailableFunding < 0 || _usedEquity < 0) {
        _userFundingLeft = 0;
      } else {
        _userFundingLeft = _remainAvailableFunding;
      }
    }
    return _userFundingLeft;
  }

  function getDisplayFundingLeft() {
    let _userFundingLeft = 0;
    const _fundingLeft = getFundingLeft();
    _userFundingLeft = amountDivideDecimals(_fundingLeft, 6);
    return bigNumberToFixed(_userFundingLeft, 6);
  }

  function toggleTransactionTabDisplay() {
    logEvent(getAnalytics(), `trade_toggle_mobile_txn_tab`);
    if (chartTabDisplay == false) {
      setTransactionTabDisplay(!transactionTabDisplay);
    }
  }

  function toggleChartTabDisplay() {
    logEvent(getAnalytics(), `trade_toggle_mobile_chart_tab`);
    if (transactionTabDisplay == false) {
      setChartTabDisplay(!chartTabDisplay);
    }
  }

  return (
    <>
      <div className={`${style["top-select-container"]}`}>
        <div className={`${style["token-select-container"]}`}>
          <div className={`${style["token-selector-wrap"]}`}>
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
          <div className={style["price-wrapper"]}>
            {getChartCurrentPriceArrowInd() === 0 ? <div className={`${style["price"]}`}>{getChartCurrentPrice() ? `$${floorPrecised(getChartCurrentPrice(), 2)}` : ""}</div> : ""}
            {getChartCurrentPriceArrowInd() === 1 ? <div className={`${style["price"]} ${style["positive"]}`}>{getChartCurrentPrice() ? `$${floorPrecised(getChartCurrentPrice(), 2)}` : ""}</div> : ""}
            {getChartCurrentPriceArrowInd() === 2 ? <div className={`${style["price"]} ${style["negative"]}`}>{getChartCurrentPrice() ? `$${floorPrecised(getChartCurrentPrice(), 2)}` : ""}</div> : ""}
            {getChartCurrentPriceArrowInd() === 1 ? (
              <div className={style["card-icon"]}>
                <img src={icon_arrowup} alt="up" />
              </div>
            ) : (
              ""
            )}
            {getChartCurrentPriceArrowInd() === 2 ? (
              <div className={style["card-icon"]}>
                <img src={icon_arrowdown} alt="down" />
              </div>
            ) : (
              ""
            )}
            {getChartPriceDiff() > 0 ? <div className={`${style["diff"]} ${style["positive"]}`}> +{floorPrecised(getChartPriceDiff(), 2)}%</div> : ""}
            {getChartPriceDiff() < 0 ? <div className={`${style["diff"]} ${style["negative"]}`}> {floorPrecised(getChartPriceDiff(), 2)}%</div> : ""}
          </div>
        </div>
        <div className={`${style["page-select-container"]}`}>
          <div className={style["card-icon"]} onClick={() => toggleChartTabDisplay()}>
            <img src={chartTabDisplay ? icon_price_active : icon_price_inactive} alt="ethm" />
          </div>
          <div className={style["card-icon"]} onClick={() => toggleTransactionTabDisplay()}>
            <img src={transactionTabDisplay ? icon_record_active : icon_record_inactive} alt="ethm" />
          </div>
        </div>
      </div>
      <div id={style["quote-container"]}>
        {tradeToken && tradeToken.tokenName ? <TradeQuoteLeft historyRecordLastUpdated={historyRecordLastUpdated} transactionTabDisplay={transactionTabDisplay} setTransactionTabDisplay={setTransactionTabDisplay} chartTabDisplay={chartTabDisplay} setChartTabDisplay={setChartTabDisplay} /> : null}
        <div className={style["quote-right"]}>
          <div className={`${style["trade-wrapper"]} ${isCardCollpase2 && style["quote-collpase"]}`}>
            <div className={`${style["panel-container"]} ${selectedDirection === "buy" ? style["panel-container-buy"] : style["panel-container-sell"]}`}>
              <div onClick={() => buySellTabOnClick("buy")} className={`${selectedDirection === "buy" ? style["buy-active"] : ""}`}>
                {t("buy")} {tokenFormater(tradeToken?.tokenName)}
              </div>
              <div onClick={() => buySellTabOnClick("sell")} className={`${selectedDirection === "sell" ? style["sell-active"] : ""}`}>
                {t("sell")} {tokenFormater(tradeToken?.tokenName)}
              </div>
            </div>
            <div className={style["inputs-container"]}>
              <div className={style["input-container"]}>
                <NumberFormat
                  thousandsGroupStyle="thousand"
                  // value={(sizeInputValue == 0) ? "" : sizeInputValue}
                  value={sizeInputValue}
                  placeholder={t("size")}
                  decimalScale={6}
                  decimalSeparator="."
                  displayType="input"
                  type="text"
                  thousandSeparator={true}
                  allowNegative={false}
                  onChange={handleSizeInputValueChange}
                  inputMode="decimal"
                />
                {/* {t('size')} */}
                <span>{tokenFormater(tradeToken?.tokenName)}</span>
              </div>
              <div className={style["input-container"]}>
                <NumberFormat
                  thousandsGroupStyle="thousand"
                  // value={(amountInputValue == 0) ? "" : amountInputValue}
                  value={amountInputValue}
                  placeholder={t("amount")}
                  decimalScale={6}
                  decimalSeparator="."
                  displayType="input"
                  type="text"
                  thousandSeparator={true}
                  allowNegative={false}
                  onChange={handleAmountInputValueChange}
                  inputMode="decimal"
                />
                {/* {t('size')} */}
                <span>USD</span>
              </div>
            </div>
            <div className={style["slider-container"]}>
              <Slider selectedSize={getCurrentSliderValue(sizeInputValue)} sliderValueOnChange={sliderValueOnChange} />
            </div>
            <div className={style["selections-container"]}>
              <div className={style["selection-container"]}>
                <div className={style["li-label"]}>{t("size")}</div>
                <div className={style["li-value"]}>
                  <span className={getCurrentSliderValue(sizeInputValue) === 25 ? style["active"] : ""} onClick={() => setCurrentSliderValue(25)}>
                    25%
                  </span>
                  <div>•</div>
                  <span className={getCurrentSliderValue(sizeInputValue) === 50 ? style["active"] : ""} onClick={() => setCurrentSliderValue(50)}>
                    50%
                  </span>
                  <div>•</div>
                  <span className={getCurrentSliderValue(sizeInputValue) === 75 ? style["active"] : ""} onClick={() => setCurrentSliderValue(75)}>
                    75%
                  </span>
                  <div>•</div>
                  <span className={getCurrentSliderValue(sizeInputValue) === 100 ? style["active"] : ""} onClick={() => setCurrentSliderValue(100)}>
                    100%
                  </span>
                </div>
              </div>
              <div className={style["selection-container"]}>
                <div className={style["li-label"]}>{t("type")}</div>
                <div className={style["li-value"]}>
                  <span onClick={maxSpotBtnOnClick}>{t("maxSpot")}</span>
                  <div>•</div>
                  <span onClick={maxMarginBtnOnClick}>{t("maxMargin")}</span>
                  <div>•</div>
                  <span onClick={maxRepayBtnOnClick}>{getMaxRepayBtnDisplay()}</span>
                </div>
              </div>
            </div>

            <div className={style["detail-display-container"]}>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>
                  <div>{t("borrowing")}</div>
                  <Tooltip placement={getIsMobile() ? "top" : "right"} enterTouchDelay={0} title={<>{t("learnMoreBorrowing")}</>} arrow>
                    <div className={style["tips"]}>?</div>
                  </Tooltip>
                </div>
                <NumberFormat value={getDisplayBorrowingAmount()} className={style["li-value"]} displayType={"text"} suffix={getDisplayBorrowingToken()} decimalScale={6} fixedDecimalScale={true} thousandSeparator={true} renderText={(value, props) => <div {...props}>{value}</div>} />
              </div>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>
                  <div>{t("Repay")}</div>
                  <Tooltip placement={getIsMobile() ? "top" : "right"} enterTouchDelay={0} title={<>{t("learnMoreRepay")}</>} arrow>
                    <div className={style["tips"]}>?</div>
                  </Tooltip>
                </div>
                <NumberFormat value={getDisplayCurrentRepayAmount()} className={style["li-value"]} displayType={"text"} suffix={getDisplayCurrentRepayToken()} decimalScale={6} fixedDecimalScale={true} thousandSeparator={true} renderText={(value, props) => <div {...props}>{value}</div>} />
              </div>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>{t("estTransactionPrice")}</div>
                <NumberFormat value={getDisplayEstTransactionPrice()} className={style["li-value"]} displayType={"text"} prefix={"$"} decimalScale={2} fixedDecimalScale={true} thousandSeparator={true} renderText={(value, props) => <div {...props}>{value}</div>} />
              </div>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>
                  <div>{t("priceShock")}</div>
                  <Tooltip placement={getIsMobile() ? "top" : "right"} enterTouchDelay={0} title={<>{t("learnMorePriceShock")}</>} arrow>
                    <div className={style["tips"]}>?</div>
                  </Tooltip>
                </div>
                <NumberFormat value={getDisplayPriceShock()} className={style["li-value"]} displayType={"text"} suffix={"%"} decimalScale={2} fixedDecimalScale={true} thousandSeparator={true} renderText={(value, props) => <div {...props}>{value}</div>} />
              </div>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>
                  <div>{t("handlingFee")}</div>
                  <Tooltip placement={getIsMobile() ? "top" : "right"} enterTouchDelay={0} title={<>{t("learnMoreTransactionFee")}</>} arrow>
                    <div className={style["tips"]}>?</div>
                  </Tooltip>
                </div>
                <NumberFormat value={getDisplayTransactionFee()} className={style["li-value"]} displayType={"text"} suffix={getDisplayTransactionFeeToken()} decimalScale={6} fixedDecimalScale={true} thousandSeparator={true} renderText={(value, props) => <div {...props}>{value}</div>} />
              </div>
            </div>

            {isLoading ? (
              <div className={style["confirm-button-container"]}>
                <span className={style["loading"]}>{t("loading")}</span>
              </div>
            ) : (
              <div className={style["confirm-button-container"]}>
                <span onClick={confirmBtnOnClick} className={`${selectedDirection === "buy" ? style["buy-active"] : ""}`}>
                  {t("tradeConfirm")}
                </span>
              </div>
            )}
          </div>

          <div className={style["account-info-wrapper"]}>
            <div className={style["title"]}>{t("accountInfo")}</div>
            <div className={style["body"]}>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>
                  {tokenFormater(tradeToken?.tokenName)} {t("balance")}
                </div>
                <NumberFormat
                  value={getDisplayTokenBalance(tradeToken?.tokenName)}
                  className={style["li-value"]}
                  displayType={"text"}
                  suffix={` ${tokenFormater(tradeToken?.tokenName)}`}
                  decimalScale={6}
                  fixedDecimalScale={true}
                  thousandSeparator={true}
                  renderText={(value, props) => <div {...props}>{value}</div>}
                />
              </div>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>USD {t("balance")}</div>
                <NumberFormat value={getDisplayTokenBalance("USDM")} className={style["li-value"]} displayType={"text"} suffix={" USD"} decimalScale={6} fixedDecimalScale={true} thousandSeparator={true} renderText={(value, props) => <div {...props}>{value}</div>} />
              </div>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>{t("fundingLeft")}</div>
                <NumberFormat value={getDisplayFundingLeft()} className={style["li-value"]} displayType={"text"} prefix={"$"} decimalScale={2} fixedDecimalScale={true} thousandSeparator={true} renderText={(value, props) => <div {...props}>{value}</div>} />
              </div>
              <div className={style["li-container"]}>
                <div className={style["li-label"]}>{t("riskLevel")}</div>
                <NumberFormat value={getDisplayUserRiskLevel()} className={style["li-value"]} displayType={"text"} suffix={"%"} decimalScale={2} fixedDecimalScale={true} thousandSeparator={true} renderText={(value, props) => <div {...props}>{value}</div>} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TradeQuote;
