import style from "./PoolInfo.module.scss";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { tokenBlockPriceList } from "../../api";
import { useTranslation } from "react-i18next";
import notify from "../../component/Toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./ReactDatepicker.scss";
import moment from "moment";
import {amountDivideDecimals, floorPrecised} from "../../web3";
import InfiniteScroll from "react-infinite-scroll-component";
import { getIsMobile } from "../../store";
import { getAnalytics, logEvent } from "firebase/analytics";

const PriceHistories = ({ pairName, pairInfo, baseToken, tradeToken }) => {
  const isMobile = getIsMobile();
  const format1 = "";
  const { t } = useTranslation();
  const ITEM_PER_PAGE = 20;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(ITEM_PER_PAGE);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().valueOf() - 1000 * 60 * 60));
  const [endDate, setEndDate] = useState(new Date());
  const scrollWindow = useRef(null);


  async function getList() {
    setPage(0)
    // show the whole minute from base of start to end of end date in seconds to get all records
    let startDateInput = moment(startDate.setSeconds(0)).utc();
    let endDateInput = moment(endDate.setSeconds(59)).utc();

    // start > end date just show end date 
    if (endDateInput.diff(startDateInput) <= 0) {
      setStartDate(endDate);
      startDateInput = moment(endDate.setSeconds(0)).utc();
      endDateInput = moment(endDate.setSeconds(59)).utc();
      console.log(startDateInput, endDateInput)
    }

    try {
      let BLCOKPRICEAPI = tokenBlockPriceList(
        ITEM_PER_PAGE,
        0,
        pairName,
        startDateInput,
        endDateInput
      );
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
    // show the whole minute from base of start to end of end date in seconds to get all records
    let startDateInput = moment(startDate).set('second', 0).utc().format(format1);
    let endDateInput = moment(endDate).set('second', 59).utc().format(format1);

    // start > end date just show end date 
    if (moment().diff(startDateInput, endDateInput) < 0) {
      startDateInput = moment(endDate).set('second', 0).utc().format(format1);
    }

    setPage(page + 1);
    console.log(page)
    try {
      let BLCOKPRICEAPI = tokenBlockPriceList(
        ITEM_PER_PAGE,
        page + 1,
        pairName,
        startDateInput,
        endDateInput
      );
      let response = await axios.get(BLCOKPRICEAPI);
      if (response && response.data && response.data.data && response.data.data) {
        setData([...data, ...response.data.data.rows]);
        setPageSize(pageSize + ITEM_PER_PAGE);
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
      scrollWindow.current.scrollIntoView();
    }
    getList();
    logEvent(getAnalytics(), `info_pool_confirm_submit`);
  }

  useEffect(() => {
    try {
      getList();
    } catch (error) {
      console.log("getList err", error);
    }
  }, [tradeToken]);

  // const handleDateChangeRaw = (e) => {
  //   e.preventDefault();
  // }

  const pickerRef = useRef(null);

  useEffect(() => {
    if (isMobile && pickerRef.current !== null) {
      pickerRef.current.input.readOnly = true;
    }
  }, [isMobile, pickerRef])

  return (
    <div className={style["history-record-wrap"]}>
      {!isMobile && (
        <div className={style["pickers-container"]}>
          <div className={style["title"]}>
            <span>{t("priceHistory")}</span>
          </div>
          <div className={style["pickers-button-wrap"]}>
            <div className={style["picker-wrap"]}>
              <span className={style["li-label"]}>{t("startTime")}:</span>
              <span className={style["li-value"]}>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  showTimeSelect
                  dateFormat="M/d/yyyy, H:mm"
                />
              </span>
            </div>
            <div className={style["picker-wrap"]}>
              <span className={style["li-label"]}>{t("endTime")}:</span>
              <span className={style["li-value"]}>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  showTimeSelect
                  dateFormat="M/d/yyyy, H:mm"
                />
              </span>
            </div>
            <div className={style["submit-button"]}>
              {" "}
              <span onClick={() => submitButtonOnClick()}>{t("submit")}</span>
            </div>
          </div>
        </div>
      )}
      {isMobile && (
        <div className={`${style["pickers-container"]} ${style["mobile-pickers-container"]}`}>
          <div className={style["title"]}>
            <span>{t("priceHistory")}</span>
          </div>
          <div className={style["pickers-wrap"]}>
            <div className={style["picker-wrap"]}>
              <span className={style["li-label"]}>{t("startTime")}:</span>
              <span className={style["li-value"]}>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  showTimeSelect
                  dateFormat="M/d/yyyy, H:mm"
                  // onChangeRaw={handleDateChangeRaw}
                  ref={pickerRef}
                />
              </span>
            </div>
            <div className={style["picker-wrap"]}>
              <span className={style["li-label"]}>{t("endTime")}:</span>
              <span className={style["li-value"]}>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  showTimeSelect
                  dateFormat="M/d/yyyy, H:mm"
                  // onChangeRaw={handleDateChangeRaw}
                  ref={pickerRef}
                />
              </span>
            </div>
          </div>
          <div className={style["submit-button"]}>
            {" "}
            <span onClick={() => submitButtonOnClick()}>{t("submit")}</span>
          </div>
        </div>
      )}

      <div
        className={style["history-record"]}
        id={`scrollablePriceHistory-${tradeToken.tokenName}`}
      >
        <div className={`${style["table-wrapper"]} ${style["table-wrapper-header"]}`}>
          <table>
            <thead>
              <tr>
                <th className={style["time"]}>{t("time")}</th>
                <th className={style["blocknumber"]}>{t("blockNumber")}</th>
                <th className={style["price"]}>{t("price")}</th>
              </tr>
            </thead>
          </table>
        </div>
        {data && data[0] ? (
          <InfiniteScroll
            dataLength={pageSize}
            next={getNextList}
            scrollThreshold={0.75}
            height={280}
            hasMore={true}
          >
            <div className={style["table-wrapper"]}>
              <table>
                <tbody ref={scrollWindow}>
                  {data.map((element, index) => {
                    return (
                      <tr key={index}>
                        <td className={style["time"]}>
                          {element.createdDate &&
                            moment(element.createdDate).format("YYYY-MM-DD HH:mm")}
                        </td>
                        <td className={style["blocknumber"]}>
                          {element.blockNo && element.blockNo}
                        </td>
                        <td className={style["price"]}>
                          {floorPrecised(getTradeTokenPrice(element.reserve0, element.reserve1), 2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
        ) : (
          <div className={style["no-record"]}>{t("noRecord")}</div>
        )}
      </div>
    </div>
  );
};

export default PriceHistories;
