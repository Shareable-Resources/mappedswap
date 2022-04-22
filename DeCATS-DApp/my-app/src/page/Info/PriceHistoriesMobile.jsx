import style from "./PoolInfo.module.scss";
import {useState, useEffect, useRef} from "react";
import axios from "axios";
import {getToken} from "../../store";
import {tokenBlockPriceList} from "../../api";
import {useTranslation} from "react-i18next";
import notify from "../../component/Toast";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import {amountDivideDecimals, floorPrecised} from "../../web3";
import InfiniteScroll from "react-infinite-scroll-component";
import { getAnalytics, logEvent } from "firebase/analytics";

const PriceHistoriesMobile = ({pairName, pairInfo, baseToken, tradeToken}) => {
  const format1 = "";
  const {t} = useTranslation();
  const token = getToken();
  const ITEM_PER_PAGE = 13;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(ITEM_PER_PAGE);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().valueOf() - 1000 * 60 * 60));
  const [endDate, setEndDate] = useState(new Date());
  const scrollWindow = useRef(null)

  async function getList() {
      // show the whole minute from base of start to end of end date in seconds to get all records
    let startDateInput = moment(startDate).set('second', 0).utc().format(format1);
    let endDateInput = moment(endDate).set('second', 59).utc().format(format1);

    // start > end date just show end date 
    if (moment().diff(startDateInput, endDateInput) < 0) {
      startDateInput = moment(endDate).set('second', 0).utc().format(format1);;
    }

    try {
      let BLCOKPRICEAPI = tokenBlockPriceList(pageSize, page, pairName, startDateInput, endDateInput);
      let response = await axios.get(BLCOKPRICEAPI);

      if (response && response.data && response.data.data && response.data.data) {
        const dataList = response.data.data.rows;
        if (!dataList[0]) {
          notify("warn", t("noRecord"));
        } else {
          setData(response.data.data.rows);
        }
      }
    } catch (error) {
      console.error("getInterestList error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getNextList() {
    let startDateInput = moment(startDate).set('second', 0).utc().format(format1);
    let endDateInput = moment(endDate).set('second', 59).utc().format(format1);
    // start > end date just show end date 
    if (moment().diff(startDateInput, endDateInput) < 0) {
      startDateInput = moment(endDate).set('second', 0).utc().format(format1);
    }

    setPage(page + 1);
    try {
      let BLCOKPRICEAPI = tokenBlockPriceList(pageSize, page + 1, pairName, startDateInput, endDateInput);
      let response = await axios.get(BLCOKPRICEAPI);

      if (response && response.data && response.data.data && response.data.data) {
        setData([...data, ...response.data.data.rows]);
      }
    } catch (error) {
      console.error("getInterestList error", error);
      notify("warn", t("networkError"));
    }
  }

  function getTradeTokenPrice(reserve0, reserve1) {
    if (pairName && pairInfo) {
      let tradeTokenPrice = 0;
      let baseTokenReserve = amountDivideDecimals(reserve1, baseToken.decimal);
      let tradeTokenReserve = amountDivideDecimals(reserve0, tradeToken.decimal);

      if (pairName.includes("ETH") && pairInfo.ethmPairInfo.token0Name === "USDM") {
        baseTokenReserve = amountDivideDecimals(reserve0, baseToken.decimal);
        tradeTokenReserve = amountDivideDecimals(reserve1, tradeToken.decimal);
      } else if (pairName.includes("BTC") && pairInfo.btcmPairInfo.token0Name === "USDM") {
        baseTokenReserve = amountDivideDecimals(reserve0, baseToken.decimal);
        tradeTokenReserve = amountDivideDecimals(reserve1, tradeToken.decimal);
      }
      tradeTokenPrice = baseTokenReserve / tradeTokenReserve;
      return tradeTokenPrice;
    } else {
      return 0;
    }
  }

  function submitButtonOnClick() {
    if (scrollWindow.current) {
      // scrollWindow.current.scrollIntoView();
    }
    getList();
    logEvent(getAnalytics(), `info_pool_confirm_submit`);
  }

  useEffect(() => {
    try {
      getList(page, pageSize);
    } catch (error) {
      console.log("getList err", error);
    }
  }, [token, pairName]);

  return (
    <InfiniteScroll dataLength={pageSize} next={getNextList} scrollThreshold={0.75} hasMore={true} scrollableTarget="scrollableDiv">
    <div id="scrollableDiv" className={style["history-record-wrap-mobile"]}>
          <div className={style["pickers-container"]}>
            <div className={style["picker-wrap"]}>
              <span className={style["li-label"]}>{t("startTime")}:</span>
              <span className={style["li-value"]}>
                <DatePicker popperClassName={style["popperContainer"]} selected={startDate} onChange={(date) => setStartDate(date)} showTimeSelect dateFormat="M/d/yyyy, H:mm" />
              </span>
            </div>
            <div className={style["picker-wrap"]}>
              <span className={style["li-label"]}>{t("endTime")}:</span>
              <span className={style["li-value"]}>
                <DatePicker popperClassName={style["popperContainer"]} selected={endDate} onChange={(date) => setEndDate(date)} showTimeSelect dateFormat="M/d/yyyy, H:mm" />
              </span>
            </div>
            <div className={style["submit-button"]}>
              {" "}
              <span onClick={() => submitButtonOnClick()}>{t("submit")}</span>
            </div>
          </div>
          {data && data[0] ? (
            <div className={style["history-record"]}>
              <div className={style["table-wrapper"]}>
                <table>
                  <thead>
                    <tr>
                      <th className={style["time"]}>{t("time")}</th>
                      <th className={style["blocknumber"]}>{t("blockNumber")}</th>
                      <th className={style["price"]}>{t("price")}</th>
                    </tr>
                  </thead>
                  <tbody ref={scrollWindow}>
                    {data &&
                      data[0] &&
                      data.map((element) => {
                        return (
                          <tr key={element.id && element.id}>
                            <td className={style["time"]}>{element.createdDate && moment(element.createdDate).format("YYYY-MM-DD HH:mm")}</td>
                            <td className={style["blocknumber"]}>{element.blockNo && element.blockNo}</td>
                            <td className={style["price"]}>{floorPrecised(getTradeTokenPrice(element.reserve0, element.reserve1), 2)}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                <div className={style["mobile-histories"]}>
                  {data.map((element) => {
                    return (
                      <div className={style["card-container"]} key={element.blockNo}>
                        <div className={style["card-header"]}>
                          <span>{element.createdDate && moment(element.createdDate).format("YYYY-MM-DD HH:mm")}</span>
                          <span>{element.blockNo && element.blockNo}</span>
                        </div>
                        <div className={style["card-body"]}>
                          <span className={style["price"]}>{t("price")}</span>
                          <span>{floorPrecised(getTradeTokenPrice(element.reserve0, element.reserve1), 2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={style["no-record-container"]}></div>
            )}
        </div>
      </InfiniteScroll>
  );
};

export default PriceHistoriesMobile;
