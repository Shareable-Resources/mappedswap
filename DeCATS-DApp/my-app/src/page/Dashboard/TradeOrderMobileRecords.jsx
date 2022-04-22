import style from "../TradeQuote/TradeQuote.module.scss";
import ReactPaginate from "react-paginate";
import TradeOrderMobileRecord from "./TradeOrderMobileRecord";
import {transactionHistory} from "../../api";
import {useState, useEffect} from "react";
import axios from "axios";
import {getToken} from "../../store";
import {useTranslation} from "react-i18next";
import notify from "../../component/Toast";
import InfiniteScroll from "react-infinite-scroll-component";

const TradeOrderMobileRecords = ({historyRecordLastUpdated}) => {
  const {t} = useTranslation();
  const token = getToken();
  const ITEM_PER_PAGE = 8;
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(ITEM_PER_PAGE);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [inputHistoryRecordLastUpdated, setInputHistoryRecordLastUpdated] = useState(historyRecordLastUpdated);

  async function getList() {
    try {
      let TRANSACTIONAPI = transactionHistory(ITEM_PER_PAGE, page);
      let response = await axios.get(TRANSACTIONAPI, {
        headers: {
          Authorization: token,
        },
      });
      if (response.data.success && response.data.data.rows) {
        setHasMore(true);
        setData(response.data.data.rows);
        setTotal(response.data.data.count);
      }
    } catch (error) {
      console.error("GetOrderList error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getNextList() {
    try {
      let TRANSACTIONAPI = transactionHistory(ITEM_PER_PAGE, page + 1);
      let response = await axios.get(TRANSACTIONAPI, {
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
          setPage(page + 1);
        }
      }
    } catch (error) {
      console.error("GetOrderList error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    try {
      if (token) {
        getList();
      }
    } catch (error) {
      console.log("getList err", error);
    }
  }, [inputHistoryRecordLastUpdated]);

  useEffect(() => {
    if (historyRecordLastUpdated !== inputHistoryRecordLastUpdated) {
      setInputHistoryRecordLastUpdated(historyRecordLastUpdated);
    }
  }, [historyRecordLastUpdated]);

  console.log("data", data);

  return (
    <>
      {data && data[0] ? (
        <InfiniteScroll
          dataLength={pageSize}
          next={getNextList}
          scrollThreshold={0.75}
          hasMore={hasMore}
          // loader={<div className="d-flex align-item-center justify-content-center" style={{ padding: "30px" }}>Loading...</div>}
          scrollableTarget="scrollableMobileOrder"
        >
          <div className={style["body"]} id="scrollableMobileOrderBody">
            {data.map((element) => {
              return (
                <TradeOrderMobileRecord
                  key={element.id}
                  id={element.id}
                  sellToken={element.sellToken}
                  sellAmount={element.sellAmount}
                  buyToken={element.buyToken}
                  buyAmount={element.buyAmount}
                  txHash={element.txHash}
                  txTime={element.txTime}
                  txStatus={element.txStatus}
                  gasFee={element.gasFee}
                  stopout={element.stopout}
                />
              );
            })}
          </div>
        </InfiniteScroll>
      ) : (
        <div className={style["no-record"]}>{t("noRecord")}</div>
      )}
    </>
  );
};

export default TradeOrderMobileRecords;
