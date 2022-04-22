import React, {useEffect, useState} from "react";
import {Modal, ModalBody} from "reactstrap";
import style from "./ProfitAndLossChartModal.module.scss";
import icon_close from "../asset/icon_close.png";
import {useTranslation} from "react-i18next";
import {BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line} from "recharts";
import moment from "moment";
import {amountDivideDecimals, floorPrecised} from "../web3";
import {getToken, getTokenList} from "../store";
import axios from "axios";
import {getProfitAndLoss} from "../api";
import notify from "./Toast";
import DatePicker from "react-datepicker";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

function ProfitAndLossChartModal({modal, toggle}) {
  const currentTime = Date.now();
  const {t} = useTranslation();
  const tokenList = getTokenList();
  const token = getToken();
  const [pnlData, setPnlData] = useState([]);
  const [selectedChartInterval, setselectedChartInterval] = useState(7);
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * selectedChartInterval));

  async function get30DayPnlData() {
    try {
      let PNLAPI = getProfitAndLoss(moment(currentTime).utc().subtract(selectedChartInterval, "days").format("YYYY-MM-DD"), moment(currentTime).utc().format("YYYY-MM-DD"));
      let response = await axios.get(PNLAPI, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.data && response.data.data.list && response.data.data.list) {
        const pnlListData = response.data.data.list.rows;
        const pnlCurrentData = response.data.data.current;
        setPnlData([...pnlListData, pnlCurrentData]);
      }
    } catch (error) {
      console.error("GetOrderList error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    try {
      if (modal && token) {
        get30DayPnlData();
      }
    } catch (error) {
      console.log("get30DayPnlData err", error);
    }
  }, [modal, selectedDate, selectedChartInterval]);

  let pnlDailyData = pnlData.map((item) => {
    const _dateFrom = item.dateFrom;
    const _profitAndLoss = parseInt(item.profitAndLoss);
    const obj = {
      dateFrom: _dateFrom && moment.utc(_dateFrom).format("MM/DD"),
      profitAndLoss: Number(amountDivideDecimals(_profitAndLoss, tokenList.find((token) => token.tokenName === "USD").decimal)),
    };
    return obj;
  });

  pnlDailyData.sort(function (a, b) {
    var keyA = a.dateFrom;
    var keyB = b.dateFrom;
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  const cf = {}; // store running totals in here
  const pnlCumulativeData = pnlDailyData.map(({dateFrom, ...props}) => ({
    dateFrom,
    ...Object.fromEntries(
      Object.entries(props).map(([key, val]) => [
        key,
        (cf[key] = (cf[key] ?? 0) + val), // value is the result of the assignment
      ])
    ),
  }));

  function getPeriodPNL() {
    let pnlValue = 0;
    if (pnlData) {
      pnlValue = pnlData.reduce((accumulator, item) => {
        return Number(accumulator) + Number(item.profitAndLoss);
      }, 0);
    }
    return pnlValue;
  }

  const CustomTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
      return (
        <div className={style["tool-tip-container"]}>
          <span className="label">{`${label} : $${floorPrecised(payload[0].value, 2)}`}</span>
        </div>
      );
    }
    return null;
  };

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

  const handleChartIntervalChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setselectedChartInterval(newAlignment);
    }
  };

  return (
    <div>
      <Modal isOpen={modal && modal} toggle={toggle} style={{maxWidth: "1200px"}}>
        <ModalBody style={{padding: 0}}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggle}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={`${style["title"]} ${style["title-left"]}`}> {t("pnlAnalysis")}</div>

            <div className={style["charts-container"]}>
              <div className={style["chart-container"]}>
                <div className={style["header"]}>
                  <div className={style["picker-wrap"]}>
                    <span className={style["li-label"]}>
                      {t("dailyPNL")} ({t("since")} {currentTime && selectedChartInterval && moment(currentTime).utc().subtract(selectedChartInterval, "days").format("YYYY-MM-DD")})
                    </span>
                  </div>
                  <div className={style["time-wrap"]}>
                    <span className={style["li-label"]}>{t("time")}:</span>
                    <ToggleButtonGroup color="secondary" value={selectedChartInterval} exclusive onChange={handleChartIntervalChange}>
                      <ToggleButton value={30}>30{t("Day")}</ToggleButton>
                      <ToggleButton value={7}>7{t("Day")}</ToggleButton>
                      <ToggleButton value={3}>3{t("Day")}</ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                </div>
                {pnlDailyData && pnlDailyData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        width={500}
                        height={300}
                        data={pnlDailyData}
                        margin={{
                          top: 5,
                          right: 0,
                          left: 20,
                          bottom: 5,
                        }}
                        // onMouseEnter={() => {
                        //   console.log("pv");
                        // }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis className={style["text-color"]} margin={{bottom: 50}} dataKey="dateFrom" />
                        <YAxis className={style["text-color"]} name="$" />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: "none"}} />
                        <Bar dataKey="profitAndLoss" className={style["chart-bar"]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  //
                  <div className={style["no-record"]}>{t("noRecord")}</div>
                )}
              </div>
              <div className={style["chart-container"]}>
                {/* <div className={style["header"]}>
                  <div className={style["li-title"]}>{t("cumulativePNL")}:</div>
                  <div className={`${style["li-value"]} ${style[`${getPnlColor(getCumulativePercentage())}`]}`}>{pnlData && getCumulativePercentage().toFixed(2)}%</div>
                </div> */}
                <div className={style["header"]}>
                  <div className={style["li-title"]}>
                    {`${t("cumulativePNL")}`}({`${t("since")} ${currentTime && moment(currentTime).utc().subtract(selectedChartInterval, "days").format("YYYY-MM-DD")}`}
                    ):
                  </div>
                  <div className={`${style["li-value"]} ${style[`${getPnlColor(getPeriodPNL())}`]}`}>${pnlData && floorPrecised(amountDivideDecimals(getPeriodPNL(), tokenList.find((token) => token.tokenName === "USD").decimal), 2)}</div>
                </div>
                {pnlCumulativeData && pnlCumulativeData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        width={500}
                        height={300}
                        // className={style["chart"]}
                        data={pnlCumulativeData}
                        margin={{
                          top: 5,
                          right: 0,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis margin={{bottom: 50}} dataKey="dateFrom" allowDataOverflow={true} interval={""} padding={{right: 20}} />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        {/* <Tooltip /> */}
                        {/* <Legend /> */}
                        <Line type="monotone" dataKey="profitAndLoss" className={style["pnl-stoke"]} activeDot={{r: 8}} />
                        {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className={style["no-record"]}>{t("noRecord")}</div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default ProfitAndLossChartModal;
