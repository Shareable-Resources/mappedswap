import style from "../TradeQuote/TradeQuote.module.scss";
import TradeInterestRecord from "./TradeInterestRecord";
import {useState, useEffect} from "react";
import axios from "axios";
import {getToken} from "../../store";
import {interestHistory} from "../../api";
import {useTranslation} from "react-i18next";
import notify from "../../component/Toast";
import InfiniteScroll from "react-infinite-scroll-component";

const TradeOrderMobileRecord = () => {
  const ITEM_PER_PAGE = 8;
  const {t} = useTranslation();
  const token = getToken();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(ITEM_PER_PAGE);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  async function getNextList() {
    setPage(page + 1);
    try {
      let INTERESTAPI = interestHistory(ITEM_PER_PAGE, page + 1);
      let response = await axios.get(INTERESTAPI, {
        headers: {
          Authorization: token,
        },
      });
      if (response.data.success && response.data.data.rows) {
        const dataList = response.data.data.rows;
        if (dataList.length === 0) {
          setHasMore(false);
        } else {
          setData([...data, ...response.data.data.rows]);
          setPageSize(pageSize + ITEM_PER_PAGE);
        }
      }
    } catch (error) {
      console.error("GetOrderList error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getList() {
    try {
      let INTERESTAPI = interestHistory(ITEM_PER_PAGE, page);
      let response = await axios.get(INTERESTAPI, {
        headers: {
          Authorization: token,
        },
      });

      if (response && response.data && response.data.data) {
        setData(response.data.data.rows);
      }
    } catch (error) {
      console.error("getInterestList error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    try {
      if (token) {
        getList(page, pageSize);
      }
    } catch (error) {
      console.log("getList err", error);
    }
  }, [token]);

  return (
    <>
      {data && data[0] ? (
        <InfiniteScroll
          dataLength={pageSize}
          next={getNextList}
          scrollThreshold={0.75}
          hasMore={hasMore}
          // loader={<div className="d-flex align-item-center justify-content-center" style={{ padding: "30px" }}>Loading...</div>}
          scrollableTarget="scrollableInterest"
        >
          <div className={style["table-wrapper"]} id="scrollableDiv">
            <table>
              <thead>
                <tr>
                  <th className={style["time"]}>{t("time")}</th>
                  <th className={style["currency"]}>{t("currency")}</th>
                  <th className={style["size"]}>{t("size")}</th>
                  <th className={style["rate"]}>{t("hourlyRate")}</th>
                  <th className={style["proceeds"]}>{t("proceeds")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((element) => {
                  return <TradeInterestRecord key={element.id} id={element.id} createdDate={element.createdDate} token={element.token} interest={element.interest} rate={element.rate} address={element.address} status={element.status} amount={element.amount} />;
                })}
              </tbody>
            </table>
          </div>
        </InfiniteScroll>
      ) : (
        <div className={style["no-record"]}>{t("noRecord")}</div>
      )}
    </>
  );
};

export default TradeOrderMobileRecord;
