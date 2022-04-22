import TradeOrderRecords from "../Dashboard/TradeOrderRecords";
import TradeInterestRecords from "../Dashboard/TradeInterestRecords";
import TradeOrderMobileRecords from "../Dashboard/TradeOrderMobileRecords";
import TradeInterestMobileRecords from "../Dashboard/TradeInterestMobileRecords";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Chart from "../../component/Chart";
import style from "./TradeQuote.module.scss";
import {useTranslation} from "react-i18next";
import {useState, useEffect} from "react";
import {getTokenList} from "../../store";
import {useParams} from "react-router-dom";

const TradeQuoteLeft = ({historyRecordLastUpdated, transactionTabDisplay, setTransactionTabDisplay, chartTabDisplay, setChartTabDisplay}) => {
  let {selectedTradeToken} = useParams();
  const {t} = useTranslation();
  const [selectedChartInterval, setselectedChartInterval] = useState("300");
  const [selectedChartType, setselectedChartType] = useState("line");
  const tokenList = getTokenList();
  const [selectedRecordTab, setSelectedRecordTab] = useState("transaction");

  const handleChartIntervalChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setselectedChartInterval(newAlignment);
    }
  };

  const handleChartTypeChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setselectedChartType(newAlignment);
    }
  };
  const [tradeToken, setTradeToken] = useState(tokenList.find(({tokenName}) => tokenName === selectedTradeToken));

  useEffect(() => {
    setTradeToken(tokenList.find(({tokenName}) => tokenName === selectedTradeToken));
  }, [selectedTradeToken]);

  return (
    <>
      <div className={`${style["quote-left"]}`}>
        <div className={style["chart-wrapper"]}>
          <div className={style["chart-header"]}>
            <div className={style["header-right"]}>
              <div>
                <span>{t("time")} :</span>
                <ToggleButtonGroup color="secondary" value={selectedChartInterval} exclusive onChange={handleChartIntervalChange}>
                  <ToggleButton value="300">5{t("min")}</ToggleButton>
                  <ToggleButton value="3600">1{t("hourShort")}</ToggleButton>
                  <ToggleButton value="86400">24{t("hourShort")}</ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div>
                <span>{t("chartType")} :</span>
                <ToggleButtonGroup color="secondary" value={selectedChartType} exclusive onChange={handleChartTypeChange}>
                  <ToggleButton value="candle">{t("candlechart")}</ToggleButton>
                  <ToggleButton value="line">{t("linechart")}</ToggleButton>
                </ToggleButtonGroup>
              </div>
            </div>
          </div>
          <div className={style["chart"]}>{<Chart pairName={`${tradeToken.tokenName}/USDM`} interval={selectedChartInterval} type={selectedChartType} />}</div>
        </div>
        <div className={style["record-container"]}>
          <div className={`${style["record-container-panel"]} `}>
            <span onClick={() => setSelectedRecordTab("transaction")} className={`${selectedRecordTab === "transaction" ? style["active"] : ""} ${style["left"]}`}>
              {t("transactionRecord")}
            </span>
            <span onClick={() => setSelectedRecordTab("interest")} className={`${selectedRecordTab === "interest" ? style["active"] : ""}`}>
              {t("interestRecord")}
            </span>
          </div>
          {selectedRecordTab === "transaction" ? (
            <div className={`${style["order-record"]}`} id="scrollableOrder">
              <TradeOrderRecords historyRecordLastUpdated={historyRecordLastUpdated} />
            </div>
          ) : (
            <div className={`${style["interest-record"]}`} id="scrollableInterest">
              <TradeInterestRecords />
            </div>
          )}
        </div>
      </div>
      <div className={style["quote-left-mobile"]}>
        {transactionTabDisplay && (
          <div className={style["record-container"]}>
            <div className={`${style["record-container-panel"]} `}>
              <span onClick={() => setSelectedRecordTab("transaction")} className={`${selectedRecordTab === "transaction" ? style["active"] : ""}`}>
                {t("transactionRecord")}
              </span>
              <span onClick={() => setSelectedRecordTab("interest")} className={`${selectedRecordTab === "interest" ? style["active"] : ""}`}>
                {t("interestRecord")}
              </span>
            </div>
            {selectedRecordTab === "transaction" ? (
              <div className={`${style["order-record"]}`} id="scrollableMobileOrder">
                <TradeOrderMobileRecords historyRecordLastUpdated={historyRecordLastUpdated} />
              </div>
            ) : (
              <div className={`${style["interest-record"]}`} id="scrollableMobileInterest">
                <TradeInterestMobileRecords />
              </div>
            )}
          </div>
        )}
        {chartTabDisplay && (
          <div className={style["chart-wrapper"]}>
            <div className={style["chart-header"]}>
              <div className={style["header-right"]}>
                <div>
                  <span>{t("time")} :</span>
                  <ToggleButtonGroup color="secondary" value={selectedChartInterval} exclusive onChange={handleChartIntervalChange}>
                    <ToggleButton value="300">5{t("min")}</ToggleButton>
                    <ToggleButton value="3600">1{t("hourShort")}</ToggleButton>
                    <ToggleButton value="86400">24{t("hourShort")}</ToggleButton>
                  </ToggleButtonGroup>
                </div>
                <div>
                  <span>{t("chartType")} :</span>
                  <ToggleButtonGroup color="secondary" value={selectedChartType} exclusive onChange={handleChartTypeChange}>
                    <ToggleButton value="candle">{t("candlechart")}</ToggleButton>
                    <ToggleButton value="line">{t("linechart")}</ToggleButton>
                  </ToggleButtonGroup>
                </div>
              </div>
            </div>
            <div className={style["chart"]}>{<Chart pairName={`${tradeToken.tokenName}/USDM`} interval={selectedChartInterval} type={selectedChartType} />}</div>
          </div>
        )}
        <div></div>
      </div>
    </>
  );
};

export default TradeQuoteLeft;
